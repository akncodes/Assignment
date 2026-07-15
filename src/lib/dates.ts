/**
 * DATE UTILITIES
 *
 * All dates in this application are stored and computed as ISO strings
 * in "YYYY-MM-DD" format (UTC day boundary).
 *
 * Yahoo Finance returns: "YYYY-MM-DD" ✓
 * MFAPI returns: "DD-MM-YYYY" — requires normalization.
 */

import { format, parseISO, differenceInDays, subDays } from "date-fns";

/** Convert MFAPI date "DD-MM-YYYY" → "YYYY-MM-DD" */
export function normalizeMfapiDate(raw: string): string {
  if (!raw) return "";
  const parts = raw.split("-");
  if (parts.length !== 3) return raw;
  const [dd, mm, yyyy] = parts;
  return `${yyyy}-${mm}-${dd}`;
}

/** Format an ISO date for display: "15 Jul 2025" */
export function formatDisplay(iso: string): string {
  try {
    return format(parseISO(iso), "d MMM yyyy");
  } catch {
    return iso;
  }
}

/** Format an ISO date for chart axis: "15 Jul" */
export function formatShort(iso: string): string {
  try {
    return format(parseISO(iso), "d MMM");
  } catch {
    return iso;
  }
}

/** Today's ISO date string */
export function today(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/** ISO date N days ago */
export function daysAgo(n: number): string {
  return format(subDays(new Date(), n), "yyyy-MM-dd");
}

/** Number of days between two ISO dates */
export function daysBetween(from: string, to: string): number {
  try {
    return differenceInDays(parseISO(to), parseISO(from));
  } catch {
    return 0;
  }
}

/** Human-readable holding period: "2 yrs 3 months", "8 months", "15 days" */
export function holdingPeriodLabel(purchaseDate: string): string {
  const days = daysBetween(purchaseDate, today());
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo`;
  const yrs = Math.floor(months / 12);
  const remMo = months % 12;
  return remMo > 0 ? `${yrs} yr ${remMo} mo` : `${yrs} yr`;
}

/** Validate ISO date string */
export function isValidDate(iso: string): boolean {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const d = new Date(iso);
  return !isNaN(d.getTime());
}

/** Generate an array of ISO date strings from start to end (inclusive) */
export function dateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const startD = parseISO(start);
  const endD = parseISO(end);
  let cur = startD;
  while (cur <= endD) {
    dates.push(format(cur, "yyyy-MM-dd"));
    cur = new Date(cur.getTime() + 86400000);
  }
  return dates;
}
