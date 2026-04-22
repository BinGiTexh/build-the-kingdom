const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('changeme123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password,
      role: 'ADMIN',
      profile: { create: { name: 'Admin User', title: 'Administrator' } }
    }
  });

  const employer = await prisma.user.upsert({
    where: { email: 'employer@example.com' },
    update: {},
    create: {
      email: 'employer@example.com',
      password,
      role: 'EMPLOYER',
      profile: { create: { name: 'Demo Company', title: 'HR Manager' } }
    }
  });

  await prisma.job.upsert({
    where: { id: 'seed-job-1' },
    update: {},
    create: {
      id: 'seed-job-1',
      title: 'Full Stack Developer',
      description: 'Looking for an experienced full stack developer to join our team.',
      location: 'Remote',
      type: 'FULL_TIME',
      salary: { min: 80000, max: 120000, currency: 'USD' },
      skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
      requirements: '3+ years experience with modern web technologies',
      companyId: employer.id,
      status: 'ACTIVE'
    }
  });

  await prisma.job.upsert({
    where: { id: 'seed-job-2' },
    update: {},
    create: {
      id: 'seed-job-2',
      title: 'UX Designer',
      description: 'Join our design team to create beautiful user experiences.',
      location: 'New York, NY',
      type: 'FULL_TIME',
      salary: { min: 70000, max: 100000, currency: 'USD' },
      skills: ['Figma', 'User Research', 'Prototyping'],
      requirements: '2+ years UX design experience',
      companyId: employer.id,
      status: 'ACTIVE'
    }
  });

  console.log('Seed complete:', { admin: admin.email, employer: employer.email });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
