/**
 * PORTFOLIO ANALYSIS HOOK
 *
 * Uses TanStack Query to fetch and cache the analysis from /api/portfolio/analyze.
 * Shows loading progress steps.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  Holding,
  HoldingMetrics,
  PortfolioSummary,
  ChartPoint,
  Insight,
  HealthScore,
  AllocationSlice,
  PerformanceBar,
} from "@/types";

export interface AnalysisResult {
  empty: boolean;
  metrics: HoldingMetrics[];
  summary: PortfolioSummary | null;
  timeline: ChartPoint[];
  insights: Insight[];
  healthScore: HealthScore | null;
  allocation: AllocationSlice[];
  performanceBars: PerformanceBar[];
  sources: {
    stocks: { name: string; status: string };
    mutualFunds: { name: string; status: string };
    benchmark: { name: string; status: string };
  };
  fetchedAt: string;
}

export function usePortfolioAnalysis(holdings: Holding[], enabled: boolean) {
  return useQuery<AnalysisResult>({
    queryKey: ["portfolio-analysis", holdings.map((h) => h.id + h.quantity).join(",")],
    queryFn: async () => {
      const res = await fetch("/api/portfolio/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings }),
      });
      if (!res.ok) throw new Error(`Analysis API error: ${res.status}`);
      return res.json();
    },
    enabled: enabled && holdings.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
