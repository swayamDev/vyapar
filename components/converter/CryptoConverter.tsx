"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

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
  const [amount, setAmount] = useState<number>(10);

  const currencies = useMemo(() => Object.keys(priceList), [priceList]);

  const convertedPrice = useMemo(() => {
    const rate = priceList[currency] ?? 0;
    return amount * rate;
  }, [amount, currency, priceList]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setAmount(Number.isNaN(value) ? 0 : value);
  };

  return (
    <section id="converter">
      <h4 className="text-lg font-semibold">
        {symbol.toUpperCase()} Converter
      </h4>

      <div className="panel">
        {/* Input */}

        <div className="input-wrapper">
          <Input
            type="number"
            min="0"
            step="any"
            placeholder="Amount"
            value={amount}
            onChange={handleAmountChange}
            className="input"
            aria-label={`${symbol} amount`}
          />

          <div className="coin-info">
            <Image
              src={icon}
              alt={symbol}
              width={20}
              height={20}
              loading="lazy"
            />
            <p>{symbol.toUpperCase()}</p>
          </div>
        </div>

        {/* Divider */}

        <div className="divider">
          <div className="line" />

          <Image
            src="/converter.svg"
            alt="converter icon"
            width={32}
            height={32}
            className="icon"
          />
        </div>

        {/* Output */}

        <div className="output-wrapper">
          <p className="text-lg font-semibold">
            {formatCurrency(convertedPrice, 2, currency, false)}
          </p>

          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="select-trigger">
              <SelectValue placeholder="Select currency">
                {currency.toUpperCase()}
              </SelectValue>
            </SelectTrigger>

            <SelectContent className="select-content" data-converter>
              {currencies.map((currencyCode) => (
                <SelectItem
                  value={currencyCode}
                  key={currencyCode}
                  className="select-item"
                >
                  {currencyCode.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
};

export default CryptoConverter;
