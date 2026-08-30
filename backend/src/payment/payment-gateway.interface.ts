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

export interface PaymentProviderOption {
  id: string;
  name: string;
  url: string;
}

// A single coin/network combination selectable on our own direct-crypto UI
// (e.g. { path: 'polygon/usdc', network: 'polygon', ticker: 'usdc' }).
// `path` is the exact URL segment PayGate expects for that coin's
// wallet.php/convert.php calls — 'btc' for a direct chain, 'network/ticker'
// for one nested under a network grouping.
export interface CryptoCoinOption {
  path: string;
  network: string | null;
  ticker: string;
  name: string;
  logo: string;
}

export interface PaymentGateway {
  /**
   * Create a hosted payment/checkout session and return the redirect URL.
   * customerEmail is optional because most gateways don't need it — PayGate
   * is the exception, its checkout endpoints require one.
   *
   * `providers`, when present, is a curated list of individual provider
   * checkout links (PayGate's own multi-provider selector page can't have
   * specific providers excluded from it, so PayGate builds this instead —
   * other gateways simply omit it).
   */
  createPaymentRequest(
    orderId: string,
    amount: number,
    currency?: string,
    customerEmail?: string,
  ): Promise<{ paymentUrl: string; requestId: string; providers?: PaymentProviderOption[] }>;

  /**
   * Verify a webhook against the raw request body and normalize it.
   * Returns null for events we don't act on. Throws on invalid signatures.
   */
  parseWebhook(
    rawBody: Buffer,
    signature: string,
  ): Promise<NormalizedPaymentEvent | null>;
}
