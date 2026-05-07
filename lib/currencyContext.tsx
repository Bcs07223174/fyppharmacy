'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CURRENCY_OPTIONS, DEFAULT_CURRENCY, CurrencyCode, formatCurrency } from './currency';

type CurrencyContextType = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  currencyOptions: typeof CURRENCY_OPTIONS;
  currencySymbol: string;
  formatAmount: (amount: number) => string;
};

const STORAGE_KEY = 'pharmacy_currency';

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedCurrency = window.localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
      if (storedCurrency && CURRENCY_OPTIONS.some((option) => option.code === storedCurrency)) {
        setCurrency(storedCurrency);
      }
    } catch (error) {
      console.error('Failed to load currency preference:', error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, currency);
    } catch (error) {
      console.error('Failed to save currency preference:', error);
    }
  }, [currency, isHydrated]);

  const value = useMemo(() => {
    const selectedOption = CURRENCY_OPTIONS.find((option) => option.code === currency) ?? CURRENCY_OPTIONS[0];

    return {
      currency,
      setCurrency,
      currencyOptions: CURRENCY_OPTIONS,
      currencySymbol: selectedOption.symbol,
      formatAmount: (amount: number) => formatCurrency(amount, currency),
    };
  }, [currency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }

  return context;
}
