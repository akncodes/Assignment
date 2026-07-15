"use client";

import { Trophy, TrendingDown, Award, ShieldAlert, RefreshCw, Zap } from "lucide-react";
import type { HoldingMetrics, PortfolioSummary, HealthScore } from "@/types";
import { formatINR } from "@/lib/formatters";

interface InsightsPanelProps {
  metrics: HoldingMetrics[];
  summary: PortfolioSummary | null;
  health: HealthScore | null;
  sources?: {
    stocks: { name: string; status: string };
    mutualFunds: { name: string; status: string };
    benchmark: { name: string; status: string };
  };
  fetchedAt?: string;
}

export function InsightsPanel({
  metrics,
  summary,
  health,
  sources,
  fetchedAt,
}: InsightsPanelProps) {
  if (!metrics.length || !summary) return null;

  // 1. Best Performer
  const best = [...metrics].sort((a, b) => b.gainLossPercent - a.gainLossPercent)[0];
  const bestName = best ? (best.shortName ?? best.name) : "—";
  const bestReturn = best ? `${best.gainLossPercent >= 0 ? "+" : ""}${best.gainLossPercent.toFixed(1)}%` : "—";

  // 2. Worst Performer
  const worst = [...metrics].sort((a, b) => a.gainLossPercent - b.gainLossPercent)[0];
  const worstName = worst ? (worst.shortName ?? worst.name) : "—";
  const worstReturn = worst ? `${worst.gainLossPercent >= 0 ? "+" : ""}${worst.gainLossPercent.toFixed(1)}%` : "—";

  // 3. Largest Holding
  const largest = [...metrics].sort((a, b) => b.currentValue - a.currentValue)[0];
  const largestName = largest ? (largest.shortName ?? largest.name) : "—";
  const largestWeight = largest ? `${largest.weight.toFixed(1)}%` : "—";

  // 4. Portfolio Health
  const healthScore = health ? `${health.score} / 100` : "—";
  const healthLabel = health ? health.label : "—";
  const healthColor =
    health && health.score >= 80
      ? "text-[#10B981]"
      : health && health.score >= 65
      ? "text-[#3B82F6]"
      : health && health.score >= 45
      ? "text-[#94A3B8]"
      : "text-[#EF4444]";

  // 5. Data Freshness
  const timeString = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
  const sourceName = sources?.stocks?.status === "live" ? "Live Markets" : "Cached Feed";

  // 6. Benchmark Comparison
  const outperf = summary.outperformance;
  const outperfValue = `${outperf >= 0 ? "+" : ""}${outperf.toFixed(1)}%`;
  const outperfLabel = outperf >= 0 ? "Outperforming NIFTY" : "Underperforming NIFTY";
  const outperfColor = outperf >= 0 ? "text-[#10B981]" : "text-[#EF4444]";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-4 w-full">
      {/* Card 1: Best Performer */}
      <div className="premium-card flex items-center justify-between py-4 px-5 w-full select-none h-full gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#10B981]/10 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5 h-5 text-[#10B981]" />
          </div>
          <div className="min-w-0">
            <div className="text-[#94A3B8] font-medium text-xs lg:text-sm">Best Performer</div>
            <div className="text-white font-semibold text-sm lg:text-base truncate" title={bestName}>
              {bestName}
            </div>
          </div>
        </div>
        <div className="text-2xl lg:text-3xl font-bold font-mono text-[#10B981] flex-shrink-0">{bestReturn}</div>
      </div>

      {/* Card 2: Worst Performer */}
      <div className="premium-card flex items-center justify-between py-4 px-5 w-full select-none h-full gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#EF4444]/10 flex items-center justify-center flex-shrink-0">
            <TrendingDown className="w-5 h-5 text-[#EF4444]" />
          </div>
          <div className="min-w-0">
            <div className="text-[#94A3B8] font-medium text-xs lg:text-sm">Worst Performer</div>
            <div className="text-white font-semibold text-sm lg:text-base truncate" title={worstName}>
              {worstName}
            </div>
          </div>
        </div>
        <div className="text-2xl lg:text-3xl font-bold font-mono text-[#EF4444] flex-shrink-0">{worstReturn}</div>
      </div>

      {/* Card 3: Largest Holding */}
      <div className="premium-card flex items-center justify-between py-4 px-5 w-full select-none h-full gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5 text-[#3B82F6]" />
          </div>
          <div className="min-w-0">
            <div className="text-[#94A3B8] font-medium text-xs lg:text-sm">Largest Holding</div>
            <div className="text-white font-semibold text-sm lg:text-base truncate" title={largestName}>
              {largestName}
            </div>
          </div>
        </div>
        <div className="text-2xl lg:text-3xl font-bold font-mono text-[#3B82F6] flex-shrink-0">{largestWeight}</div>
      </div>

      {/* Card 4: Portfolio Health */}
      <div className="premium-card flex items-center justify-between py-4 px-5 w-full select-none h-full gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-[#3B82F6]" />
          </div>
          <div className="min-w-0">
            <div className="text-[#94A3B8] font-medium text-xs lg:text-sm">Portfolio Health</div>
            <div className={`font-semibold text-sm lg:text-base truncate ${healthColor}`}>{healthLabel}</div>
          </div>
        </div>
        <div className="text-2xl lg:text-3xl font-bold font-mono text-white flex-shrink-0">{healthScore}</div>
      </div>

      {/* Card 5: Data Freshness */}
      <div className="premium-card flex items-center justify-between py-4 px-5 w-full select-none h-full gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#94A3B8]/10 flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-5 h-5 text-[#94A3B8]" />
          </div>
          <div className="min-w-0">
            <div className="text-[#94A3B8] font-medium text-xs lg:text-sm">Data Freshness</div>
            <div className="text-white font-semibold text-sm lg:text-base truncate">{sourceName}</div>
          </div>
        </div>
        <div className="text-2xl lg:text-3xl font-bold font-mono text-white flex-shrink-0">{timeString}</div>
      </div>

      {/* Card 6: Benchmark Comparison */}
      <div className="premium-card flex items-center justify-between py-4 px-5 w-full select-none h-full gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className={`w-5 h-5 ${outperfColor}`} />
          </div>
          <div className="min-w-0">
            <div className="text-[#94A3B8] font-medium text-xs lg:text-sm">vs NIFTY 50</div>
            <div className={`font-semibold text-sm lg:text-base truncate ${outperfColor}`}>{outperfLabel}</div>
          </div>
        </div>
        <div className={`text-2xl lg:text-3xl font-bold font-mono flex-shrink-0 ${outperfColor}`}>{outperfValue}</div>
      </div>
    </div>
  );
}
