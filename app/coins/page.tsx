import Image from "next/image";
import Link from "next/link";

import { fetcher } from "@/lib/coingecko-client";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";

import DataTable from "@/components/tables/DataTable";
import CoinsPagination from "@/components/coins/CoinsPagination";

import type { CoinMarketData, NextPageProps, DataTableColumn } from "@/types";

const PER_PAGE = 10;

const Coins = async ({ searchParams }: NextPageProps) => {
  const params = await searchParams;
  const currentPage = Number(params?.page ?? 1);

  let coinsData: CoinMarketData[] = [];

  try {
    coinsData = await fetcher<CoinMarketData[]>("/coins/markets", {
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: PER_PAGE,
      page: currentPage,
      sparkline: "false",
      price_change_percentage: "24h",
    });
  } catch (error) {
    console.error("Failed to fetch coins:", error);
  }

  const columns: DataTableColumn<CoinMarketData>[] = [
    {
      header: "Rank",
      cellClassName: "rank-cell",
      cell: (coin) => (
        <Link
          href={`/coins/${coin.id}`}
          className="block h-full w-full"
          aria-label={`View ${coin.name}`}
        >
          #{coin.market_cap_rank}
        </Link>
      ),
    },
    {
      header: "Token",
      cellClassName: "token-cell",
      cell: (coin) => (
        <div className="flex items-center gap-3">
          <Image
            src={coin.image}
            alt={coin.name}
            width={36}
            height={36}
            loading="lazy"
            className="h-9 w-auto"
          />

          <p className="font-medium">
            {coin.name} ({coin.symbol.toUpperCase()})
          </p>
        </div>
      ),
    },
    {
      header: "Price",
      cellClassName: "price-cell",
      cell: (coin) => formatCurrency(coin.current_price),
    },
    {
      header: "24h Change",
      cellClassName: "change-cell",
      cell: (coin) => {
        const isTrendingUp = coin.price_change_percentage_24h > 0;

        return (
          <span
            className={cn(
              "font-medium",
              isTrendingUp ? "text-green-600" : "text-red-500",
            )}
          >
            {isTrendingUp && "+"}
            {formatPercentage(coin.price_change_percentage_24h)}
          </span>
        );
      },
    },
    {
      header: "Market Cap",
      cellClassName: "market-cap-cell",
      cell: (coin) => formatCurrency(coin.market_cap),
    },
  ];

  const hasMorePages = coinsData.length === PER_PAGE;

  const estimatedTotalPages =
    currentPage >= 100 ? Math.ceil(currentPage / 100) * 100 + 100 : 100;

  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto w-full max-w-350 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section className="content">
          <h4 className="mb-6 text-xl font-semibold">All Coins</h4>

          <DataTable
            tableClassName="coins-table"
            columns={columns}
            data={coinsData}
            rowKey={(coin) => coin.id}
          />

          <CoinsPagination
            currentPage={currentPage}
            totalPages={estimatedTotalPages}
            hasMorePages={hasMorePages}
          />
        </section>
      </div>
    </main>
  );
};

export default Coins;
