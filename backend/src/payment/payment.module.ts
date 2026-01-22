import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { B2BinPayService } from './b2binpay.service';

@Module({
  imports: [ConfigModule],
  providers: [B2BinPayService],
  exports: [B2BinPayService],
})
export class PaymentModule {}

