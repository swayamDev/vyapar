export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  last_updated: string;
}

export interface CoinDetailsData {
  id: string;
  name: string;
  symbol: string;
  asset_platform_id?: string | null;

  detail_platforms?: Record<
    string,
    {
      decimal_place?: number | null;
      contract_address?: string | null;
      geckoterminal_url?: string | null;
    }
  >;

  image: {
    large: string;
    small: string;
  };

  market_data: {
    current_price: {
      usd: number;
      [key: string]: number;
    };
    price_change_24h_in_currency: {
      usd: number;
    };
    price_change_percentage_24h_in_currency: {
      usd: number;
    };
    price_change_percentage_30d_in_currency: {
      usd: number;
    };
    market_cap: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
  };

  market_cap_rank: number;

  description: {
    en: string;
  };

  links: {
    homepage?: string[];
    blockchain_site?: string[];
    subreddit_url?: string | null;
  };
}
