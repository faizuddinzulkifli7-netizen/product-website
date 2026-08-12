import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import {
  PaymentGateway,
  NormalizedPaymentEvent,
} from './payment-gateway.interface';

interface BTCPayInvoice {
  id: string;
  checkoutLink: string;
  status: string;
  metadata?: { orderId?: string };
}

@Injectable()
export class BTCPayService implements PaymentGateway {
  private readonly logger = new Logger(BTCPayService.name);
  private readonly serverUrl: string;
  private readonly apiKey: string;
  private readonly storeId: string;
  private readonly webhookSecret: string;

  constructor(private configService: ConfigService) {
    this.serverUrl = (
      this.configService.get<string>('BTCPAY_URL') || ''
    ).replace(/\/$/, '');
    this.apiKey = this.configService.get<string>('BTCPAY_API_KEY') || '';
    this.storeId = this.configService.get<string>('BTCPAY_STORE_ID') || '';
    this.webhookSecret =
      this.configService.get<string>('BTCPAY_WEBHOOK_SECRET') || '';
  }

  async createPaymentRequest(
    orderId: string,
    amount: number,
    currency = 'USD',
  ): Promise<{ paymentUrl: string; requestId: string }> {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    const response = await axios.post<BTCPayInvoice>(
      `${this.serverUrl}/api/v1/stores/${this.storeId}/invoices`,
      {
        amount: amount.toFixed(2),
        currency,
        metadata: { orderId },
        checkout: {
          redirectURL: `${frontendUrl}/checkout/success?orderId=${orderId}`,
        },
      },
      {
        headers: {
          Authorization: `token ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      paymentUrl: response.data.checkoutLink,
      requestId: response.data.id,
    };
  }

  async parseWebhook(
    rawBody: Buffer,
    signature: string,
  ): Promise<NormalizedPaymentEvent | null> {
    if (!signature) {
      throw new BadRequestException('Missing BTCPay-Sig header');
    }

    const expected = Buffer.from(
      'sha256=' +
        crypto
          .createHmac('sha256', this.webhookSecret)
          .update(rawBody)
          .digest('hex'),
      'utf8',
    );
    const received = Buffer.from(signature, 'utf8');

    if (
      expected.length !== received.length ||
      !crypto.timingSafeEqual(expected, received)
    ) {
      this.logger.warn('BTCPay webhook signature verification failed');
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = JSON.parse(rawBody.toString('utf8')) as {
      invoiceId: string;
      type: string;
    };

    let status: 'paid' | 'failed';
    switch (event.type) {
      case 'InvoiceSettled':
        status = 'paid';
        break;
      case 'InvoiceExpired':
      case 'InvoiceInvalid':
        status = 'failed';
        break;
      default:
        this.logger.debug(`Unhandled BTCPay event type: ${event.type}`);
        return null;
    }

    // Webhook payloads only carry invoiceId/type, so the orderId we stashed
    // in the invoice's metadata has to be fetched back from the invoice itself.
    const invoiceResponse = await axios.get<BTCPayInvoice>(
      `${this.serverUrl}/api/v1/stores/${this.storeId}/invoices/${event.invoiceId}`,
      { headers: { Authorization: `token ${this.apiKey}` } },
    );

    const orderId = invoiceResponse.data.metadata?.orderId;
    if (!orderId) {
      this.logger.warn(
        `BTCPay invoice ${event.invoiceId} has no orderId in metadata`,
      );
      return null;
    }

    return { orderId, transactionId: event.invoiceId, status };
  }
}
