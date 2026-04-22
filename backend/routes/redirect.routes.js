const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

router.get('/apply/:jobId', async (req, res) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.jobId } });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    await prisma.job.update({
      where: { id: job.id },
      data: { clickCount: { increment: 1 } }
    });

    if (job.externalApplyUrl) return res.redirect(job.externalApplyUrl);
    res.redirect(`/jobs/${job.id}/apply`);
  } catch (err) {
    console.error('Redirect error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

module.exports = router;
