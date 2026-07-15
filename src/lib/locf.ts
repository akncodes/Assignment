/**
 * LOCF — Last Observation Carried Forward
 *
 * When a market is closed (weekend/holiday) or a mutual fund didn't publish
 * NAV for a given date, we forward-fill the most recent known value.
 *
 * This is the critical data quality requirement described in the spec.
 *
 * Example:
 *   July 10  ₹98  ← known
 *   July 11  null ← filled from July 10 → ₹98, status: "forward_filled"
 *   July 12  ₹99  ← known
 */

import type { HistoricalPoint, DataStatus } from "@/types";

export interface RawPoint {
  date: string;
  price: number | null;
}

/**
 * Apply LOCF to a sparse series.
 *
 * @param raw         Array of {date, price|null}, sorted oldest→newest
 * @param targetDates Array of ISO date strings we need values for
 * @returns           HistoricalPoint[] with forward-filled gaps marked
 */
export function applyLOCF(
  raw: RawPoint[],
  targetDates: string[]
): HistoricalPoint[] {
  // Build a map of known prices, sorted by date
  const priceMap = new Map<string, number>();
  for (const pt of raw) {
    if (pt.price !== null && pt.price > 0) {
      priceMap.set(pt.date, pt.price);
    }
  }

  const sortedKnownDates = Array.from(priceMap.keys()).sort();

  const result: HistoricalPoint[] = [];

  for (const targetDate of targetDates) {
    const known = priceMap.get(targetDate);

    if (known !== undefined) {
      result.push({
        date: targetDate,
        price: known,
        status: "live" as DataStatus,
      });
    } else {
      // Find the most recent date before targetDate with a known price
      const fallbackDate = findLastBefore(sortedKnownDates, targetDate);
      if (fallbackDate) {
        result.push({
          date: targetDate,
          price: priceMap.get(fallbackDate)!,
          status: "forward_filled" as DataStatus,
          filledFrom: fallbackDate,
        });
      }
      // If no prior data at all, skip the date
    }
  }

  return result;
}

function findLastBefore(sortedDates: string[], target: string): string | null {
  let best: string | null = null;
  for (const d of sortedDates) {
    if (d < target) best = d;
    else break;
  }
  return best;
}

/**
 * Get the most recent NAV/price for a given date (or fallback to previous).
 * Used by the Portfolio Engine for valuation.
 */
export function getValueAtDate(
  history: HistoricalPoint[],
  targetDate: string
): HistoricalPoint | null {
  // Sort descending to find most recent on or before target
  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));
  return sorted.find((pt) => pt.date <= targetDate) ?? null;
}
