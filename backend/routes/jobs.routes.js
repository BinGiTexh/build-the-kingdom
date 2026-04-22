const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticateToken, optionalAuth, requireRole } = require('../middleware/auth');
const jobViewService = require('../services/jobViewService');

router.get('/', async (req, res) => {
  try {
    const { search, location, type, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { status: 'ACTIVE' };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }
    if (type) {
      where.type = type;
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        include: { company: { select: { id: true, name: true, logoUrl: true } } }
      }),
      prisma.job.count({ where })
    ]);

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('List jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const jobs = await jobViewService.getTrendingJobs(parseInt(req.query.limit) || 10);
    res.json(jobs);
  } catch (error) {
    console.error('Trending jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch trending jobs' });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { company: { select: { id: true, name: true, logoUrl: true, website: true, description: true } } }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    jobViewService.trackJobView({
      jobId: job.id,
      userId: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      referrer: req.headers.referer
    }).catch(() => {});

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

router.get('/:id/stats', authenticateToken, requireRole(['EMPLOYER', 'ADMIN']), async (req, res) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.companyId !== req.user.companyId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const [viewStats, applicationCount] = await Promise.all([
      jobViewService.getJobViewStats(job.id),
      prisma.application.count({ where: { jobId: job.id } })
    ]);

    res.json({ ...viewStats, applicationCount });
  } catch (error) {
    console.error('Job stats error:', error);
    res.status(500).json({ error: 'Failed to fetch job stats' });
  }
});

router.post('/', authenticateToken, requireRole(['EMPLOYER', 'ADMIN']), async (req, res) => {
  try {
    const { title, description, location, type, salary, skills, requirements, applyUrl } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({ error: 'Title, description, and location are required' });
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        location,
        type: type || 'FULL_TIME',
        salary: salary || {},
        skills: skills || [],
        requirements: requirements || '',
        applyUrl,
        companyId: req.user.companyId,
        status: 'ACTIVE'
      }
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

router.put('/:id', authenticateToken, requireRole(['EMPLOYER', 'ADMIN']), async (req, res) => {
  try {
    const existing = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Job not found' });
    if (existing.companyId !== req.user.companyId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { title, description, location, type, salary, skills, requirements, applyUrl } = req.body;
    const job = await prisma.job.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(location !== undefined && { location }),
        ...(type !== undefined && { type }),
        ...(salary !== undefined && { salary }),
        ...(skills !== undefined && { skills }),
        ...(requirements !== undefined && { requirements }),
        ...(applyUrl !== undefined && { applyUrl })
      }
    });

    res.json(job);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

router.patch('/:id/status', authenticateToken, requireRole(['EMPLOYER', 'ADMIN']), async (req, res) => {
  try {
    const existing = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Job not found' });
    if (existing.companyId !== req.user.companyId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { status } = req.body;
    if (!['ACTIVE', 'CLOSED', 'EXPIRED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const job = await prisma.job.update({
      where: { id: req.params.id },
      data: { status }
    });

    res.json(job);
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({ error: 'Failed to update job status' });
  }
});

router.delete('/:id', authenticateToken, requireRole(['EMPLOYER', 'ADMIN']), async (req, res) => {
  try {
    const existing = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Job not found' });
    if (existing.companyId !== req.user.companyId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.job.delete({ where: { id: req.params.id } });
    res.json({ message: 'Job deleted' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

module.exports = router;
