const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  }
});

const photoUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  }
});

const resumeUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  }
});

// Get my profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true, company: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const profile = user.profile || {};
    const requiredFields = ['name'];
    if (user.role === 'JOBSEEKER') requiredFields.push('title', 'skills');
    const filledFields = requiredFields.filter(f => {
      const val = profile[f];
      return val && (Array.isArray(val) ? val.length > 0 : true);
    });
    const completionPercentage = Math.round((filledFields.length / requiredFields.length) * 100);

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      company: user.company,
      completionPercentage
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { name, title, bio, location, phoneNumber, skills, education, experience } = req.body;

    const profile = await prisma.profile.upsert({
      where: { userId: req.user.id },
      update: {
        ...(name !== undefined && { name }),
        ...(title !== undefined && { title }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(skills !== undefined && { skills }),
        ...(education !== undefined && { education }),
        ...(experience !== undefined && { experience })
      },
      create: {
        userId: req.user.id,
        name: name || '',
        title, bio, location, phoneNumber,
        skills: skills || [],
        education, experience
      }
    });

    res.json(profile);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload profile photo
router.post('/me/photo', authenticateToken, photoUpload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No valid image file provided' });

    const existing = await prisma.profile.findUnique({ where: { userId: req.user.id } });
    if (existing?.photoUrl) {
      const oldPath = path.join(uploadsDir, path.basename(existing.photoUrl));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const photoUrl = `/uploads/${req.file.filename}`;
    const profile = await prisma.profile.upsert({
      where: { userId: req.user.id },
      update: { photoUrl },
      create: { userId: req.user.id, name: '', photoUrl }
    });

    res.json({ photoUrl: profile.photoUrl });
  } catch (err) {
    console.error('Photo upload error:', err);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// Upload resume
router.post('/me/resume', authenticateToken, requireRole(['JOBSEEKER']), resumeUpload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No valid resume file provided' });

    const existing = await prisma.profile.findUnique({ where: { userId: req.user.id } });
    if (existing?.resumeUrl) {
      const oldPath = path.join(uploadsDir, path.basename(existing.resumeUrl));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const resumeUrl = `/uploads/${req.file.filename}`;
    const profile = await prisma.profile.upsert({
      where: { userId: req.user.id },
      update: { resumeUrl, resumeFileName: req.file.originalname },
      create: { userId: req.user.id, name: '', resumeUrl, resumeFileName: req.file.originalname }
    });

    res.json({ resumeUrl: profile.resumeUrl, resumeFileName: profile.resumeFileName });
  } catch (err) {
    console.error('Resume upload error:', err);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

// Saved jobs
router.get('/saved-jobs', authenticateToken, async (req, res) => {
  try {
    const saved = await prisma.savedJob.findMany({
      where: { userId: req.user.id },
      include: { job: { include: { company: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(saved);
  } catch (err) {
    console.error('Saved jobs error:', err);
    res.status(500).json({ error: 'Failed to fetch saved jobs' });
  }
});

router.post('/saved-jobs/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const saved = await prisma.savedJob.create({
      data: { jobId, userId: req.user.id }
    });
    res.status(201).json(saved);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Job already saved' });
    console.error('Save job error:', err);
    res.status(500).json({ error: 'Failed to save job' });
  }
});

router.delete('/saved-jobs/:jobId', authenticateToken, async (req, res) => {
  try {
    await prisma.savedJob.deleteMany({
      where: { jobId: req.params.jobId, userId: req.user.id }
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Unsave job error:', err);
    res.status(500).json({ error: 'Failed to unsave job' });
  }
});

module.exports = router;
