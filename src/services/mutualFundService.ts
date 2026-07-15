/**
 * MUTUAL FUND SERVICE
 *
 * Fetches NAV data from MFAPI (https://api.mfapi.in).
 * MFAPI provides normalized AMFI data in JSON format.
 *
 * MFAPI date format: "DD-MM-YYYY" → normalized to "YYYY-MM-DD"
 * Cache TTL: 24 hours (NAV is published once daily by AMFI)
 *
 * Error handling:
 *   Retry 3× with exponential back-off
 *   Fallback to stale cache
 *   Forward-fill missing dates via LOCF
 */

import { cache, CACHE_TTL } from "@/lib/cache";
import { normalizeMfapiDate } from "@/lib/dates";
import { applyLOCF } from "@/lib/locf";
import { dateRange, daysAgo, today } from "@/lib/dates";
import type { InstrumentPrice, HistoricalPoint, DataStatus } from "@/types";

const MFAPI_BASE = "https://api.mfapi.in/mf";
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 600;

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

interface MfapiMeta {
  scheme_name: string;
  fund_house: string;
  scheme_type: string;
  scheme_category: string;
}

interface MfapiNavEntry {
  date: string; // "DD-MM-YYYY"
  nav: string;  // numeric string
}

interface MfapiResponse {
  meta: MfapiMeta;
  data: MfapiNavEntry[];
  status: string;
}

export async function fetchFundQuote(
  schemeCode: string,
  name: string,
  id: string
): Promise<InstrumentPrice> {
  const cacheKey = `mf:quote:${schemeCode}`;

  const cached = cache.get<InstrumentPrice>(cacheKey);
  if (cached) return { ...cached };

  try {
    const res = await withRetry(() =>
      fetch(`${MFAPI_BASE}/${schemeCode}`, { next: { revalidate: 86400 } }).then(
        (r) => {
          if (!r.ok) throw new Error(`MFAPI ${r.status}`);
          return r.json() as Promise<MfapiResponse>;
        }
      )
    );

    // MFAPI returns data sorted newest→oldest
    const latest = res.data[0];
    const nav = parseFloat(latest.nav);
    const date = normalizeMfapiDate(latest.date);

    const data: InstrumentPrice = {
      id,
      name,
      type: "mutual_fund",
      price: nav,
      date,
      status: "live" as DataStatus,
      source: "mfapi",
    };

    cache.set(cacheKey, data, CACHE_TTL.MUTUAL_FUND);
    return data;
  } catch {
    const stale = cache.getStale<InstrumentPrice>(cacheKey);
    if (stale) return { ...stale, status: "cached" };

    return {
      id,
      name,
      type: "mutual_fund",
      price: 0,
      date: today(),
      status: "unavailable",
      source: "mfapi",
    };
  }
}

export async function fetchFundHistory(
  schemeCode: string,
  id: string,
  name: string,
  days = 365
): Promise<HistoricalPoint[]> {
  const cacheKey = `mf:history:${schemeCode}:${days}`;

  const cached = cache.get<HistoricalPoint[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await withRetry(() =>
      fetch(`${MFAPI_BASE}/${schemeCode}`, { next: { revalidate: 86400 } }).then(
        (r) => {
          if (!r.ok) throw new Error(`MFAPI ${r.status}`);
          return r.json() as Promise<MfapiResponse>;
        }
      )
    );

    const cutoff = daysAgo(days);
    const raw = res.data
      .map((entry) => ({
        date: normalizeMfapiDate(entry.date),
        price: parseFloat(entry.nav),
      }))
      .filter((pt) => pt.date >= cutoff && !isNaN(pt.price));

    // LOCF to fill weekends / holidays / missing NAV days
    const allDates = dateRange(cutoff, today());
    const filled = applyLOCF(raw, allDates);

    cache.set(cacheKey, filled, CACHE_TTL.MUTUAL_FUND);
    return filled;
  } catch {
    const stale = cache.getStale<HistoricalPoint[]>(cacheKey);
    return stale ?? [];
  }
}
