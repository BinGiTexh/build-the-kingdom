const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticateToken, requireRole } = require('../middleware/auth');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const logoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, `logo-${Date.now()}${path.extname(file.originalname)}`)
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.svg'];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  }
});

// Get my company
router.get('/mine', authenticateToken, requireRole(['EMPLOYER']), async (req, res) => {
  try {
    if (!req.user.companyId) {
      return res.json(null);
    }
    const company = await prisma.company.findUnique({
      where: { id: req.user.companyId },
      include: { jobs: { where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } } }
    });
    res.json(company);
  } catch (err) {
    console.error('Get company error:', err);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// Create company
router.post('/', authenticateToken, requireRole(['EMPLOYER']), async (req, res) => {
  try {
    const { name, description, location, website, industry } = req.body;
    if (!name) return res.status(400).json({ error: 'Company name is required' });

    const company = await prisma.$transaction(async (tx) => {
      const c = await tx.company.create({
        data: { name, description, location, website, industry }
      });
      await tx.user.update({
        where: { id: req.user.id },
        data: { companyId: c.id }
      });
      return c;
    });

    res.status(201).json(company);
  } catch (err) {
    console.error('Create company error:', err);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// Update company
router.put('/mine', authenticateToken, requireRole(['EMPLOYER']), async (req, res) => {
  try {
    if (!req.user.companyId) return res.status(404).json({ error: 'No company found' });

    const { name, description, location, website, industry } = req.body;
    const company = await prisma.company.update({
      where: { id: req.user.companyId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(industry !== undefined && { industry })
      }
    });
    res.json(company);
  } catch (err) {
    console.error('Update company error:', err);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// Upload logo
router.post('/mine/logo', authenticateToken, requireRole(['EMPLOYER']), logoUpload.single('logo'), async (req, res) => {
  try {
    if (!req.user.companyId) return res.status(404).json({ error: 'No company found' });
    if (!req.file) return res.status(400).json({ error: 'No valid image provided' });

    const existing = await prisma.company.findUnique({ where: { id: req.user.companyId } });
    if (existing?.logoUrl) {
      const oldPath = path.join(uploadsDir, path.basename(existing.logoUrl));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const logoUrl = `/uploads/${req.file.filename}`;
    const company = await prisma.company.update({
      where: { id: req.user.companyId },
      data: { logoUrl }
    });
    res.json({ logoUrl: company.logoUrl });
  } catch (err) {
    console.error('Logo upload error:', err);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
});

// Public company profile
router.get('/:id', async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: {
        jobs: { where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' }, take: 20 }
      }
    });
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (err) {
    console.error('Get company error:', err);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

module.exports = router;
