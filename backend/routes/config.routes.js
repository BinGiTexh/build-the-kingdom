const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

router.get('/', (req, res) => {
  res.json({
    siteName: process.env.SITE_NAME || 'Job Platform',
    tagline: process.env.SITE_TAGLINE || 'Find Your Dream Job',
    logo: process.env.LOGO_URL || '/logo.svg',
    currency: process.env.CURRENCY || 'USD',
    currencySymbol: process.env.CURRENCY_SYMBOL || '$',
    primaryColor: process.env.PRIMARY_COLOR || '#2563EB',
    secondaryColor: process.env.SECONDARY_COLOR || '#10B981',
    stripeEnabled: process.env.STRIPE_ENABLED === 'true',
    feedIngestEnabled: process.env.FEED_INGEST_ENABLED === 'true',
  });
});

router.get('/region', (req, res) => {
  res.json({
    currency: process.env.CURRENCY || 'USD',
    timezone: process.env.TIMEZONE || 'UTC',
    language: process.env.LANGUAGE || 'en',
    theme: {
      colors: {
        primary: process.env.PRIMARY_COLOR || '#2563EB',
        secondary: process.env.SECONDARY_COLOR || '#10B981',
      }
    }
  });
});

router.get('/stats', async (req, res) => {
  try {
    const [jobCount, companyCount, userCount] = await Promise.all([
      prisma.job.count({ where: { status: 'ACTIVE' } }),
      prisma.company.count(),
      prisma.user.count({ where: { role: 'JOBSEEKER' } })
    ]);
    res.json({ jobCount, companyCount, userCount });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
