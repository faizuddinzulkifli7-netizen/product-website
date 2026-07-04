import {
  Controller,
  Post,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { OrdersService } from '../orders/orders.service';
import { PAYMENT_GATEWAY } from '../payment/payment-gateway.interface';
import type { PaymentGateway } from '../payment/payment-gateway.interface';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private ordersService: OrdersService,
    @Inject(PAYMENT_GATEWAY) private paymentGateway: PaymentGateway,
  ) {}

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!req.rawBody) {
      throw new BadRequestException(
        'Missing raw body for signature verification',
      );
    }

    const event = await this.paymentGateway.parseWebhook(req.rawBody, signature);

    // Unhandled/unactionable events still get a 200 so Stripe stops retrying.
    if (!event || !event.orderId) {
      return { received: true };
    }

    await this.ordersService.handlePaymentWebhook(
      event.orderId,
      event.transactionId || '',
      event.status,
    );

    return { received: true, processed: true };
  }
}
