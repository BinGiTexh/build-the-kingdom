const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Pricing info (public)
router.get('/pricing', (req, res) => {
  if (process.env.STRIPE_ENABLED !== 'true') {
    return res.json({ enabled: false });
  }
  res.json({ enabled: true, ...paymentService.getPricing() });
});

// Create payment intent
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { amount, paymentType, jobId, description } = req.body;
    if (!amount || !paymentType) {
      return res.status(400).json({ error: 'amount and paymentType are required' });
    }

    const result = await paymentService.createPaymentIntent({
      userId: req.user.id,
      amount,
      currency: process.env.CURRENCY || 'USD',
      paymentType,
      jobId,
      description
    });

    res.json(result);
  } catch (err) {
    console.error('Payment intent error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Payment history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await paymentService.getPaymentHistory(req.user.id, {
      page: parseInt(page), limit: parseInt(limit)
    });
    res.json(result);
  } catch (err) {
    console.error('Payment history error:', err);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// Create subscription
router.post('/subscriptions', authenticateToken, requireRole(['EMPLOYER']), async (req, res) => {
  try {
    const { plan, paymentMethodId } = req.body;
    if (!plan || !paymentMethodId) {
      return res.status(400).json({ error: 'plan and paymentMethodId are required' });
    }
    const subscription = await paymentService.createSubscription({
      userId: req.user.id, plan, paymentMethodId
    });
    res.status(201).json(subscription);
  } catch (err) {
    console.error('Subscription error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Cancel subscription
router.delete('/subscriptions/:id', authenticateToken, async (req, res) => {
  try {
    const sub = await paymentService.cancelSubscription(req.params.id, req.user.id);
    res.json(sub);
  } catch (err) {
    console.error('Cancel subscription error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Process refund (admin only)
router.post('/refund', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { paymentId, reason } = req.body;
    if (!paymentId) return res.status(400).json({ error: 'paymentId is required' });

    const refund = await paymentService.processRefund({
      paymentId, reason, processedBy: req.user.id
    });
    res.json(refund);
  } catch (err) {
    console.error('Refund error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
