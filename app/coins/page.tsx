import Image from "next/image";
import Link from "next/link";

import { fetcher } from "@/lib/coingecko-client";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";

import DataTable from "@/components/tables/DataTable";
import CoinsPagination from "@/components/coins/CoinsPagination";

import type { CoinMarketData, NextPageProps, DataTableColumn } from "@/types";

export const revalidate = 30;

const PER_PAGE = 10;
// CoinGecko free tier caps at page 250 with 10 per page = 2500 coins
const MAX_PAGES = 250;

const Coins = async ({ searchParams }: NextPageProps) => {
  const params = await searchParams;
  const rawPage = Number(params?.page ?? 1);
  const currentPage = Math.max(1, Math.min(rawPage, MAX_PAGES));

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
      cellClassName: "w-12",
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
      cell: (coin) => (
        <Link
          href={`/coins/${coin.id}`}
          className="flex items-center gap-3 transition hover:opacity-80"
        >
          <Image
            src={coin.image}
            alt={coin.name}
            width={36}
            height={36}
            loading="lazy"
            className="h-9 w-auto rounded-full"
          />
          <p className="font-medium">
            {coin.name}{" "}
            <span className="text-muted-foreground text-xs">
              ({coin.symbol.toUpperCase()})
            </span>
          </p>
        </Link>
      ),
    },
    {
      header: "Price",
      cell: (coin) => formatCurrency(coin.current_price),
    },
    {
      header: "24h Change",
      cell: (coin) => {
        const change = coin.price_change_percentage_24h;
        const isTrendingUp = change > 0;

        return (
          <span
            className={cn(
              "font-medium",
              isTrendingUp ? "text-green-600" : "text-red-500",
            )}
          >
            {isTrendingUp && "+"}
            {formatPercentage(change)}
          </span>
        );
      },
    },
    {
      header: "Market Cap",
      cell: (coin) => formatCurrency(coin.market_cap),
    },
  ];

  const hasMorePages = coinsData.length === PER_PAGE && currentPage < MAX_PAGES;

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section>
          <h1 className="mb-6 text-xl font-semibold">All Coins</h1>

          {coinsData.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              Failed to load coins. Please try again later.
            </div>
          ) : (
            <DataTable
              tableClassName="coins-table"
              columns={columns}
              data={coinsData}
              rowKey={(coin) => coin.id}
            />
          )}

          <div className="mt-6">
            <CoinsPagination
              currentPage={currentPage}
              totalPages={MAX_PAGES}
              hasMorePages={hasMorePages}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Coins;
