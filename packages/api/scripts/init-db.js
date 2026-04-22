const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Create admin user
    const seedPassword = process.env.SEED_ADMIN_PASSWORD;
    if (!seedPassword) {
      throw new Error('SEED_ADMIN_PASSWORD env var is required. Set it before running init-db.');
    }
    const hashedPassword = await bcrypt.hash(seedPassword, 10);
    await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN',
        profile: {
          create: {
            name: 'Admin User',
            title: 'System Administrator'
          }
        }
      }
    });

    // Create test employer
    await prisma.user.create({
      data: {
        email: 'employer@example.com',
        password: hashedPassword,
        role: 'EMPLOYER',
        profile: {
          create: {
            name: 'Test Company',
            title: 'HR Manager'
          }
        }
      }
    });

    // Create test job seeker
    await prisma.user.create({
      data: {
        email: 'jobseeker@example.com',
        password: hashedPassword,
        role: 'JOBSEEKER',
        profile: {
          create: {
            name: 'John Doe',
            title: 'Software Developer',
            skills: ['JavaScript', 'React', 'Node.js']
          }
        }
      }
    });

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

