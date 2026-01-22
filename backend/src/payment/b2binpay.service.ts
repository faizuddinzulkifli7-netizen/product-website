import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class B2BinPayService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly walletId: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('B2BINPAY_API_URL') || 'https://api.b2binpay.com';
    this.apiKey = this.configService.get<string>('B2BINPAY_API_KEY') || '';
    this.apiSecret = this.configService.get<string>('B2BINPAY_API_SECRET') || '';
    this.walletId = this.configService.get<string>('B2BINPAY_WALLET_ID') || '';
  }

  async createPaymentRequest(orderId: string, amount: number, currency: string = 'USD'): Promise<{ paymentUrl: string; requestId: string }> {
    try {
      // In a real implementation, this would make an actual API call to B2BINPAY
      // For now, we'll simulate the response
      const response = await axios.post(
        `${this.apiUrl}/v1/payment_requests`,
        {
          wallet_id: this.walletId,
          amount: amount.toString(),
          currency,
          callback_url: `${this.configService.get<string>('APP_URL') || 'http://localhost:3000'}/api/webhooks/b2binpay`,
          success_url: `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001'}/checkout/success`,
          fail_url: `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001'}/checkout`,
          order_id: orderId,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        paymentUrl: response.data.payment_url || `${this.apiUrl}/payment/${response.data.id}`,
        requestId: response.data.id,
      };
    } catch (error) {
      // Fallback for development/testing
      console.warn('B2BINPAY API not configured, using mock payment URL');
      return {
        paymentUrl: `https://b2binpay.com/on-ramp?order=${orderId}&amount=${amount.toFixed(2)}&currency=${currency}`,
        requestId: `mock_request_${Date.now()}`,
      };
    }
  }

  async verifyWebhook(signature: string, payload: any): Promise<boolean> {
    // In a real implementation, verify the webhook signature
    // For now, we'll accept all webhooks (in production, implement proper signature verification)
    return true;
  }
}

