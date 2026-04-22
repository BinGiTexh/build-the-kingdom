const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role === 'EMPLOYER' ? 'EMPLOYER' : 'JOBSEEKER',
        profile: {
          create: { name }
        }
      },
      include: { profile: true }
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, role: user.role, profile: user.profile }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, profile: user.profile }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify a Google token (ID token or access token) and return the user's email/name/picture
async function verifyGoogleToken(token) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    return ticket.getPayload();
  } catch (_idTokenError) {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Google userinfo returned ${res.status}`);
    const data = await res.json();
    if (!data.email) throw new Error('No email in Google response');
    return {
      email: data.email,
      email_verified: data.email_verified,
      given_name: data.given_name || '',
      family_name: data.family_name || '',
      picture: data.picture || '',
      sub: data.sub
    };
  }
}

router.post('/google', async (req, res) => {
  try {
    const { credential, googleToken, role = 'JOBSEEKER' } = req.body;
    const actualToken = credential || googleToken;

    if (!actualToken) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    let payload;
    try {
      payload = await verifyGoogleToken(actualToken);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid Google credential' });
    }

    if (!payload.email_verified) {
      return res.status(401).json({ error: 'Google email not verified' });
    }

    let user = await prisma.user.findUnique({
      where: { email: payload.email },
      include: { profile: true }
    });

    if (!user) {
      const name = [payload.given_name, payload.family_name].filter(Boolean).join(' ') || payload.email;
      user = await prisma.user.create({
        data: {
          email: payload.email,
          password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10),
          role: ['JOBSEEKER', 'EMPLOYER'].includes(role) ? role : 'JOBSEEKER',
          profile: {
            create: { name }
          }
        },
        include: { profile: true }
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, profile: user.profile }
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

router.post('/google/register', async (req, res) => {
  try {
    const { googleToken, role = 'JOBSEEKER', companyName, companyWebsite, companyDescription } = req.body;

    if (!googleToken) {
      return res.status(400).json({ error: 'Google token is required' });
    }

    let payload;
    try {
      payload = await verifyGoogleToken(googleToken);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    if (!payload.email_verified) {
      return res.status(401).json({ error: 'Google email not verified' });
    }

    const existing = await prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered. Please login instead.' });
    }

    const name = [payload.given_name, payload.family_name].filter(Boolean).join(' ') || payload.email;
    const validRole = ['JOBSEEKER', 'EMPLOYER'].includes(role) ? role : 'JOBSEEKER';

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: payload.email,
          password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10),
          role: validRole,
          profile: {
            create: { name }
          }
        },
        include: { profile: true }
      });

      if (validRole === 'EMPLOYER' && companyName) {
        const company = await tx.company.create({
          data: {
            name: companyName,
            website: companyWebsite || null,
            description: companyDescription || null
          }
        });
        await tx.user.update({
          where: { id: created.id },
          data: { companyId: company.id }
        });
      }

      return created;
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, role: user.role, profile: user.profile }
    });
  } catch (error) {
    console.error('Google OAuth registration error:', error);
    res.status(500).json({ error: 'Google registration failed' });
  }
});

module.exports = router;
