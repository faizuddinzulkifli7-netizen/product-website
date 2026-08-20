'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Matches the storefront's default display currency — most customers (and
// so most revenue figures) are European.
export const DISPLAY_CURRENCY = 'EUR';

interface CurrencyContextType {
  ready: boolean;
  // Formats a USD amount (as stored/returned by the backend) into EUR.
  formatPrice: (usdAmount: number) => string;
  // Raw conversions for editable fields (e.g. the product price input),
  // which need the numeric EUR value rather than a formatted string.
  usdToEur: (usdAmount: number) => number;
  eurToUsd: (eurAmount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [rate, setRate] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/currency/rates?currencies=${DISPLAY_CURRENCY}`)
      .then((res) => res.json())
      .then((data: Record<string, number>) => {
        setRate(data[DISPLAY_CURRENCY] || null);
        setReady(true);
      })
      .catch((err) => {
        console.error('Failed to load currency rates:', err);
      });
  }, []);

  const formatPrice = (usdAmount: number): string => {
    // Before rates load, or if the rate is unavailable, fall back to USD
    // rather than mislabeling a raw dollar figure with the euro symbol.
    if (!ready || !rate) {
      return `$${usdAmount.toFixed(2)}`;
    }
    return `€${(usdAmount / rate).toFixed(2)}`;
  };

  // rate === USD value of 1 EUR, so USD -> EUR divides, EUR -> USD multiplies.
  const usdToEur = (usdAmount: number): number => (rate ? usdAmount / rate : usdAmount);
  const eurToUsd = (eurAmount: number): number => (rate ? eurAmount * rate : eurAmount);

  return (
    <CurrencyContext.Provider value={{ ready, formatPrice, usdToEur, eurToUsd }}>
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
