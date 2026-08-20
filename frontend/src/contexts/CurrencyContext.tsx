'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// The site's default display currency — most customers are European.
export const DISPLAY_CURRENCY = 'EUR';

// RSD is intentionally excluded — PayGate can't settle in it ("Coin not
// supported"), so Serbian customers pay in EUR like the rest of the EU.
export const CURRENCY_OPTIONS = [
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'SEK', label: 'SEK (kr) — Sweden' },
  { value: 'NOK', label: 'NOK (kr) — Norway' },
  { value: 'DKK', label: 'DKK (kr) — Denmark' },
  { value: 'GBP', label: 'GBP (£) — UK' },
  { value: 'USD', label: 'USD ($)' },
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
};

interface CurrencyContextType {
  // USD value of 1 unit of each currency, e.g. { EUR: 1.167, SEK: 0.106 }.
  rates: Record<string, number>;
  ready: boolean;
  formatPrice: (usdAmount: number, currency?: string) => string;
  convert: (usdAmount: number, currency: string) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/currency/rates`)
      .then((res) => res.json())
      .then((data: Record<string, number>) => {
        setRates(data);
        setReady(true);
      })
      .catch((err) => {
        console.error('Failed to load currency rates:', err);
      });
  }, []);

  const convert = (usdAmount: number, currency: string): number => {
    if (currency === 'USD') return usdAmount;
    const rate = rates[currency];
    if (!rate) return usdAmount;
    return usdAmount / rate;
  };

  const formatPrice = (usdAmount: number, currency: string = DISPLAY_CURRENCY): string => {
    // Before rates load, or if a rate is missing, fall back to USD rather
    // than mislabeling a raw dollar figure with the wrong symbol.
    if (currency !== 'USD' && (!ready || !rates[currency])) {
      return `$${usdAmount.toFixed(2)}`;
    }
    const amount = convert(usdAmount, currency);
    const symbol = CURRENCY_SYMBOLS[currency] || `${currency} `;
    return `${symbol}${amount.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ rates, ready, formatPrice, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
