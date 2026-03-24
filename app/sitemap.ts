import { MetadataRoute } from "next";
import { fetcher } from "@/lib/coingecko-client";
import { CoinMarketData } from "@/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://terminal.swayam.io";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/coins`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ];

  try {
    // Free tier: fetch top 250 coins for sitemap
    const coins = await fetcher<CoinMarketData[]>("/coins/markets", {
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: 250,
      page: 1,
      sparkline: "false",
    });

    const coinRoutes: MetadataRoute.Sitemap = (coins ?? []).map((coin) => ({
      url: `${BASE_URL}/coins/${coin.id}`,
      lastModified: new Date(coin.last_updated ?? new Date()),
      changeFrequency: "hourly" as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...coinRoutes];
  } catch (e) {
    console.error("Sitemap coin fetch failed:", e);
    return staticRoutes;
  }
}
