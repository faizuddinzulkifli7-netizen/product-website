import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  PaymentGateway,
  NormalizedPaymentEvent,
} from './payment-gateway.interface';

interface PayGateWalletResponse {
  address_in: string;
  polygon_address_in: string;
  callback_url: string;
  ipn_token: string;
}

interface PayGateHostedCryptoResponse {
  payment_token: string;
  callback_url: string;
  ipn_token: string;
}

interface PayGateStatusResponse {
  status: string;
  value_coin?: string;
  txid_out?: string;
  coin?: string;
}

@Injectable()
export class PayGateService implements PaymentGateway {
  private readonly logger = new Logger(PayGateService.name);
  private readonly apiUrl = 'https://api.paygate.to';
  private readonly checkoutUrl = 'https://checkout.paygate.to';
  private readonly merchantWallet: string;
  private readonly btcWallet: string;
  // PayGate's WAF rejects anything that doesn't look like a real browser
  // request from its own site — no auth token involved, just these headers.
  // (Confirmed by trial and error: axios's default UA alone gets rejected
  // even with Referer/Origin set.)
  private readonly headers = {
    Referer: 'https://paygate.to/',
    Origin: 'https://paygate.to',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  };

  constructor(private configService: ConfigService) {
    this.merchantWallet =
      this.configService.get<string>('PAYGATE_MERCHANT_WALLET') || '';
    this.btcWallet = this.configService.get<string>('PAYGATE_BTC_WALLET') || '';
  }

  async createPaymentRequest(
    orderId: string,
    amount: number,
    currency = 'USD',
    customerEmail?: string,
  ): Promise<{ paymentUrl: string; requestId: string }> {
    if (!this.merchantWallet) {
      throw new BadRequestException('PayGate merchant wallet is not configured');
    }

    const appUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:3000';

    // Mints a one-time tracking address for this order; PayGate forwards
    // whatever crypto lands on it straight to our merchant wallet.
    const walletRes = await axios.get<PayGateWalletResponse>(
      `${this.apiUrl}/control/wallet.php`,
      {
        params: {
          address: this.merchantWallet,
          callback: `${appUrl}/api/webhooks/paygate?orderId=${encodeURIComponent(orderId)}`,
        },
        headers: this.headers,
      },
    );

    // wallet.php returns address_in/ipn_token already URL-encoded (they're
    // designed to be dropped straight into the next URL's query string).
    // Decoding once here means every downstream use — URLSearchParams here,
    // axios params in verifyPayment — can encode normally without anything
    // needing to know it was pre-encoded, avoiding double-encoding bugs.
    const addressIn = decodeURIComponent(walletRes.data.address_in);
    const ipnToken = decodeURIComponent(walletRes.data.ipn_token);

    // pay.php is PayGate's own hosted multi-provider selector (Transak,
    // Banxa, Stripe, etc.) — a plain redirect URL, not an API call.
    const params = new URLSearchParams({
      address: addressIn,
      amount: amount.toFixed(2),
      currency,
      email: customerEmail || 'guest@eupeptides.org',
    });

    return {
      paymentUrl: `${this.checkoutUrl}/pay.php?${params.toString()}`,
      // ipn_token is what lets us independently verify payment later —
      // stored as the order's paymentRequestId.
      requestId: ipnToken,
    };
  }

  /**
   * For customers who already hold crypto and want to pay directly from
   * their own wallet — a genuinely different rail from createPaymentRequest,
   * which always routes through a card/onramp provider. Offers both EVM
   * chains (Polygon, Base, Arbitrum, BSC, Optimism, etc.) and native
   * Bitcoin, since both merchant wallets are configured.
   */
  async createDirectCryptoPayment(
    orderId: string,
    amount: number,
    currency = 'USD',
  ): Promise<{ paymentUrl: string; requestId: string }> {
    if (!this.merchantWallet || !this.btcWallet) {
      throw new BadRequestException(
        'PayGate EVM/BTC merchant wallets are not configured',
      );
    }

    const appUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:3000';

    const res = await axios.post<PayGateHostedCryptoResponse>(
      `${this.apiUrl}/crypto/multi-hosted-wallet.php`,
      {
        evm: this.merchantWallet,
        btc: this.btcWallet,
        fiat_amount: amount,
        fiat_currency: currency,
        callback: `${appUrl}/api/webhooks/paygate?orderId=${encodeURIComponent(orderId)}`,
      },
      { headers: this.headers },
    );

    // Same pre-encoded-value caveat as wallet.php — see createPaymentRequest.
    const paymentToken = decodeURIComponent(res.data.payment_token);
    const ipnToken = decodeURIComponent(res.data.ipn_token);

    return {
      paymentUrl: `${this.checkoutUrl}/crypto/hosted.php?payment_token=${encodeURIComponent(paymentToken)}&add_fees=1`,
      requestId: ipnToken,
    };
  }

  /**
   * PayGate's callback is an unsigned GET request with no verification
   * mechanism at all — anyone who guesses the callback URL could forge one.
   * So it's never trusted directly; the webhooks controller uses this
   * method to independently ask PayGate "is this order actually paid?"
   * using the ipn_token we minted ourselves and stored server-side.
   */
  async verifyPayment(ipnToken: string): Promise<NormalizedPaymentEvent | null> {
    const res = await axios.get<PayGateStatusResponse>(
      `${this.apiUrl}/control/payment-status.php`,
      {
        params: { ipn_token: ipnToken },
        headers: this.headers,
      },
    );

    if (res.data.status !== 'paid') {
      return null;
    }

    return {
      orderId: '', // filled in by the controller from the callback's orderId query param
      transactionId: res.data.txid_out,
      status: 'paid',
    };
  }

  async parseWebhook(): Promise<NormalizedPaymentEvent | null> {
    // PayGate doesn't do signed POST webhooks — see verifyPayment() and the
    // dedicated GET /webhooks/paygate route instead.
    throw new BadRequestException(
      'PayGate does not use signature-based webhooks; use verifyPayment()',
    );
  }
}
