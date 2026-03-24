"use client";

import Image from "next/image";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { LiveCoinHeaderProps } from "@/types/ui";
import { useMemo } from "react";

const CoinHeader = ({
  name,
  image,
  livePrice,
  livePriceChangePercentage24h,
  priceChangePercentage30d,
  priceChange24h,
}: LiveCoinHeaderProps) => {
  const isTrendingUp = livePriceChangePercentage24h > 0;
  const isThirtyDayUp = priceChangePercentage30d > 0;
  const isPriceChangeUp = priceChange24h > 0;

  const stats = useMemo(
    () => [
      {
        label: "Today",
        value: livePriceChangePercentage24h,
        isUp: isTrendingUp,
        formatter: formatPercentage,
        showIcon: true,
      },
      {
        label: "30 Days",
        value: priceChangePercentage30d,
        isUp: isThirtyDayUp,
        formatter: formatPercentage,
        showIcon: true,
      },
      {
        label: "Price Change (24h)",
        value: priceChange24h,
        isUp: isPriceChangeUp,
        formatter: formatCurrency,
        showIcon: false,
      },
    ],
    [
      livePriceChangePercentage24h,
      priceChangePercentage30d,
      priceChange24h,
      isTrendingUp,
      isThirtyDayUp,
      isPriceChangeUp,
    ],
  );

  const changeLabel = isTrendingUp
    ? `+${formatPercentage(livePriceChangePercentage24h)}`
    : formatPercentage(livePriceChangePercentage24h);

  return (
    <section aria-label={`${name} market data`} className="space-y-6">
      <h1 className="text-lg font-semibold">{name}</h1>

      <div className="flex items-center gap-6">
        <Image
          src={image}
          alt={`${name} logo`}
          width={64}
          height={64}
          priority
          className="rounded-full"
        />

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-3xl font-bold">
              {formatCurrency(livePrice ?? 0)}
            </p>

            <Badge
              className={cn(
                "flex items-center gap-1",
                isTrendingUp
                  ? "bg-green-500/15 text-green-600 dark:text-green-400"
                  : "bg-red-500/15 text-red-600 dark:text-red-400",
              )}
            >
              {isTrendingUp ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              {changeLabel} (24h)
            </Badge>
          </div>
        </div>
      </div>

      <ul className="grid grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <li key={stat.label}>
            <p className="text-muted-foreground mb-1 text-xs sm:text-sm">
              {stat.label}
            </p>

            <div
              className={cn(
                "flex items-center gap-1 text-sm font-semibold sm:text-base",
                stat.isUp ? "text-green-500" : "text-red-500",
              )}
            >
              <span>
                {stat.isUp && stat.showIcon ? "+" : ""}
                {stat.formatter(stat.value)}
              </span>

              {stat.showIcon &&
                (stat.isUp ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default CoinHeader;
