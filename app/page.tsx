import { Suspense } from "react";

import CoinOverview from "@/components/home/CoinOverview";
import TrendingCoins from "@/components/home/TrendingCoins";
import Categories from "@/components/home/Categories";

import {
  CategoriesFallback,
  CoinOverviewFallback,
  TrendingCoinsFallback,
} from "@/components/home/fallback";

export default async function Page() {
  return (
    <main className="bg-background min-h-screen">
      {/* Container */}
      <div className="mx-auto w-full max-w-350 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Dashboard Grid */}
        <div className="space-y-6 lg:space-y-8">
          {/* ===== Top Section ===== */}
          <section
            aria-label="Market Overview"
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          >
            {/* Market Overview */}
            <div className="lg:col-span-2">
              <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm">
                <header className="border-border border-b px-5 py-4">
                  <h2 className="text-foreground text-sm font-semibold tracking-tight">
                    Market Overview
                  </h2>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    Top cryptocurrencies by market cap
                  </p>
                </header>

                <div className="p-5">
                  <Suspense fallback={<CoinOverviewFallback />}>
                    <CoinOverview />
                  </Suspense>
                </div>
              </div>
            </div>

            {/* Trending Coins */}
            <div>
              <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm">
                <header className="border-border border-b px-5 py-4">
                  <h2 className="text-foreground flex items-center gap-2 text-sm font-semibold tracking-tight">
                    🔥 Trending
                  </h2>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    Most searched coins today
                  </p>
                </header>

                <div className="p-5">
                  <Suspense fallback={<TrendingCoinsFallback />}>
                    <TrendingCoins />
                  </Suspense>
                </div>
              </div>
            </div>
          </section>

          {/* ===== Categories ===== */}
          <section aria-label="Crypto Categories">
            <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm">
              <header className="border-border border-b px-5 py-4">
                <h2 className="text-foreground text-sm font-semibold tracking-tight">
                  Categories
                </h2>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Explore crypto sectors and narratives
                </p>
              </header>

              <div className="p-5">
                <Suspense fallback={<CategoriesFallback />}>
                  <Categories />
                </Suspense>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
