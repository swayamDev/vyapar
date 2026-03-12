import { Suspense } from "react";
import CoinOverview from "@/components/home/CoinOverview";
import TrendingCoins from "@/components/home/TrendingCoins";
import {
  CategoriesFallback,
  CoinOverviewFallback,
  TrendingCoinsFallback,
} from "@/components/home/loading-fallback";
import Categories from "@/components/home/Categories";

const Page = async () => {
  return (
    <main className="bg-background min-h-screen">
      {/* Hero Banner */}
      <div className="border-border from-background via-muted/30 to-background relative overflow-hidden border-b bg-linear-to-br">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),transparent)]" />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col items-start gap-3">
            <span className="border-border bg-muted/60 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium tracking-wide uppercase">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live Market Data
            </span>
            <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Crypto Market
              <span className="text-muted-foreground mt-1 block text-2xl font-normal sm:text-3xl">
                Overview & Trends
              </span>
            </h1>
            <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
              Real-time prices, market caps, and trends across thousands of
              cryptocurrencies — all in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Grid — CoinOverview + TrendingCoins */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* CoinOverview takes 2/3 width on large screens */}
          <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm lg:col-span-2">
            <div className="border-border border-b px-5 py-4">
              <h2 className="text-foreground text-sm font-semibold tracking-tight">
                Market Overview
              </h2>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Top coins by market cap
              </p>
            </div>
            <div className="p-5">
              <Suspense fallback={<CoinOverviewFallback />}>
                <CoinOverview />
              </Suspense>
            </div>
          </div>

          {/* TrendingCoins takes 1/3 */}
          <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
            <div className="border-border border-b px-5 py-4">
              <h2 className="text-foreground flex items-center gap-2 text-sm font-semibold tracking-tight">
                <span>🔥</span> Trending
              </h2>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Most searched today
              </p>
            </div>
            <div className="p-5">
              <Suspense fallback={<TrendingCoinsFallback />}>
                <TrendingCoins />
              </Suspense>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
          <div className="border-border border-b px-5 py-4">
            <h2 className="text-foreground text-sm font-semibold tracking-tight">
              Categories
            </h2>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Browse by sector
            </p>
          </div>
          <div className="p-5">
            <Suspense fallback={<CategoriesFallback />}>
              <Categories />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Page;
