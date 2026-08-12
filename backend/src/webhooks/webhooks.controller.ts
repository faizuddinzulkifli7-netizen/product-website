import {
  Controller,
  Post,
  Headers,
  HttpCode,
  HttpStatus,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { OrdersService } from '../orders/orders.service';
import { BTCPayService } from '../payment/btcpay.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private ordersService: OrdersService,
    private btcPayService: BTCPayService,
  ) {}

  @Post('btcpay')
  @HttpCode(HttpStatus.OK)
  async handleBTCPayWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('btcpay-sig') signature: string,
  ) {
    if (!req.rawBody) {
      throw new BadRequestException(
        'Missing raw body for signature verification',
      );
    }

    const event = await this.btcPayService.parseWebhook(req.rawBody, signature);

    // Unhandled/unactionable events still get a 200 so BTCPay stops retrying.
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
