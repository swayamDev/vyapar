import { fetcher } from "@/lib/coingecko-client";
import Link from "next/link";
import Image from "next/image";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { DataTableColumn, TrendingCoin } from "@/types";
import DataTable from "@/components/tables/DataTable";
import { TrendingCoinsFallback } from "./fallback";

const TrendingCoins = async () => {
  let trendingCoins: { coins: TrendingCoin[] } | null = null;

  try {
    trendingCoins = await fetcher<{ coins: TrendingCoin[] }>(
      "/search/trending",
      undefined,
      300,
    );
  } catch (error) {
    console.error("Error fetching trending coins:", error);
    return <TrendingCoinsFallback />;
  }

  const coins = trendingCoins?.coins?.slice(0, 6) ?? [];

  if (coins.length === 0) {
    return <TrendingCoinsFallback />;
  }

  const columns: DataTableColumn<TrendingCoin>[] = [
    {
      header: "Coin",
      cell: (coin) => {
        const item = coin.item;
        return (
          <Link
            href={`/coins/${item.id}`}
            className="flex items-center gap-3 transition hover:opacity-80"
          >
            <Image
              src={item.large}
              alt={item.name}
              width={32}
              height={32}
              className="rounded-full"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-foreground text-sm font-medium">
                {item.name}
              </span>
              <span className="text-muted-foreground text-xs uppercase">
                {item.symbol}
              </span>
            </div>
          </Link>
        );
      },
    },
    {
      header: "24h",
      cell: (coin) => {
        const change = coin.item?.data?.price_change_percentage_24h?.usd ?? 0;
        const isUp = change > 0;
        return (
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-medium",
              isUp ? "text-green-500" : "text-red-500",
            )}
          >
            {isUp ? "+" : ""}
            {formatPercentage(change)}
            {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          </div>
        );
      },
    },
    {
      header: "Price",
      cell: (coin) => (
        <span className="tabular-nums text-sm font-medium">
          {formatCurrency(coin.item?.data?.price ?? 0)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      data={coins}
      columns={columns}
      rowKey={(coin) => coin.item.id}
      tableClassName="w-full"
      headerCellClassName="text-xs font-medium text-muted-foreground py-3"
      bodyCellClassName="py-3"
    />
  );
};

export default TrendingCoins;
