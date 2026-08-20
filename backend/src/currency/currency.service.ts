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

  // Returns USD value of 1 unit of `currency` (e.g. EUR -> ~1.17).
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

  async getRates(currencies: string[]): Promise<Record<string, number>> {
    const uniqueCodes = [...new Set(currencies.map((c) => c.toUpperCase()))];
    const entries = await Promise.all(
      uniqueCodes.map(async (code) => [code, await this.getUsdRate(code)] as const),
    );
    return Object.fromEntries(entries);
  }

  async convertFromUsd(usdAmount: number, currency: string): Promise<number> {
    const code = currency.toUpperCase();
    if (code === 'USD') {
      return usdAmount;
    }
    const rate = await this.getUsdRate(code);
    return usdAmount / rate;
  }
}
