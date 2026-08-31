'use client';

import React, { createContext, useContext } from 'react';

// The backend's base currency — product prices and order totals are
// stored in EUR directly, set by the admin, never derived from a live
// exchange rate. That's what "DISPLAY_CURRENCY" means here: there's no
// conversion happening, so these figures can't drift on redisplay.
export const DISPLAY_CURRENCY = 'EUR';

interface CurrencyContextType {
  formatPrice: (eurAmount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const formatPrice = (eurAmount: number): string => `€${eurAmount.toFixed(2)}`;

  return (
    <CurrencyContext.Provider value={{ formatPrice }}>
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
