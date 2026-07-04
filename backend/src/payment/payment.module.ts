import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { B2BinPayService } from './b2binpay.service';
import { StripeService } from './stripe.service';
import { PAYMENT_GATEWAY } from './payment-gateway.interface';

@Module({
  imports: [ConfigModule],
  providers: [
    B2BinPayService,
    StripeService,
    // Active gateway. Swap useExisting to another provider to change processors.
    { provide: PAYMENT_GATEWAY, useExisting: StripeService },
  ],
  exports: [PAYMENT_GATEWAY, StripeService, B2BinPayService],
})
export class PaymentModule {}
