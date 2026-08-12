/**
 * Common contract every payment gateway (BTCPay, B2BinPay, ...) implements,
 * so the rest of the app never depends on a specific provider. Swap
 * providers by rebinding the PAYMENT_GATEWAY token in PaymentModule.
 */
export const PAYMENT_GATEWAY = 'PAYMENT_GATEWAY';

export interface NormalizedPaymentEvent {
  orderId: string;
  transactionId?: string;
  status: 'paid' | 'failed';
}

export interface PaymentGateway {
  /** Create a hosted payment/checkout session and return the redirect URL. */
  createPaymentRequest(
    orderId: string,
    amount: number,
    currency?: string,
  ): Promise<{ paymentUrl: string; requestId: string }>;

  /**
   * Verify a webhook against the raw request body and normalize it.
   * Returns null for events we don't act on. Throws on invalid signatures.
   */
  parseWebhook(
    rawBody: Buffer,
    signature: string,
  ): Promise<NormalizedPaymentEvent | null>;
}
