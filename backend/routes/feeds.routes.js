const express = require('express');
const router = express.Router();
const feedService = require('../services/feedIngestionService');
const prisma = require('../lib/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.post('/ingest', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { feedUrl, source = 'appcast' } = req.body;
    if (!feedUrl) return res.status(400).json({ error: 'feedUrl is required' });

    const results = await feedService.ingestFeed(feedUrl, source);
    res.json({
      success: true,
      message: `Imported ${results.created} jobs`,
      results
    });
  } catch (err) {
    console.error('Feed ingestion error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/jobs', async (req, res) => {
  const { source, limit = 100 } = req.query;
  const where = { feedSource: { not: null } };
  if (source) where.feedSource = source;

  const jobs = await prisma.job.findMany({
    where,
    orderBy: { feedImportedAt: 'desc' },
    take: parseInt(limit)
  });
  res.json(jobs);
});

router.get('/stats', authenticateToken, async (req, res) => {
  const stats = await prisma.job.groupBy({
    by: ['feedSource'],
    where: { feedSource: { not: null } },
    _count: true
  });
  res.json(stats);
});

module.exports = router;
