import {
  Controller,
  Post,
  Headers,
  HttpCode,
  HttpStatus,
  Req,
  Query,
  BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { OrdersService } from '../orders/orders.service';
import { BTCPayService } from '../payment/btcpay.service';
import { NexaPayService } from '../payment/nexapay.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private ordersService: OrdersService,
    private btcPayService: BTCPayService,
    private nexaPayService: NexaPayService,
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

  @Post('nexapay')
  @HttpCode(HttpStatus.OK)
  async handleNexaPayWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-nexapay-signature') signature: string,
    @Headers('x-nexapay-timestamp') timestamp: string,
    @Query('orderId') orderId: string,
  ) {
    if (!req.rawBody) {
      throw new BadRequestException(
        'Missing raw body for signature verification',
      );
    }

    const event = await this.nexaPayService.parseWebhook(
      req.rawBody,
      signature,
      timestamp,
    );

    // Unhandled/unactionable events still get a 200 so NexaPay stops retrying.
    if (!event || !orderId) {
      return { received: true };
    }

    await this.ordersService.handlePaymentWebhook(
      orderId,
      event.transactionId || '',
      event.status,
    );

    return { received: true, processed: true };
  }
}
