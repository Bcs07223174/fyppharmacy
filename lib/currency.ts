export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyOption {
  code: CurrencyCode;
  label: string;
  symbol: string;
  locale: string;
  rateFromInr: number;
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'INR', label: 'Indian Rupee', symbol: '₹', locale: 'en-IN', rateFromInr: 1 },
  { code: 'USD', label: 'US Dollar', symbol: '$', locale: 'en-US', rateFromInr: 0.012 },
  { code: 'EUR', label: 'Euro', symbol: '€', locale: 'de-DE', rateFromInr: 0.011 },
  { code: 'GBP', label: 'British Pound', symbol: '£', locale: 'en-GB', rateFromInr: 0.0095 },
];

export const DEFAULT_CURRENCY: CurrencyCode = 'INR';

export function getCurrencyOption(currency: CurrencyCode): CurrencyOption {
  return CURRENCY_OPTIONS.find((option) => option.code === currency) ?? CURRENCY_OPTIONS[0];
}

export function convertFromInr(amount: number, currency: CurrencyCode): number {
  return amount * getCurrencyOption(currency).rateFromInr;
}

export function formatCurrency(amount: number, currency: CurrencyCode = DEFAULT_CURRENCY): string {
  const option = getCurrencyOption(currency);
  const convertedAmount = convertFromInr(amount, currency);

  return new Intl.NumberFormat(option.locale, {
    style: 'currency',
    currency: option.code,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(convertedAmount);
}
