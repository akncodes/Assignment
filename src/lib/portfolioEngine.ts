/**
 * PORTFOLIO ENGINE
 *
 * Computes holding-level and portfolio-level metrics from raw holdings
 * and fetched market prices.
 */

import { daysBetween, holdingPeriodLabel, today } from "@/lib/dates";
import { getValueAtDate } from "@/lib/locf";
import type {
  Holding,
  HoldingMetrics,
  PortfolioSummary,
  HistoricalPoint,
  InstrumentPrice,
} from "@/types";

/** Enrich a single holding with market data */
export function computeHoldingMetrics(
  holding: Holding,
  currentPrice: InstrumentPrice,
  _history: HistoricalPoint[]
): HoldingMetrics {
  const investedAmount = holding.quantity * holding.purchasePrice;
  const currentValue = holding.quantity * currentPrice.price;
  const gainLossAmount = currentValue - investedAmount;
  const gainLossPercent =
    investedAmount > 0 ? (gainLossAmount / investedAmount) * 100 : 0;
  const holdingPeriodDays = daysBetween(holding.purchaseDate, today());

  return {
    ...holding,
    latestPrice: currentPrice.price,
    latestDate: currentPrice.date,
    latestStatus: currentPrice.status,
    investedAmount,
    currentValue,
    gainLossAmount,
    gainLossPercent,
    holdingPeriodDays,
    holdingPeriodLabel: holdingPeriodLabel(holding.purchaseDate),
    weight: 0, // set after all holdings computed
  };
}

/** Compute portfolio-level summary from enriched holdings */
export function computePortfolioSummary(
  metrics: HoldingMetrics[],
  benchmarkReturn: number
): PortfolioSummary {
  const totalInvested = metrics.reduce((s, h) => s + h.investedAmount, 0);
  const currentValue = metrics.reduce((s, h) => s + h.currentValue, 0);
  const totalGainLoss = currentValue - totalInvested;
  const totalGainLossPercent =
    totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  return {
    totalInvested,
    currentValue,
    totalGainLoss,
    totalGainLossPercent,
    portfolioReturn: totalGainLossPercent,
    benchmarkReturn,
    outperformance: totalGainLossPercent - benchmarkReturn,
    holdingCount: metrics.length,
  };
}

/** Assign weight % to each holding based on current value */
export function assignWeights(metrics: HoldingMetrics[]): HoldingMetrics[] {
  const total = metrics.reduce((s, h) => s + h.currentValue, 0);
  return metrics.map((h) => ({
    ...h,
    weight: total > 0 ? (h.currentValue / total) * 100 : 0,
  }));
}

/**
 * Build aligned portfolio value time-series for the chart.
 *
 * For each date in the benchmark timeline, compute what the portfolio would be
 * worth given each holding's historical price on that date.
 *
 * Uses LOCF internally (the filled history arrays already contain forward-filled
 * values, so we just look up by date).
 */
export function buildPortfolioTimeline(
  holdings: Holding[],
  historiesMap: Map<string, HistoricalPoint[]>,
  benchmarkHistory: HistoricalPoint[],
  benchmarkStartValue: number
): { date: string; portfolioValue: number; benchmarkValue: number; investedValue: number }[] {
  if (!benchmarkHistory.length) return [];

  const sorted = [...benchmarkHistory].sort((a, b) => a.date.localeCompare(b.date));
  const earliestHoldingDate = holdings
    .map((h) => h.purchaseDate)
    .sort()[0];

  // Filter benchmark to the portfolio's lifespan
  const relevant = sorted.filter((pt) => pt.date >= (earliestHoldingDate ?? sorted[0].date));
  if (!relevant.length) return [];

  const benchmarkBase = relevant[0].price;

  return relevant.map((bpt) => {
    // Sum current value of each holding on this date
    let portfolioValue = 0;
    let investedValue = 0;

    for (const holding of holdings) {
      if (bpt.date < holding.purchaseDate) continue; // not yet purchased

      const history = historiesMap.get(holding.id) ?? [];
      const pt = getValueAtDate(history, bpt.date);
      const price = pt?.price ?? holding.purchasePrice;

      portfolioValue += holding.quantity * price;
      investedValue += holding.quantity * holding.purchasePrice;
    }

    const benchmarkValue =
      benchmarkBase > 0
        ? benchmarkStartValue * (bpt.price / benchmarkBase)
        : benchmarkStartValue;

    return {
      date: bpt.date,
      portfolioValue,
      benchmarkValue,
      investedValue,
    };
  });
}
