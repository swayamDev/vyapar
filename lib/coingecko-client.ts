import qs from "query-string";
import { QueryParams, CoinGeckoErrorBody, PoolData } from "@/types";

const BASE_URL = process.env.COINGECKO_BASE_URL!;
const API_KEY = process.env.COINGECKO_API_KEY!;

const headers = {
  "x-cg-pro-api-key": API_KEY,
  "Content-Type": "application/json",
} satisfies Record<string, string>;

export async function fetcher<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate?: number,
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
  const timeout = setTimeout(() => controller.abort("timeout"), 10000);

  try {
    const response = await fetch(url, {
      headers,
      signal: controller.signal,
      ...(revalidate && { next: { revalidate } }),
      cache: revalidate ? "force-cache" : "no-store",
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
  } catch (err) {
    console.error("Fetcher Error:", err);
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/* =========================
   Pool API Helper
========================= */

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
    // Case 1: Direct pool fetch using network + contract
    if (network && contractAddress) {
      const poolData = await fetcher<{ data: PoolData[] }>(
        `/onchain/networks/${network}/tokens/${contractAddress}/pools`,
      );

      return poolData.data?.[0] ?? fallback;
    }

    // Case 2: Search pool using id
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
