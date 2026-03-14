import { fetcher } from "@/lib/coingecko-client";
import Link from "next/link";
import Image from "next/image";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { DataTableColumn, TrendingCoin } from "@/types";
import DataTable from "@/components/tables/DataTable";
import { TrendingCoinsFallback } from "./fallback";

const TrendingCoins = async () => {
  let trendingCoins;

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

  const columns: DataTableColumn<TrendingCoin>[] = [
    {
      header: "Coin",
      cell: (coin) => {
        const item = coin.item;

        return (
          <Link href={`/coins/${item.id}`} className="flex items-center gap-3">
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
        const item = coin.item;
        const change = item.data.price_change_percentage_24h.usd;
        const isUp = change > 0;

        return (
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-medium",
              isUp ? "text-green-500" : "text-red-500",
            )}
          >
            {formatPercentage(change)}

            {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          </div>
        );
      },
    },
    {
      header: "Price",
      cell: (coin) => (
        <span className="text-sm font-medium">
          {formatCurrency(coin.item.data.price)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <DataTable
        data={trendingCoins?.coins?.slice(0, 6) ?? []}
        columns={columns}
        rowKey={(coin) => coin.item.id}
        tableClassName="w-full"
        headerCellClassName="text-xs font-medium text-muted-foreground py-3"
        bodyCellClassName="py-3"
      />
    </div>
  );
};

export default TrendingCoins;
