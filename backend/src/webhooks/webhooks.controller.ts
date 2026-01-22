import { Controller, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { B2BinPayService } from '../payment/b2binpay.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private ordersService: OrdersService,
    private b2BinPayService: B2BinPayService,
  ) {}

  @Post('b2binpay')
  @HttpCode(HttpStatus.OK)
  async handleB2BinPayWebhook(@Body() payload: any, @Headers('x-signature') signature: string) {
    // Verify webhook signature
    const isValid = await this.b2BinPayService.verifyWebhook(signature, payload);
    
    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    // Extract order information from webhook payload
    const orderId = payload.order_id || payload.orderId;
    const transactionId = payload.transaction_id || payload.id;
    const status = payload.status || payload.payment_status;

    if (!orderId || !status) {
      return { received: true, message: 'Missing required fields' };
    }

    // Update order payment status
    await this.ordersService.handlePaymentWebhook(orderId, transactionId, status);

    return { received: true, processed: true };
  }
}

