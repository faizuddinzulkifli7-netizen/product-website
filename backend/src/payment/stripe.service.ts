import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  PaymentGateway,
  NormalizedPaymentEvent,
} from './payment-gateway.interface';

@Injectable()
export class StripeService implements PaymentGateway {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || '',
    );
    this.webhookSecret =
      this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
  }

  async createPaymentRequest(
    orderId: string,
    amount: number,
    currency = 'USD',
  ): Promise<{ paymentUrl: string; requestId: string }> {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: orderId,
      metadata: { orderId },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: Math.round(amount * 100),
            product_data: { name: `Order ${orderId}` },
          },
        },
      ],
      success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/checkout`,
    });

    if (!session.url) {
      throw new BadRequestException('Stripe did not return a checkout URL');
    }

    return { paymentUrl: session.url, requestId: session.id };
  }

  async parseWebhook(
    rawBody: Buffer,
    signature: string,
  ): Promise<NormalizedPaymentEvent | null> {
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret,
      );
    } catch (err) {
      this.logger.warn(
        `Stripe webhook signature verification failed: ${(err as Error).message}`,
      );
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        // completed can fire before an async payment settles; only act when paid.
        if (session.payment_status !== 'paid') {
          return null;
        }
        return {
          orderId: session.metadata?.orderId || session.client_reference_id || '',
          transactionId:
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.id,
          status: 'paid',
        };
      }
      case 'checkout.session.async_payment_failed':
      case 'checkout.session.expired': {
        const session = event.data.object;
        return {
          orderId: session.metadata?.orderId || session.client_reference_id || '',
          transactionId: session.id,
          status: 'failed',
        };
      }
      default:
        this.logger.debug(`Unhandled Stripe event type: ${event.type}`);
        return null;
    }
  }
}
