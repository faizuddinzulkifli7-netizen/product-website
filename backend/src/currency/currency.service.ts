import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

interface PayGateConvertResponse {
  status: string;
  value_coin: string;
  exchange_rate: string;
}

interface CachedRate {
  usdPerUnit: number;
  fetchedAt: number;
}

// How long a fetched FX rate is trusted before re-querying PayGate. Rates
// don't need to be real-time for product browsing or checkout provider
// selection, and this keeps us from hammering their API on every request.
const RATE_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  private readonly cache = new Map<string, CachedRate>();

  // Low-level primitive: USD value of 1 unit of `currency`. PayGate's own
  // convert.php is USD-denominated at the source (there's no way to ask it
  // for EUR-relative rates directly), so every EUR-relative rate below is
  // built by composing two of these calls.
  async getUsdRate(currency: string): Promise<number> {
    const code = currency.toUpperCase();
    if (code === 'USD') {
      return 1;
    }

    const cached = this.cache.get(code);
    if (cached && Date.now() - cached.fetchedAt < RATE_TTL_MS) {
      return cached.usdPerUnit;
    }

    try {
      const res = await axios.get<PayGateConvertResponse>(
        'https://api.paygate.to/control/convert.php',
        { params: { from: code, value: 1 } },
      );
      const rate = parseFloat(res.data.exchange_rate);
      if (!rate || Number.isNaN(rate)) {
        throw new Error(`Invalid exchange rate for ${code}`);
      }
      this.cache.set(code, { usdPerUnit: rate, fetchedAt: Date.now() });
      return rate;
    } catch (err) {
      this.logger.warn(
        `Failed to fetch FX rate for ${code}, falling back to stale/1:1 rate: ${err}`,
      );
      // A stale cached rate is still better than a wrong one; only fall
      // back to 1:1 (USD) if we've never successfully fetched this currency.
      return cached?.usdPerUnit ?? 1;
    }
  }

  // EUR value of 1 unit of `currency` — the base-currency rate everything
  // else in the app is built on. EUR itself is always exactly 1 with no
  // network call, which is what keeps EUR-denominated prices from ever
  // drifting just by being displayed or resaved.
  async getEurRate(currency: string): Promise<number> {
    const code = currency.toUpperCase();
    if (code === 'EUR') {
      return 1;
    }
    const [usdX, usdEur] = await Promise.all([this.getUsdRate(code), this.getUsdRate('EUR')]);
    return usdX / usdEur;
  }

  // Returns { [currencyCode]: eurValueOfOneUnit } for every requested code.
  async getRates(currencies: string[]): Promise<Record<string, number>> {
    const uniqueCodes = [...new Set(currencies.map((c) => c.toUpperCase()))];
    const entries = await Promise.all(
      uniqueCodes.map(async (code) => [code, await this.getEurRate(code)] as const),
    );
    return Object.fromEntries(entries);
  }

  // Converts a EUR amount (our stored base currency) into `currency` —
  // used only at the payment-gateway boundary, when a customer has chosen
  // to pay in something other than EUR.
  async convertFromEur(eurAmount: number, currency: string): Promise<number> {
    const code = currency.toUpperCase();
    if (code === 'EUR') {
      return eurAmount;
    }
    const rate = await this.getEurRate(code);
    return eurAmount / rate;
  }
}
