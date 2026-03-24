import { NextResponse } from "next/server";
import { fetcher } from "@/lib/coingecko-client";

// Cache for 25 seconds — slightly under the 30s poll interval so we always
// serve fresh data while still respecting the free tier rate limit (30 calls/min).
export const revalidate = 25;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const coinId = searchParams.get("coinId") || "bitcoin";

  if (!/^[a-z0-9-]+$/.test(coinId)) {
    return NextResponse.json({ error: "Invalid coinId" }, { status: 400 });
  }

  try {
    const data = await fetcher(
      "/simple/price",
      {
        ids: coinId,
        vs_currencies: "usd",
        include_market_cap: "true",
        include_24hr_vol: "true",
        include_24hr_change: "true",
        include_last_updated_at: "true",
      },
      25,
    );

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Price poll failed:", message);
    return NextResponse.json({ error: "Failed to fetch price" }, { status: 500 });
  }
}
