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

  return (
    <section id="coin-header" className="space-y-6">
      <h3 className="text-lg font-semibold">{name}</h3>

      <div className="flex items-center gap-6">
        <Image
          src={image}
          alt={name}
          width={77}
          height={77}
          priority
          className="rounded-full"
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">
              {formatCurrency(livePrice ?? 0)}
            </h1>

            <Badge
              className={cn(
                "flex items-center gap-1",
                isTrendingUp ? "badge-up" : "badge-down",
              )}
            >
              {formatPercentage(livePriceChangePercentage24h)}
              {isTrendingUp ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
              (24h)
            </Badge>
          </div>
        </div>
      </div>

      <ul className="grid grid-cols-3 gap-6">
        {stats.map((stat) => (
          <li key={stat.label}>
            <p className="text-muted-foreground text-sm">{stat.label}</p>

            <div
              className={cn(
                "flex items-center gap-1 font-medium",
                stat.isUp ? "text-green-500" : "text-red-500",
              )}
            >
              <p>{stat.formatter(stat.value)}</p>

              {stat.showIcon &&
                (stat.isUp ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default CoinHeader;
