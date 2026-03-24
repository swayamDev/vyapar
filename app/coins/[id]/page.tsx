import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";

import { fetcher } from "@/lib/coingecko-client";
import { formatCurrency } from "@/lib/utils";

import LiveMarketWrapper from "@/components/realtime/LiveMarketWrapper";
import Converter from "@/components/converter/CryptoConverter";

import type { CoinDetailsData, OHLCData, NextPageProps } from "@/types";

export const revalidate = 60;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://vyapar.app";

export async function generateMetadata({ params }: NextPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const coin = await fetcher<CoinDetailsData>(`/coins/${id}`);

    const title = `${coin.name} (${coin.symbol.toUpperCase()}) Price – Vyapar`;
    const description = `Live ${coin.name} price, candlestick chart, and market data. Current price: ${formatCurrency(coin.market_data.current_price.usd)}.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${APP_URL}/coins/${id}`,
        siteName: "Vyapar",
        type: "website",
      },
      twitter: { card: "summary", title, description },
    };
  } catch {
    return { title: "Coin – Vyapar" };
  }
}

const Page = async ({ params }: NextPageProps) => {
  const { id } = await params;

  let coinData: CoinDetailsData | null = null;
  let coinOHLCData: OHLCData[] = [];

  try {
    const [coin, ohlc] = await Promise.all([
      fetcher<CoinDetailsData>(`/coins/${id}`),
      fetcher<OHLCData[]>(`/coins/${id}/ohlc`, {
        vs_currency: "usd",
        days: 1,
        // No interval or precision — free tier only
      }),
    ]);

    coinData = coin;
    coinOHLCData = Array.isArray(ohlc) ? ohlc : [];
  } catch (error) {
    console.error("Failed to fetch coin data:", error);
  }

  if (!coinData) notFound();

  const coinDetails = [
    {
      label: "Market Cap",
      value: formatCurrency(coinData.market_data.market_cap.usd),
    },
    {
      label: "Market Cap Rank",
      value: `#${coinData.market_cap_rank}`,
    },
    {
      label: "Total Volume",
      value: formatCurrency(coinData.market_data.total_volume.usd),
    },
    {
      label: "Website",
      link: coinData.links.homepage?.[0] || null,
      linkText: "Homepage",
    },
    {
      label: "Explorer",
      link: coinData.links.blockchain_site?.[0] || null,
      linkText: "Explorer",
    },
    {
      label: "Community",
      link: coinData.links.subreddit_url || null,
      linkText: "Community",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    name: coinData.name,
    description: coinData.description?.en?.slice(0, 200),
    url: `${APP_URL}/coins/${id}`,
    image: coinData.image.large,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: coinData.market_data.current_price.usd,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-background min-h-screen">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <LiveMarketWrapper
                coinId={id}
                coin={coinData}
                coinOHLCData={coinOHLCData}
              />
            </div>

            <div className="flex flex-col gap-6">
              <Converter
                symbol={coinData.symbol}
                icon={coinData.image.small}
                priceList={coinData.market_data.current_price}
              />

              <div className="bg-card border-border rounded-2xl border p-5">
                <h2 className="text-foreground mb-4 text-sm font-semibold">
                  Coin Details
                </h2>

                <ul className="space-y-3">
                  {coinDetails.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center justify-between gap-4"
                    >
                      <p className="text-muted-foreground text-sm">{item.label}</p>

                      {item.link ? (
                        <div className="flex items-center gap-1">
                          <Link
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary text-sm font-medium hover:underline"
                          >
                            {item.linkText}
                          </Link>
                          <ArrowUpRight size={14} className="text-primary" />
                        </div>
                      ) : (
                        <p className="text-sm font-medium">{item.value}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
