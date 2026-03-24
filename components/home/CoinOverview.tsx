import Image from "next/image";
import { CoinDetailsData, OHLCData } from "@/types";
import { fetcher } from "@/lib/coingecko-client";
import { formatCurrency } from "@/lib/utils";
import CandlestickChart from "@/components/charts/CandlestickChartClient";
import ErrorState from "@/components/ui/error-state";

interface Props {
  coinId?: string;
}

const CoinOverview = async ({ coinId = "bitcoin" }: Props) => {
  try {
    const [coin, ohlcData] = await Promise.all([
      fetcher<CoinDetailsData>(`/coins/${coinId}`, undefined, 60),
      fetcher<OHLCData[]>(
        `/coins/${coinId}/ohlc`,
        { vs_currency: "usd", days: 1 }, // No interval/precision on free tier
        60,
      ),
    ]);

    const price = coin.market_data.current_price.usd;
    const change =
      coin.market_data.price_change_percentage_24h_in_currency.usd;
    const isUp = change >= 0;

    return (
      <div className="space-y-4">
        <CandlestickChart data={Array.isArray(ohlcData) ? ohlcData : []} coinId={coinId}>
          <div className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Image
                src={coin.image.large}
                alt={`${coin.name} logo`}
                width={48}
                height={48}
                className="rounded-full"
                priority
              />

              <div className="space-y-0.5">
                <p className="text-muted-foreground text-sm font-medium">
                  {coin.name} / {coin.symbol.toUpperCase()}
                </p>

                <div className="flex items-center gap-3">
                  <span className="text-2xl font-semibold tracking-tight">
                    {formatCurrency(price)}
                  </span>

                  <span
                    className={`text-sm font-medium ${
                      isUp ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {isUp ? "+" : ""}
                    {change.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CandlestickChart>
      </div>
    );
  } catch {
    return (
      <ErrorState
        title="Failed to load market data"
        description="Unable to fetch the latest crypto prices. Please try again."
      />
    );
  }
};

export default CoinOverview;
