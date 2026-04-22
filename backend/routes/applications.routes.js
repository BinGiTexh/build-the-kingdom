const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Apply to a job
router.post('/:jobId/apply', authenticateToken, requireRole(['JOBSEEKER']), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true }
    });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.status !== 'ACTIVE') return res.status(400).json({ error: 'Job is no longer accepting applications' });

    const existing = await prisma.application.findFirst({
      where: { jobId, userId: req.user.id }
    });
    if (existing) {
      return res.status(409).json({ error: 'You have already applied to this job' });
    }

    const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } });

    const application = await prisma.application.create({
      data: {
        jobId,
        userId: req.user.id,
        coverLetter,
        resumeUrl: profile?.resumeUrl || null,
        status: 'PENDING'
      }
    });

    // Notify the applicant
    await prisma.notification.create({
      data: {
        type: 'APPLICATION_UPDATE',
        title: `Application submitted for ${job.title}`,
        message: `You applied to ${job.title}${job.company ? ` at ${job.company.name}` : ''}`,
        recipientId: req.user.id,
        applicationId: application.id
      }
    });

    // Notify employer(s) at the company
    if (job.company) {
      const employers = await prisma.user.findMany({
        where: { companyId: job.company.id, role: 'EMPLOYER' },
        select: { id: true }
      });
      if (employers.length) {
        await prisma.notification.createMany({
          data: employers.map(emp => ({
            type: 'APPLICATION_UPDATE',
            title: `New application for ${job.title}`,
            message: `${req.user.email} applied to ${job.title}`,
            recipientId: emp.id,
            applicationId: application.id
          }))
        });
      }
    }

    res.status(201).json(application);
  } catch (err) {
    console.error('Apply error:', err);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// List applications for a job (employer who owns the job)
router.get('/:jobId/applications', authenticateToken, requireRole(['EMPLOYER', 'ADMIN']), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    if (req.user.role !== 'ADMIN') {
      const isOwner = req.user.companyId && req.user.companyId === job.companyId;
      if (!isOwner) return res.status(403).json({ error: 'Not authorized' });
    }

    const where = { jobId };
    if (status) where.status = status;

    const [applications, total] = await prisma.$transaction([
      prisma.application.findMany({
        where,
        include: {
          user: { include: { profile: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.application.count({ where })
    ]);

    res.json({
      applications,
      pagination: { total, pages: Math.ceil(total / parseInt(limit)), page: parseInt(page) }
    });
  } catch (err) {
    console.error('List applications error:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Update application status (employer)
router.patch('/:jobId/applications/:applicationId', authenticateToken, requireRole(['EMPLOYER', 'ADMIN']), async (req, res) => {
  try {
    const { jobId, applicationId } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'ACCEPTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const application = await prisma.application.findFirst({
      where: { id: applicationId, jobId },
      include: { job: true }
    });
    if (!application) return res.status(404).json({ error: 'Application not found' });

    if (req.user.role !== 'ADMIN') {
      const job = application.job;
      const isOwner = req.user.companyId && req.user.companyId === job.companyId;
      if (!isOwner) return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status }
    });

    await prisma.notification.create({
      data: {
        type: 'APPLICATION_UPDATE',
        title: `Application ${status.toLowerCase()}`,
        message: `Your application for ${application.job.title} has been ${status.toLowerCase()}`,
        recipientId: application.userId,
        applicationId: application.id
      }
    });

    res.json(updated);
  } catch (err) {
    console.error('Update application error:', err);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// List my applications (jobseeker)
router.get('/my-applications', authenticateToken, requireRole(['JOBSEEKER']), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = { userId: req.user.id };
    if (status) where.status = status;

    const [applications, total] = await prisma.$transaction([
      prisma.application.findMany({
        where,
        include: { job: { include: { company: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.application.count({ where })
    ]);

    res.json({
      applications,
      pagination: { total, pages: Math.ceil(total / parseInt(limit)), page: parseInt(page) }
    });
  } catch (err) {
    console.error('My applications error:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Withdraw application (jobseeker)
router.delete('/:jobId/applications/:applicationId', authenticateToken, requireRole(['JOBSEEKER']), async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await prisma.application.findFirst({
      where: { id: applicationId, userId: req.user.id }
    });
    if (!application) return res.status(404).json({ error: 'Application not found' });

    await prisma.application.delete({ where: { id: applicationId } });
    res.json({ message: 'Application withdrawn' });
  } catch (err) {
    console.error('Withdraw error:', err);
    res.status(500).json({ error: 'Failed to withdraw application' });
  }
});

module.exports = router;
