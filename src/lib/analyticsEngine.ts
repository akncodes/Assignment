/**
 * ANALYTICS ENGINE
 *
 * Generates:
 *   - Smart insights from portfolio data
 *   - Portfolio Health Score (0–100)
 *   - Allocation breakdown
 *   - Performance bars
 */

import type {
  HoldingMetrics,
  PortfolioSummary,
  Insight,
  HealthScore,
  HealthFactor,
  AllocationSlice,
  PerformanceBar,
} from "@/types";

// ─── INSIGHTS ────────────────────────────────────────────────────────────────

export function generateInsights(
  metrics: HoldingMetrics[],
  summary: PortfolioSummary
): Insight[] {
  if (metrics.length === 0) return [];

  const insights: Insight[] = [];

  // Best performer
  const best = [...metrics].sort((a, b) => b.gainLossPercent - a.gainLossPercent)[0];
  insights.push({
    id: "best-performer",
    icon: "🏆",
    title: "Best Performer",
    description: `${best.name} is your top performer with +${best.gainLossPercent.toFixed(1)}% returns.`,
    severity: "positive",
  });

  // Worst performer
  const worst = [...metrics].sort((a, b) => a.gainLossPercent - b.gainLossPercent)[0];
  if (worst.gainLossPercent < 0) {
    insights.push({
      id: "worst-performer",
      icon: "📉",
      title: "Worst Performer",
      description: `${worst.name} is down ${worst.gainLossPercent.toFixed(1)}%. Monitor this position.`,
      severity: "warning",
    });
  }

  // vs benchmark
  if (summary.outperformance > 0) {
    insights.push({
      id: "benchmark-beat",
      icon: "📈",
      title: `Beat NIFTY 50 by ${summary.outperformance.toFixed(1)}%`,
      description: `Your portfolio returned ${summary.portfolioReturn.toFixed(1)}% vs NIFTY's ${summary.benchmarkReturn.toFixed(1)}%.`,
      severity: "positive",
    });
  } else {
    insights.push({
      id: "benchmark-lag",
      icon: "📊",
      title: `Lagging NIFTY 50 by ${Math.abs(summary.outperformance).toFixed(1)}%`,
      description: `NIFTY returned ${summary.benchmarkReturn.toFixed(1)}% while your portfolio returned ${summary.portfolioReturn.toFixed(1)}%.`,
      severity: "warning",
    });
  }

  // Sector concentration
  const sectorWeights = new Map<string, number>();
  for (const h of metrics) {
    const sector = h.sector ?? (h.type === "mutual_fund" ? "Mutual Fund" : "Unknown");
    sectorWeights.set(sector, (sectorWeights.get(sector) ?? 0) + h.weight);
  }
  for (const [sector, weight] of sectorWeights.entries()) {
    if (weight > 50) {
      insights.push({
        id: `concentration-${sector}`,
        icon: "⚠️",
        title: `${weight.toFixed(0)}% in ${sector}`,
        description: `High concentration in ${sector}. Consider diversifying to reduce risk.`,
        severity: "warning",
      });
    }
  }

  // MF dampening volatility
  const mfWeight = metrics
    .filter((h) => h.type === "mutual_fund")
    .reduce((s, h) => s + h.weight, 0);
  if (mfWeight > 20) {
    insights.push({
      id: "mf-diversification",
      icon: "🛡️",
      title: "Mutual Funds Reduce Volatility",
      description: `${mfWeight.toFixed(0)}% in mutual funds provides professional diversification and risk management.`,
      severity: "neutral",
    });
  }

  // Largest holding
  const largest = [...metrics].sort((a, b) => b.currentValue - a.currentValue)[0];
  insights.push({
    id: "largest-holding",
    icon: "💰",
    title: "Largest Holding",
    description: `${largest.name} is your largest position at ₹${formatAmount(largest.currentValue)} (${largest.weight.toFixed(1)}% of portfolio).`,
    severity: "info",
  });

  // Largest profit contributor
  const mostProfit = [...metrics].sort((a, b) => b.gainLossAmount - a.gainLossAmount)[0];
  if (mostProfit.gainLossAmount > 0) {
    insights.push({
      id: "top-contributor",
      icon: "📊",
      title: "Largest Profit Contributor",
      description: `${mostProfit.name} has generated ₹${formatAmount(mostProfit.gainLossAmount)} in absolute gains.`,
      severity: "positive",
    });
  }

  // Portfolio age
  const oldestDays = Math.max(...metrics.map((h) => h.holdingPeriodDays));
  insights.push({
    id: "portfolio-age",
    icon: "📅",
    title: "Portfolio Age",
    description: `Your oldest holding is ${metrics.find((h) => h.holdingPeriodDays === oldestDays)?.name} at ${oldestDays} days old.`,
    severity: "info",
  });

  return insights;
}

// ─── HEALTH SCORE ─────────────────────────────────────────────────────────────

export function computeHealthScore(
  metrics: HoldingMetrics[],
  summary: PortfolioSummary
): HealthScore {
  const factors: HealthFactor[] = [];

  // 1. Diversification (max 25 pts) — more instruments = better
  const count = metrics.length;
  const divScore = Math.min(count * 5, 25);
  factors.push({
    name: "Diversification",
    score: divScore,
    maxScore: 25,
    description: `${count} instrument${count !== 1 ? "s" : ""} held`,
  });

  // 2. Asset Mix (max 20 pts) — penalize 100% stocks
  const stockWeight = metrics
    .filter((h) => h.type === "stock")
    .reduce((s, h) => s + h.weight, 0);
  const mfWeight = 100 - stockWeight;
  const mixScore = stockWeight > 90 ? 5 : stockWeight > 70 ? 12 : mfWeight > 30 ? 20 : 15;
  factors.push({
    name: "Asset Mix",
    score: mixScore,
    maxScore: 20,
    description: `${stockWeight.toFixed(0)}% Stocks, ${mfWeight.toFixed(0)}% Mutual Funds`,
  });

  // 3. Sector Concentration (max 25 pts) — penalize high concentration
  const sectorWeights = new Map<string, number>();
  for (const h of metrics) {
    const sector = h.sector ?? "Mutual Fund";
    sectorWeights.set(sector, (sectorWeights.get(sector) ?? 0) + h.weight);
  }
  const maxConc = Math.max(...Array.from(sectorWeights.values()), 0);
  const concScore = maxConc > 80 ? 5 : maxConc > 60 ? 12 : maxConc > 40 ? 18 : 25;
  factors.push({
    name: "Sector Concentration",
    score: concScore,
    maxScore: 25,
    description: `Highest sector exposure: ${maxConc.toFixed(0)}%`,
  });

  // 4. Performance vs Benchmark (max 30 pts)
  const perf = summary.outperformance;
  const perfScore = perf > 5 ? 30 : perf > 0 ? 22 : perf > -5 ? 14 : 5;
  factors.push({
    name: "Benchmark Comparison",
    score: perfScore,
    maxScore: 30,
    description:
      perf >= 0
        ? `Outperforming NIFTY by ${perf.toFixed(1)}%`
        : `Underperforming NIFTY by ${Math.abs(perf).toFixed(1)}%`,
  });

  const total = factors.reduce((s, f) => s + f.score, 0);
  const label =
    total >= 80 ? "Excellent" : total >= 65 ? "Good" : total >= 45 ? "Fair" : "Needs Work";
  const color =
    total >= 80
      ? "text-emerald-400"
      : total >= 65
      ? "text-blue-400"
      : total >= 45
      ? "text-amber-400"
      : "text-red-400";

  return { score: total, label, color, factors };
}

// ─── ALLOCATION & PERFORMANCE ─────────────────────────────────────────────────

export function buildAllocationSlices(metrics: HoldingMetrics[]): AllocationSlice[] {
  const total = metrics.reduce((s, h) => s + h.currentValue, 0);
  return metrics.map((h) => ({
    name: h.shortName ?? h.name,
    value: h.currentValue,
    percent: total > 0 ? (h.currentValue / total) * 100 : 0,
    type: h.type,
  }));
}

export function buildPerformanceBars(metrics: HoldingMetrics[]): PerformanceBar[] {
  return [...metrics]
    .sort((a, b) => b.gainLossPercent - a.gainLossPercent)
    .map((h) => ({
      name: h.shortName ?? h.name,
      gainLossPercent: h.gainLossPercent,
      type: h.type,
    }));
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatAmount(n: number): string {
  if (n >= 1_00_00_000) return `${(n / 1_00_00_000).toFixed(2)} Cr`;
  if (n >= 1_00_000) return `${(n / 1_00_000).toFixed(2)} L`;
  return n.toFixed(0);
}
