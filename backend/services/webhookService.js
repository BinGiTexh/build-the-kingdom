const prisma = require('../lib/prisma');

class WebhookService {
  constructor() {
    this.stripe = null;
    if (process.env.STRIPE_ENABLED === 'true' && process.env.STRIPE_SECRET_KEY) {
      this.stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    }
  }

  async processWebhook(rawBody, signature) {
    if (!this.stripe) throw new Error('Stripe not configured');

    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    const existing = await prisma.webhookEvent.findUnique({
      where: { stripeEventId: event.id }
    });
    if (existing?.processed) return { status: 'already_processed' };

    await prisma.webhookEvent.upsert({
      where: { stripeEventId: event.id },
      update: {},
      create: { stripeEventId: event.id, eventType: event.type, eventData: event.data }
    });

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoiceSucceeded(event.data.object);
          break;
      }

      await prisma.webhookEvent.update({
        where: { stripeEventId: event.id },
        data: { processed: true, processedAt: new Date() }
      });

      return { status: 'processed', type: event.type };
    } catch (err) {
      await prisma.webhookEvent.update({
        where: { stripeEventId: event.id },
        data: { processingError: err.message }
      });
      throw err;
    }
  }

  async handlePaymentSucceeded(paymentIntent) {
    const payment = await prisma.payment.findUnique({
      where: { stripePaymentId: paymentIntent.id }
    });
    if (!payment) return;

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCEEDED',
        processedAt: new Date(),
        stripeReceiptUrl: paymentIntent.charges?.data?.[0]?.receipt_url
      }
    });

    if (payment.paymentType === 'JOB_POSTING' && payment.jobId) {
      await prisma.job.update({
        where: { id: payment.jobId },
        data: { status: 'ACTIVE' }
      });
    }

    if (payment.paymentType === 'FEATURED_LISTING' && payment.jobId) {
      await prisma.job.update({
        where: { id: payment.jobId },
        data: { featured: true }
      });
    }
  }

  async handlePaymentFailed(paymentIntent) {
    await prisma.payment.updateMany({
      where: { stripePaymentId: paymentIntent.id },
      data: { status: 'FAILED' }
    });
  }

  async handleSubscriptionUpdated(subscription) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: subscription.status.toUpperCase(),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    });
  }

  async handleSubscriptionDeleted(subscription) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: { status: 'CANCELED', canceledAt: new Date() }
    });
  }

  async handleInvoiceSucceeded(invoice) {
    if (!invoice.subscription) return;
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: invoice.subscription },
      data: { status: 'ACTIVE' }
    });
  }
}

module.exports = new WebhookService();
