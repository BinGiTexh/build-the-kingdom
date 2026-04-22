const prisma = require('../lib/prisma');

class JobViewService {
  async trackJobView({ jobId, userId, ipAddress, userAgent, referrer }) {
    if (userId) {
      const recent = await prisma.jobView.findFirst({
        where: {
          jobId, userId,
          createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }
        }
      });
      if (recent) return recent;
    }

    return prisma.jobView.create({
      data: { jobId, userId, ipAddress, userAgent, referrer }
    });
  }

  async getJobViewStats(jobId) {
    const [totalViews, uniqueViewers, last7Days] = await Promise.all([
      prisma.jobView.count({ where: { jobId } }),
      prisma.jobView.groupBy({ by: ['userId'], where: { jobId, userId: { not: null } } }).then(r => r.length),
      prisma.jobView.count({
        where: { jobId, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
      })
    ]);

    return { totalViews, uniqueViewers, last7Days };
  }

  async getTrendingJobs(limit = 10) {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const views = await prisma.jobView.groupBy({
      by: ['jobId'],
      where: { createdAt: { gte: since } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit
    });

    if (!views.length) return [];
    const jobIds = views.map(v => v.jobId);
    const jobs = await prisma.job.findMany({
      where: { id: { in: jobIds }, status: 'ACTIVE' },
      include: { company: true }
    });

    return views.map(v => ({
      ...jobs.find(j => j.id === v.jobId),
      viewCount: v._count.id
    })).filter(j => j.id);
  }
}

module.exports = new JobViewService();
