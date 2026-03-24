"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowDownUp } from "lucide-react";

import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { ConverterProps } from "@/types";

const CryptoConverter = ({ symbol, icon, priceList }: ConverterProps) => {
  const [currency, setCurrency] = useState<string>("usd");
  const [amount, setAmount] = useState<string>("10");

  const currencies = useMemo(() => Object.keys(priceList), [priceList]);

  const numericAmount = useMemo(() => {
    const parsed = parseFloat(amount);
    return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
  }, [amount]);

  const convertedPrice = useMemo(() => {
    const rate = priceList[currency] ?? 0;
    return numericAmount * rate;
  }, [numericAmount, currency, priceList]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow empty string, digits, one dot
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setAmount(val);
    }
  };

  return (
    <section
      aria-label={`${symbol.toUpperCase()} converter`}
      className="bg-card border-border rounded-2xl border p-5"
    >
      <h2 className="text-foreground mb-4 text-sm font-semibold">
        {symbol.toUpperCase()} Converter
      </h2>

      <div className="space-y-3">
        {/* Crypto input */}
        <div className="border-border bg-background flex items-center gap-3 rounded-xl border px-3 py-2">
          <Image
            src={icon}
            alt={symbol}
            width={24}
            height={24}
            className="shrink-0 rounded-full"
          />
          <span className="text-muted-foreground min-w-[2.5rem] text-xs font-medium uppercase">
            {symbol}
          </span>
          <Input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={handleAmountChange}
            className="border-0 bg-transparent p-0 text-right text-base font-semibold shadow-none focus-visible:ring-0"
            aria-label={`Amount in ${symbol.toUpperCase()}`}
          />
        </div>

        {/* Swap icon */}
        <div className="flex justify-center">
          <div className="bg-muted rounded-full p-1.5">
            <ArrowDownUp size={14} className="text-muted-foreground" />
          </div>
        </div>

        {/* Fiat output */}
        <div className="border-border bg-background flex items-center gap-3 rounded-xl border px-3 py-2">
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger
              className="h-auto w-auto border-0 bg-transparent p-0 text-xs font-medium uppercase shadow-none focus:ring-0"
              aria-label="Select currency"
            >
              <SelectValue>{currency.toUpperCase()}</SelectValue>
            </SelectTrigger>

            <SelectContent className="max-h-60">
              {currencies.map((code) => (
                <SelectItem value={code} key={code} className="uppercase">
                  {code.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <p className="ml-auto text-base font-semibold">
            {formatCurrency(convertedPrice, 2, currency.toUpperCase(), true)}
          </p>
        </div>
      </div>
    </section>
  );
};

export default CryptoConverter;
