/**
 * BENCHMARK SERVICE
 *
 * Fetches NIFTY 50 index data from Yahoo Finance (^NSEI).
 * Same retry + cache pattern as StockService.
 */

import { fetchStockHistory, fetchStockQuote } from "./stockService";
import { BENCHMARK } from "@/lib/instruments";
import type { HistoricalPoint, InstrumentPrice } from "@/types";

export async function fetchBenchmarkQuote(): Promise<InstrumentPrice> {
  return fetchStockQuote(BENCHMARK.symbol, BENCHMARK.name, BENCHMARK.id);
}

export async function fetchBenchmarkHistory(days = 365): Promise<HistoricalPoint[]> {
  return fetchStockHistory(BENCHMARK.symbol, BENCHMARK.id, BENCHMARK.name, days);
}

/**
 * Compute benchmark return over a period.
 * Given a start date and current benchmark history, return the % change.
 */
export function computeBenchmarkReturn(
  history: HistoricalPoint[],
  sinceDate: string
): number {
  if (history.length < 2) return 0;

  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const startPoint = sorted.find((p) => p.date >= sinceDate);
  const endPoint = sorted[sorted.length - 1];

  if (!startPoint || !endPoint || startPoint.price === 0) return 0;
  return ((endPoint.price - startPoint.price) / startPoint.price) * 100;
}
