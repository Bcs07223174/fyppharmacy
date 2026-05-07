'use client';

import { CurrencyCode } from '@/lib/currency';
import { useCurrency } from '@/lib/currencyContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export default function CurrencySelector() {
  const { currency, setCurrency, currencyOptions } = useCurrency();

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-sky-100">
        Currency
      </span>
      <Select value={currency} onValueChange={(value) => setCurrency(value as CurrencyCode)}>
        <SelectTrigger className="w-[170px] border-sky-400/40 bg-white/10 text-white hover:bg-white/15 focus:ring-white/30">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          {currencyOptions.map((option) => (
            <SelectItem key={option.code} value={option.code}>
              {option.code} - {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
