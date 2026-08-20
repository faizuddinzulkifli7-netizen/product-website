import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { B2BinPayService } from './b2binpay.service';
import { BTCPayService } from './btcpay.service';
import { NexaPayService } from './nexapay.service';
import { PayGateService } from './paygate.service';
import { PAYMENT_GATEWAY } from './payment-gateway.interface';

@Module({
  imports: [ConfigModule],
  providers: [
    B2BinPayService,
    BTCPayService,
    NexaPayService,
    PayGateService,
    // Active gateway. Swap useExisting to another provider to change processors.
    { provide: PAYMENT_GATEWAY, useExisting: PayGateService },
  ],
  exports: [
    PAYMENT_GATEWAY,
    B2BinPayService,
    BTCPayService,
    NexaPayService,
    PayGateService,
  ],
})
export class PaymentModule {}
