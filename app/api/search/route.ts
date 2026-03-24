import { NextResponse } from "next/server";
import { fetcher } from "@/lib/coingecko-client";

interface SearchResult {
  coins: Array<{
    id: string;
    name: string;
    symbol: string;
    thumb: string;
    market_cap_rank: number | null;
  }>;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 1) {
    return NextResponse.json({ coins: [] });
  }

  if (q.length > 100) {
    return NextResponse.json({ error: "Query too long" }, { status: 400 });
  }

  try {
    const data = await fetcher<SearchResult>("/search", { query: q }, 60);
    return NextResponse.json({ coins: data.coins ?? [] });
  } catch (error) {
    console.error("Search failed:", error);
    return NextResponse.json(
      { error: "Search unavailable" },
      { status: 500 },
    );
  }
}
