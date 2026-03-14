"use server";

import qs from "query-string";
import { QueryParams, CoinGeckoErrorBody, PoolData } from "@/types";

const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

if (!BASE_URL) {
  throw new Error("Missing COINGECKO_BASE_URL environment variable");
}

if (!API_KEY) {
  throw new Error("Missing COINGECKO_API_KEY environment variable");
}

/* Shared headers */
const headers = {
  "x-cg-pro-api-key": API_KEY,
  "Content-Type": "application/json",
} satisfies Record<string, string>;

export async function fetcher<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate = 60,
): Promise<T> {
  const url = qs.stringifyUrl(
    {
      url: `${BASE_URL}/${endpoint}`,
      query: params,
    },
    {
      skipEmptyString: true,
      skipNull: true,
    },
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      headers,
      signal: controller.signal,
      next: { revalidate },
    });

    if (!response.ok) {
      let errorMessage = response.statusText;

      try {
        const body: CoinGeckoErrorBody = await response.json();
        errorMessage = body?.error ?? errorMessage;
      } catch {}

      throw new Error(
        `CoinGecko API Error ${response.status}: ${errorMessage}`,
      );
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

/* Fetch liquidity pools */
export async function getPools(
  id: string,
  network?: string | null,
  contractAddress?: string | null,
): Promise<PoolData> {
  const fallback: PoolData = {
    id: "",
    address: "",
    name: "",
    network: "",
  };

  try {
    if (network && contractAddress) {
      const poolData = await fetcher<{ data: PoolData[] }>(
        `/onchain/networks/${network}/tokens/${contractAddress}/pools`,
      );

      return poolData.data?.[0] ?? fallback;
    }

    const poolData = await fetcher<{ data: PoolData[] }>(
      "/onchain/search/pools",
      { query: id },
    );

    return poolData.data?.[0] ?? fallback;
  } catch (error) {
    console.error("Pool fetch error:", error);
    return fallback;
  }
}
