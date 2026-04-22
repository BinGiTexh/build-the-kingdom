const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');

// List notifications with pagination/filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;

    const where = {
      recipientId: req.user.id,
      dismissed: false,
      ...(status && status !== 'ALL' && { status }),
      ...(type && { type })
    };

    const [notifications, total] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        include: {
          application: {
            include: {
              job: { select: { id: true, title: true, company: { select: { id: true, name: true } } } }
            }
          }
        }
      }),
      prisma.notification.count({ where })
    ]);

    res.json({
      data: notifications,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        page: parseInt(page)
      }
    });
  } catch (err) {
    console.error('List notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Unread count
router.get('/count', authenticateToken, async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { recipientId: req.user.id, status: 'UNREAD', dismissed: false }
    });
    res.json({ count });
  } catch (err) {
    console.error('Notification count error:', err);
    res.status(500).json({ error: 'Failed to get count' });
  }
});

// Mark all read
router.patch('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const result = await prisma.notification.updateMany({
      where: { recipientId: req.user.id, status: 'UNREAD' },
      data: { status: 'READ' }
    });
    res.json({ success: true, updatedCount: result.count });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ error: 'Failed to mark notifications' });
  }
});

// Mark one as read
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await prisma.notification.findFirst({
      where: { id: req.params.id, recipientId: req.user.id }
    });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });

    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { status: 'READ' }
    });
    res.json(updated);
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Dismiss notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await prisma.notification.findFirst({
      where: { id: req.params.id, recipientId: req.user.id }
    });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });

    await prisma.notification.update({
      where: { id: req.params.id },
      data: { dismissed: true }
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Dismiss error:', err);
    res.status(500).json({ error: 'Failed to dismiss notification' });
  }
});

module.exports = router;
