// ─── Normalized market point (provider-agnostic) ─────────────────────────────
export type InstrumentType = "stock" | "mutual_fund" | "benchmark";
export type DataStatus = "live" | "forward_filled" | "cached" | "error" | "unavailable";
export type DataSource = "yahoo_finance" | "mfapi" | "unknown";

export interface MarketPoint {
  id: string;
  name: string;
  type: InstrumentType;
  price: number;
  date: string; // ISO "YYYY-MM-DD"
  source: DataSource;
  status: DataStatus;
  currency: string;
}

// ─── Historical data ─────────────────────────────────────────────────────────
export interface HistoricalPoint {
  date: string;   // ISO "YYYY-MM-DD"
  price: number;
  status: DataStatus;
  filledFrom?: string; // original date when forward-filled
}

// ─── Portfolio holdings ───────────────────────────────────────────────────────
export interface Holding {
  id: string;
  instrumentId: string;
  name: string;
  type: InstrumentType;
  symbol: string;          // ticker or MFAPI scheme code
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;    // ISO "YYYY-MM-DD"
  source: DataSource;
}

// ─── Computed holding metrics ─────────────────────────────────────────────────
export interface HoldingMetrics extends Holding {
  latestPrice: number;
  latestDate: string;
  latestStatus: DataStatus;
  investedAmount: number;
  currentValue: number;
  gainLossAmount: number;
  gainLossPercent: number;
  holdingPeriodDays: number;
  holdingPeriodLabel: string;
  weight: number; // % of portfolio
  // enriched from instrument metadata
  sector?: string;
  shortName?: string;
  category?: string;
}

// ─── Portfolio summary ────────────────────────────────────────────────────────
export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  portfolioReturn: number;
  benchmarkReturn: number;
  outperformance: number;
  holdingCount: number;
}

// ─── Chart data ───────────────────────────────────────────────────────────────
export interface ChartPoint {
  date: string;
  portfolioValue: number;
  benchmarkValue: number;
  investedValue: number;
}

export interface AllocationSlice {
  name: string;
  value: number;
  percent: number;
  type: InstrumentType;
}

export interface PerformanceBar {
  name: string;
  gainLossPercent: number;
  type: InstrumentType;
}

// ─── Insights ─────────────────────────────────────────────────────────────────
export type InsightSeverity = "positive" | "warning" | "neutral" | "info";

export interface Insight {
  id: string;
  icon: string;
  title: string;
  description: string;
  severity: InsightSeverity;
}

// ─── Health score ─────────────────────────────────────────────────────────────
export interface HealthScore {
  score: number;
  label: string;
  color: string;
  factors: HealthFactor[];
}

export interface HealthFactor {
  name: string;
  score: number;
  maxScore: number;
  description: string;
}

// ─── API response shapes ──────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  source: DataSource;
  fetchedAt: string;
  cached: boolean;
  errors?: string[];
}

export interface InstrumentPrice {
  id: string;
  name: string;
  type: InstrumentType;
  price: number;
  date: string;
  status: DataStatus;
  source: DataSource;
  history?: HistoricalPoint[];
}

// ─── Loading progress step ────────────────────────────────────────────────────
export interface LoadingStep {
  id: string;
  label: string;
  status: "pending" | "loading" | "done" | "error";
}

// ─── Form schemas (zod-validated) ─────────────────────────────────────────────
export interface AddHoldingForm {
  instrumentId: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
}
