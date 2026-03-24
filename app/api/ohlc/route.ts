import { NextResponse } from "next/server";
import { fetcher } from "@/lib/coingecko-client";

// Free tier OHLC granularity (auto-determined by CoinGecko based on days):
//   1 day      → 30-minute candles
//   2–90 days  → 4-hour candles
//   91+ days   → daily candles
// The `interval` and `precision` params are Pro-only and are NOT sent here.

const VALID_DAYS = new Set(["1", "7", "14", "30", "90", "180", "365", "max"]);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const coinId = searchParams.get("coinId") || "bitcoin";
  const days = searchParams.get("days") || "1";

  if (!/^[a-z0-9-]+$/.test(coinId)) {
    return NextResponse.json({ error: "Invalid coinId" }, { status: 400 });
  }

  if (!VALID_DAYS.has(days)) {
    return NextResponse.json({ error: "Invalid days parameter" }, { status: 400 });
  }

  try {
    const data = await fetcher(
      `/coins/${coinId}/ohlc`,
      {
        vs_currency: "usd",
        days,
        // No `interval` or `precision` — those are Pro-only params
      },
      60,
    );

    if (!Array.isArray(data)) {
      throw new Error("Unexpected response format from CoinGecko");
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("OHLC fetch failed:", message);
    return NextResponse.json({ error: "Failed to fetch OHLC data" }, { status: 500 });
  }
}
