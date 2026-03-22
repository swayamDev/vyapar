import Image from "next/image";
import { CoinDetailsData, OHLCData } from "@/types";
import { fetcher } from "@/lib/coingecko-client";
import { formatCurrency } from "@/lib/utils";
import CandlestickChart from "@/components/charts/CandlestickChart";
import ErrorState from "@/components/ui/error-state";

interface Props {
  coinId?: string;
}

const CoinOverview = async ({ coinId = "bitcoin" }: Props) => {
  try {
    const [coin, coinOHLCData] = await Promise.all([
      fetcher<CoinDetailsData>(
        `/coins/${coinId}`,
        { dex_pair_format: "symbol" },
        60,
      ),
      fetcher<OHLCData[]>(
        `/coins/${coinId}/ohlc`,
        { vs_currency: "usd", days: 1 },
        60,
      ),
    ]);

    const price = coin.market_data.current_price.usd;
    const change = coin.market_data.price_change_percentage_24h_in_currency.usd;

    return (
      <div id="coin-overview" className="space-y-4">
        <CandlestickChart data={coinOHLCData} coinId={coinId}>
          <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Image
                src={coin.image.large}
                alt={coin.name}
                width={48}
                height={48}
                className="rounded-full"
              />

              <div className="space-y-1">
                <p className="text-muted-foreground text-sm font-medium">
                  {coin.name} / {coin.symbol.toUpperCase()}
                </p>

                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {formatCurrency(price)}
                  </h1>

                  <span
                    className={`text-sm font-medium ${
                      change >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {change >= 0 ? "+" : ""}
                    {change.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CandlestickChart>
      </div>
    );
  } catch (err) {
    return (
      <ErrorState
        title="Failed to load market data"
        description="Unable to fetch latest crypto prices. Please try again."
      />
    );
  }
};

export default CoinOverview;
