"use client";

import { useMemo } from "react";
import { LiveDataProps, DataTableColumn } from "@/types";

import { Separator } from "@/components/ui/separator";
import CandlestickChart from "@/components/charts/CandlestickChartClient";
import CoinHeader from "@/components/coins/CoinHeader";
import { ErrorBoundary } from "@/components/ui/error-boundary";

import { useCoinGeckoWebSocket } from "@/hooks/useCoinGeckoWebSocket";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { cn } from "@/lib/utils";

const LiveMarketWrapper = ({
  coinId,
  coin,
  coinOHLCData = [],
}: LiveDataProps) => {
  const { price, isConnected } = useCoinGeckoWebSocket({ coinId });

  // Fall back to SSR-fetched market data until first poll completes
  const livePrice = price?.usd ?? coin.market_data.current_price.usd;
  const liveChange24h =
    price?.change24h ??
    coin.market_data.price_change_percentage_24h_in_currency.usd;

  // Market stats shown below the chart (replaces live trades table on free tier)
  const stats = useMemo(() => [
    {
      label: "Market Cap",
      value: formatCurrency(
        price?.marketCap ?? coin.market_data.market_cap.usd,
      ),
    },
    {
      label: "24h Volume",
      value: formatCurrency(
        price?.volume24h ?? coin.market_data.total_volume.usd,
      ),
    },
    {
      label: "24h High",
      value: formatCurrency(coin.market_data.high_24h?.usd ?? 0),
    },
    {
      label: "24h Low",
      value: formatCurrency(coin.market_data.low_24h?.usd ?? 0),
    },
    {
      label: "30d Change",
      value: formatPercentage(
        coin.market_data.price_change_percentage_30d_in_currency.usd,
      ),
      isChange: true,
      changeValue:
        coin.market_data.price_change_percentage_30d_in_currency.usd,
    },
    {
      label: "All-Time High",
      value: formatCurrency(coin.market_data.ath?.usd ?? 0),
    },
  ], [price, coin]);

  return (
    <div className="space-y-6">
      {/* Coin Header */}
      <CoinHeader
        name={coin.name}
        image={coin.image.large}
        livePrice={livePrice}
        livePriceChangePercentage24h={liveChange24h}
        priceChangePercentage30d={
          coin.market_data.price_change_percentage_30d_in_currency.usd
        }
        priceChange24h={coin.market_data.price_change_24h_in_currency.usd}
      />

      <Separator />

      {/* Chart */}
      <ErrorBoundary>
        <CandlestickChart
          coinId={coinId}
          data={coinOHLCData}
          initialPeriod="daily"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Price Chart</h2>
            <span
              className={`inline-flex h-2 w-2 rounded-full transition-colors ${
                isConnected ? "bg-green-500" : "bg-muted-foreground"
              }`}
              title={isConnected ? "Price data live (30s updates)" : "Fetching price…"}
              aria-label={isConnected ? "Price updates active" : "Fetching price data"}
            />
          </div>
        </CandlestickChart>
      </ErrorBoundary>

      <Separator />

      {/* Market Stats — replaces live trades (free tier has no on-chain data) */}
      <div>
        <h2 className="mb-4 text-sm font-semibold">Market Stats</h2>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-muted/40 border-border rounded-xl border px-4 py-3"
            >
              <dt className="text-muted-foreground mb-1 text-xs">{stat.label}</dt>
              <dd
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  stat.isChange
                    ? (stat.changeValue ?? 0) >= 0
                      ? "text-green-500"
                      : "text-red-500"
                    : "text-foreground",
                )}
              >
                {stat.isChange && (stat.changeValue ?? 0) > 0 ? "+" : ""}
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};

export default LiveMarketWrapper;
