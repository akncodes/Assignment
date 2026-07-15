/**
 * STOCK SERVICE
 *
 * Fetches stock prices and historical data from Yahoo Finance via yahoo-finance2.
 *
 * Retry logic: 3 attempts with exponential back-off.
 * Cache: 5-minute TTL for quotes, 1-hour for history.
 * Fallback: return stale cache on all retries failing.
 */

import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();
import { cache, CACHE_TTL } from "@/lib/cache";
import { applyLOCF } from "@/lib/locf";
import { daysAgo, dateRange, today } from "@/lib/dates";
import type { InstrumentPrice, HistoricalPoint, DataStatus } from "@/types";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, BASE_DELAY_MS * 2 ** attempt));
    }
  }
  throw new Error("unreachable");
}

export async function fetchStockQuote(
  symbol: string,
  name: string,
  id: string
): Promise<InstrumentPrice> {
  const cacheKey = `stock:quote:${symbol}`;

  // 1. Fresh cache hit
  const cached = cache.get<InstrumentPrice>(cacheKey);
  if (cached) return { ...cached };

  try {
    const result = await withRetry(() =>
      yahooFinance.quote(symbol, { fields: ["regularMarketPrice", "regularMarketTime"] })
    );

    const r = result as { regularMarketPrice?: number; regularMarketTime?: Date | number | string };
    const price = r.regularMarketPrice ?? 0;
    const rawDate = r.regularMarketTime
      ? new Date(r.regularMarketTime).toISOString().split("T")[0]
      : today();

    const data: InstrumentPrice = {
      id,
      name,
      type: "stock",
      price,
      date: rawDate,
      status: "live" as DataStatus,
      source: "yahoo_finance",
    };

    cache.set(cacheKey, data, CACHE_TTL.STOCK);
    return data;
  } catch {
    // Fallback: stale cache
    const stale = cache.getStale<InstrumentPrice>(cacheKey);
    if (stale) return { ...stale, status: "cached" };

    return {
      id,
      name,
      type: "stock",
      price: 0,
      date: today(),
      status: "unavailable",
      source: "yahoo_finance",
    };
  }
}

export async function fetchStockHistory(
  symbol: string,
  id: string,
  name: string,
  days = 365
): Promise<HistoricalPoint[]> {
  const cacheKey = `stock:history:${symbol}:${days}`;

  const cached = cache.get<HistoricalPoint[]>(cacheKey);
  if (cached) return cached;

  try {
    const from = new Date(daysAgo(days));
    const to = new Date();

    const result = await withRetry(() =>
      yahooFinance.historical(symbol, {
        period1: from,
        period2: to,
        interval: "1d",
      })
    );

    const rows = result as { date: Date | string; close?: number | null }[];
    const raw = rows.map((r) => ({
      date: new Date(r.date).toISOString().split("T")[0],
      price: r.close ?? null,
    }));

    // LOCF across the full date range
    const allDates = dateRange(daysAgo(days), today());
    const filled = applyLOCF(raw, allDates);

    cache.set(cacheKey, filled, CACHE_TTL.HISTORY);
    return filled;
  } catch {
    const stale = cache.getStale<HistoricalPoint[]>(cacheKey);
    return stale ?? [];
  }
}
