"use client";

import { useMemo, useState } from "react";
import { LiveDataProps, DataTableColumn, Trade } from "@/types";

import { Separator } from "@/components/ui/separator";
import CandlestickChart from "@/components/charts/CandlestickChart";
import CoinHeader from "@/components/coins/CoinHeader";
import DataTable from "@/components/tables/DataTable";

import { useCoinGeckoWebSocket } from "@/hooks/useCoinGeckoWebSocket";

import { formatCurrency, timeAgo } from "@/lib/utils";

const LiveMarketWrapper = ({
  children,
  coinId,
  poolId,
  coin,
  coinOHLCData,
}: LiveDataProps) => {
  const [liveInterval, setLiveInterval] = useState<"1s" | "1m">("1s");

  const {
    trades = [],
    ohlcv,
    price,
  } = useCoinGeckoWebSocket({
    coinId,
    poolId,
    liveInterval,
  });

  /* Live price fallbacks */
  const livePrice = price?.usd ?? coin.market_data.current_price.usd;

  const liveChange24h =
    price?.change24h ??
    coin.market_data.price_change_percentage_24h_in_currency.usd;

  /* Trade table columns */
  const tradeColumns = useMemo<DataTableColumn<Trade>[]>(
    () => [
      {
        header: "Price",
        cellClassName: "price-cell",
        cell: (trade) => (trade.price ? formatCurrency(trade.price) : "-"),
      },
      {
        header: "Amount",
        cellClassName: "amount-cell",
        cell: (trade) => trade.amount?.toFixed(4) ?? "-",
      },
      {
        header: "Value",
        cellClassName: "value-cell",
        cell: (trade) => (trade.value ? formatCurrency(trade.value) : "-"),
      },
      {
        header: "Buy / Sell",
        cellClassName: "type-cell",
        cell: (trade) => (
          <span
            className={
              trade.type === "b"
                ? "font-medium text-green-500"
                : "font-medium text-red-500"
            }
          >
            {trade.type === "b" ? "Buy" : "Sell"}
          </span>
        ),
      },
      {
        header: "Time",
        cellClassName: "time-cell",
        cell: (trade) => (trade.timestamp ? timeAgo(trade.timestamp) : "-"),
      },
    ],
    [],
  );

  return (
    <section id="live-market-wrapper">
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

      <Separator className="divider" />

      {/* Chart Section */}
      <div className="trend">
        <CandlestickChart
          coinId={coinId}
          data={coinOHLCData}
          liveOhlcv={ohlcv}
          mode="live"
          initialPeriod="daily"
          liveInterval={liveInterval}
          setLiveInterval={setLiveInterval}
        >
          <h4>Trend Overview</h4>
        </CandlestickChart>
      </div>

      <Separator className="divider" />

      {/* Trades Table */}
      <div className="trades">
        <h4>Recent Trades</h4>

        {trades.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            Waiting for live trades...
          </p>
        ) : (
          <DataTable
            columns={tradeColumns}
            data={trades}
            rowKey={(trade: Trade, index: number) =>
              `${trade.timestamp}-${trade.price}-${index}`
            }
            tableClassName="trades-table"
          />
        )}
      </div>

      {children}
    </section>
  );
};

export default LiveMarketWrapper;
