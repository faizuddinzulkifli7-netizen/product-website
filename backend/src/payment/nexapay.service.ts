import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import {
  PaymentGateway,
  NormalizedPaymentEvent,
} from './payment-gateway.interface';

interface NexaPayPaymentResponse {
  success: boolean;
  payment: {
    id: string;
    order_id: string;
    amount: number;
    currency: string;
    status: string;
    checkout_url: string;
  };
}

@Injectable()
export class NexaPayService implements PaymentGateway {
  private readonly logger = new Logger(NexaPayService.name);
  private readonly apiUrl = 'https://nexapay.one/api/v1';
  private readonly apiKey: string;
  private readonly webhookSecret: string;
  private readonly cryptoAsset: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('NEXAPAY_API_KEY') || '';
    this.webhookSecret =
      this.configService.get<string>('NEXAPAY_WEBHOOK_SECRET') || '';
    // Settlement asset — NexaPay only supports USDC/POL/LINK/UNI, all on Polygon.
    this.cryptoAsset =
      this.configService.get<string>('NEXAPAY_CRYPTO_ASSET') || 'USDC';
  }

  async createPaymentRequest(
    orderId: string,
    amount: number,
    currency = 'USD',
  ): Promise<{ paymentUrl: string; requestId: string }> {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const appUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:3000';

    const response = await axios.post<NexaPayPaymentResponse>(
      `${this.apiUrl}/payments`,
      {
        amount,
        currency,
        crypto: this.cryptoAsset,
        description: `Order ${orderId}`,
        success_url: `${frontendUrl}/checkout/success?orderId=${encodeURIComponent(orderId)}`,
        cancel_url: `${frontendUrl}/checkout`,
        // NexaPay has no metadata field on payment creation, so our orderId
        // is threaded through as a query param on the callback URL instead —
        // the webhooks controller reads it back out when the POST arrives.
        callback_url: `${appUrl}/api/webhooks/nexapay?orderId=${encodeURIComponent(orderId)}`,
      },
      {
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      paymentUrl: response.data.payment.checkout_url,
      requestId: response.data.payment.order_id,
    };
  }

  /**
   * NexaPay signs webhooks over `${timestamp}.${rawBody}`, not just the raw
   * body, and expects old deliveries to be rejected — so this needs the
   * X-NexaPay-Timestamp header the shared PaymentGateway#parseWebhook
   * signature doesn't carry. Kept optional so this still structurally
   * satisfies the interface; the /webhooks/nexapay route always supplies it.
   */
  async parseWebhook(
    rawBody: Buffer,
    signature: string,
    timestamp?: string,
  ): Promise<NormalizedPaymentEvent | null> {
    if (!signature || !timestamp) {
      throw new BadRequestException(
        'Missing NexaPay signature/timestamp headers',
      );
    }

    const expected = Buffer.from(
      'sha256=' +
        crypto
          .createHmac('sha256', this.webhookSecret)
          .update(`${timestamp}.${rawBody.toString('utf8')}`)
          .digest('hex'),
      'utf8',
    );
    const received = Buffer.from(signature, 'utf8');

    if (
      expected.length !== received.length ||
      !crypto.timingSafeEqual(expected, received)
    ) {
      this.logger.warn('NexaPay webhook signature verification failed');
      throw new BadRequestException('Invalid webhook signature');
    }

    const maxAgeMs = 5 * 60 * 1000;
    if (Math.abs(Date.now() - parseInt(timestamp, 10)) > maxAgeMs) {
      throw new BadRequestException('Webhook expired');
    }

    const event = JSON.parse(rawBody.toString('utf8')) as {
      order_id: string;
      payment_id: string;
      status: string;
    };

    let status: 'paid' | 'failed';
    switch (event.status) {
      case 'completed':
        status = 'paid';
        break;
      case 'expired':
      case 'failed':
        status = 'failed';
        break;
      default:
        this.logger.debug(`Unhandled NexaPay status: ${event.status}`);
        return null;
    }

    // orderId is filled in by the controller from the callback_url query
    // param — see comment on createPaymentRequest.
    return { orderId: '', transactionId: event.payment_id, status };
  }
}
