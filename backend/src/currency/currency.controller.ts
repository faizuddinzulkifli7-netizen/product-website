import { Controller, Get, Query } from '@nestjs/common';
import { CurrencyService } from './currency.service';

// RSD is intentionally excluded — PayGate's convert.php reports it as an
// unsupported currency ("Coin not supported"), so it can't be settled.
const DEFAULT_CURRENCIES = ['EUR', 'SEK', 'NOK', 'DKK', 'GBP'];

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  // Returns { [currencyCode]: eurValueOfOneUnit }, e.g. { EUR: 1, SEK: 0.0906 }.
  @Get('rates')
  async getRates(@Query('currencies') currencies?: string) {
    const codes = currencies
      ? currencies.split(',').map((c) => c.trim()).filter(Boolean)
      : DEFAULT_CURRENCIES;
    return this.currencyService.getRates(codes);
  }
}
