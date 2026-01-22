import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { OrdersModule } from '../orders/orders.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [OrdersModule, PaymentModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}

