const prisma = require('../lib/prisma');

class PaymentService {
  constructor() {
    this.stripe = null;
    this.enabled = process.env.STRIPE_ENABLED === 'true';
    if (this.enabled && process.env.STRIPE_SECRET_KEY) {
      this.stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    }
  }

  assertEnabled() {
    if (!this.enabled || !this.stripe) {
      throw new Error('Stripe payments are not enabled');
    }
  }

  getPricing() {
    return {
      currency: process.env.CURRENCY || 'USD',
      jobPosting: parseInt(process.env.STRIPE_JOB_POSTING_PRICE || '4999'),
      featuredListing: parseInt(process.env.STRIPE_FEATURED_LISTING_PRICE || '9999'),
      subscriptions: {
        BASIC: { monthly: 2999, jobPostingLimit: 10, featuredListings: 0 },
        PREMIUM: { monthly: 7999, jobPostingLimit: 50, featuredListings: 5 }
      }
    };
  }

  async createPaymentIntent({ userId, amount, currency, paymentType, jobId, description, metadata }) {
    this.assertEnabled();

    const intent = await this.stripe.paymentIntents.create({
      amount,
      currency: (currency || process.env.CURRENCY || 'USD').toLowerCase(),
      metadata: { userId, paymentType, jobId: jobId || '', ...metadata }
    });

    const payment = await prisma.payment.create({
      data: {
        stripePaymentId: intent.id,
        userId,
        amount,
        currency: currency || process.env.CURRENCY || 'USD',
        status: 'PENDING',
        paymentType,
        description,
        jobId,
        stripeClientSecret: intent.client_secret,
        metadata
      }
    });

    return { clientSecret: intent.client_secret, paymentId: payment.id };
  }

  async confirmPayment(stripePaymentId) {
    const payment = await prisma.payment.findUnique({
      where: { stripePaymentId }
    });
    if (!payment) throw new Error('Payment not found');

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'SUCCEEDED', processedAt: new Date() }
    });

    if (payment.paymentType === 'JOB_POSTING' && payment.jobId) {
      await prisma.job.update({
        where: { id: payment.jobId },
        data: { status: 'ACTIVE' }
      });
    }

    return payment;
  }

  async createSubscription({ userId, plan, paymentMethodId }) {
    this.assertEnabled();
    const pricing = this.getPricing();
    const planConfig = pricing.subscriptions[plan];
    if (!planConfig) throw new Error('Invalid plan');

    let user = await prisma.user.findUnique({ where: { id: userId } });
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        payment_method: paymentMethodId,
        invoice_settings: { default_payment_method: paymentMethodId }
      });
      stripeCustomerId = customer.id;
    }

    const sub = await this.stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price_data: {
        currency: (process.env.CURRENCY || 'USD').toLowerCase(),
        product_data: { name: `${plan} Plan` },
        unit_amount: planConfig.monthly,
        recurring: { interval: 'month' }
      }}],
      metadata: { userId, plan }
    });

    return prisma.subscription.create({
      data: {
        stripeSubscriptionId: sub.id,
        userId,
        plan,
        status: 'ACTIVE',
        amount: planConfig.monthly,
        currency: process.env.CURRENCY || 'USD',
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        jobPostingLimit: planConfig.jobPostingLimit,
        featuredListings: planConfig.featuredListings
      }
    });
  }

  async cancelSubscription(subscriptionId, userId) {
    this.assertEnabled();
    const sub = await prisma.subscription.findFirst({
      where: { id: subscriptionId, userId }
    });
    if (!sub) throw new Error('Subscription not found');

    await this.stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: { cancelAtPeriodEnd: true, canceledAt: new Date() }
    });
  }

  async getPaymentHistory(userId, { page = 1, limit = 20 } = {}) {
    const [payments, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.payment.count({ where: { userId } })
    ]);

    return { payments, pagination: { total, pages: Math.ceil(total / limit), page } };
  }

  async processRefund({ paymentId, reason, processedBy }) {
    this.assertEnabled();
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new Error('Payment not found');
    if (payment.status !== 'SUCCEEDED') throw new Error('Payment cannot be refunded');

    const refund = await this.stripe.refunds.create({
      payment_intent: payment.stripePaymentId,
      reason: reason || 'requested_by_customer'
    });

    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'REFUNDED' }
    });

    return prisma.refund.create({
      data: {
        stripeRefundId: refund.id,
        paymentId,
        amount: payment.amount,
        currency: payment.currency,
        reason,
        status: refund.status,
        processedBy
      }
    });
  }
}

module.exports = new PaymentService();
