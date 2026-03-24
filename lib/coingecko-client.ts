import qs from "query-string";
import { QueryParams, CoinGeckoErrorBody } from "@/types";

const BASE_URL =
  process.env.COINGECKO_BASE_URL ?? "https://api.coingecko.com/api/v3";

const API_KEY = process.env.COINGECKO_API_KEY;

// Free tier uses the Demo API key header; Pro tier uses x-cg-pro-api-key.
// The Demo key is optional — the public free API works without any key
// but has stricter rate limits (10–30 calls/min vs 30 calls/min with demo key).
const headers: Record<string, string> = {
  "Content-Type": "application/json",
  ...(API_KEY ? { "x-cg-demo-api-key": API_KEY } : {}),
};

export async function fetcher<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate?: number,
): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint.slice(1)
    : endpoint;

  const url = qs.stringifyUrl(
    {
      url: `${BASE_URL}/${normalizedEndpoint}`,
      query: params as Record<string, string | number | boolean | null>,
    },
    { skipEmptyString: true, skipNull: true },
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(url, {
      headers,
      signal: controller.signal,
      next: revalidate !== undefined ? { revalidate } : undefined,
      cache: revalidate !== undefined ? "force-cache" : "no-store",
    });

    if (!response.ok) {
      let errorMessage = response.statusText;

      try {
        const body: CoinGeckoErrorBody = await response.json();
        errorMessage = body?.error ?? errorMessage;
      } catch {
        // ignore JSON parse error on error body
      }

      throw new Error(
        `CoinGecko API Error ${response.status}: ${errorMessage}`,
      );
    }

    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timeout);
  }
}
