import { fetcher } from "@/lib/coingecko-client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const coinId = searchParams.get("coinId") || "bitcoin";
  const days = searchParams.get("days") || "1";
  const interval = searchParams.get("interval") || "hourly";

  const data = await fetcher(
    `/coins/${coinId}/ohlc`,
    {
      vs_currency: "usd",
      days,
      interval,
    },
    60,
  );

  return Response.json(data);
}
