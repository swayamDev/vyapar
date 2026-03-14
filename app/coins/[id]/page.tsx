import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { fetcher, getPools } from "@/lib/coingecko-client";
import { formatCurrency } from "@/lib/utils";

import LiveMarketWrapper from "@/components/realtime/LiveMarketWrapper";
import Converter from "@/components/converter/CryptoConverter";

import type { CoinDetailsData, OHLCData, NextPageProps } from "@/types";

export const revalidate = 60;

const Page = async ({ params }: NextPageProps) => {
  const { id } = await params;

  let coinData: CoinDetailsData | null = null;
  let coinOHLCData: OHLCData[] = [];

  try {
    const [coin, ohlc] = await Promise.all([
      fetcher<CoinDetailsData>(`/coins/${id}`, {
        dex_pair_format: "contract_address",
      }),
      fetcher<OHLCData[]>(`/coins/${id}/ohlc`, {
        vs_currency: "usd",
        days: 1,
        interval: "hourly",
        precision: "full",
      }),
    ]);

    coinData = coin;
    coinOHLCData = ohlc;
  } catch (error) {
    console.error("Failed to fetch coin data:", error);
  }

  if (!coinData) {
    return (
      <main className="bg-background min-h-screen">
        <div className="mx-auto w-full max-w-350 px-4 py-6 text-center sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <h2 className="text-xl font-semibold">Coin not found</h2>
        </div>
      </main>
    );
  }

  /* Platform / Network Detection */

  const platform = coinData.asset_platform_id
    ? coinData.detail_platforms?.[coinData.asset_platform_id]
    : null;

  const network = platform?.geckoterminal_url?.split("/")?.[3] ?? null;
  const contractAddress = platform?.contract_address ?? null;

  let poolId = "";

  try {
    const pool = await getPools(id, network, contractAddress);
    poolId = pool?.id ?? "";
  } catch (error) {
    console.error("Pool fetch failed:", error);
  }

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
      link: coinData.links.homepage?.[0],
      linkText: "Homepage",
    },
    {
      label: "Explorer",
      link: coinData.links.blockchain_site?.[0],
      linkText: "Explorer",
    },
    {
      label: "Community",
      link: coinData.links.subreddit_url,
      linkText: "Community",
    },
  ];

  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto w-full max-w-350 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Left Section */}

        <section className="primary">
          <LiveMarketWrapper
            coinId={id}
            poolId={poolId}
            coin={coinData}
            coinOHLCData={coinOHLCData}
          >
            <h4>Exchange Listings</h4>
          </LiveMarketWrapper>
        </section>

        {/* Right Section */}

        <section className="secondary">
          <Converter
            symbol={coinData.symbol}
            icon={coinData.image.small}
            priceList={coinData.market_data.current_price}
          />

          <div className="details">
            <h4>Coin Details</h4>

            <ul className="details-grid">
              {coinDetails.map((item) => (
                <li key={item.label}>
                  <p className="label">{item.label}</p>

                  {item.link ? (
                    <div className="link">
                      <Link
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.linkText}
                      </Link>

                      <ArrowUpRight size={16} />
                    </div>
                  ) : (
                    <p className="text-base font-medium">{item.value}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Page;
