/**
 * POST /api/portfolio/analyze
 *
 * Body: { holdings: Holding[] }
 *
 * 1. Fetches current prices + 1-year history for each holding
 * 2. Fetches NIFTY 50 benchmark data
 * 3. Applies LOCF to fill missing dates
 * 4. Computes all portfolio metrics via PortfolioEngine
 * 5. Generates insights + health score via AnalyticsEngine
 * 6. Returns normalized, enriched dashboard payload
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchStockQuote, fetchStockHistory } from "@/services/stockService";
import { fetchFundQuote, fetchFundHistory } from "@/services/mutualFundService";
import { fetchBenchmarkHistory, computeBenchmarkReturn } from "@/services/benchmarkService";
import {
  computeHoldingMetrics,
  computePortfolioSummary,
  assignWeights,
  buildPortfolioTimeline,
} from "@/lib/portfolioEngine";
import {
  generateInsights,
  computeHealthScore,
  buildAllocationSlices,
  buildPerformanceBars,
} from "@/lib/analyticsEngine";
import { findInstrument } from "@/lib/instruments";
import { today } from "@/lib/dates";
import type { Holding, HoldingMetrics, HistoricalPoint } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const holdings: Holding[] = body.holdings ?? [];

    if (holdings.length === 0) {
      return NextResponse.json({ empty: true, metrics: [], summary: null });
    }

    // ── Fetch all prices + histories in parallel ───────────────────────────
    const [benchmarkHistory, ...instrumentData] = await Promise.all([
      fetchBenchmarkHistory(365),
      ...holdings.map(async (h) => {
        const meta = findInstrument(h.instrumentId);
        if (!meta) return null;

        if (meta.type === "stock") {
          const [quote, history] = await Promise.all([
            fetchStockQuote(meta.symbol, meta.name, meta.id),
            fetchStockHistory(meta.symbol, meta.id, meta.name, 365),
          ]);
          return { holding: h, meta, quote, history };
        } else {
          const [quote, history] = await Promise.all([
            fetchFundQuote(meta.symbol, meta.name, meta.id),
            fetchFundHistory(meta.symbol, meta.id, meta.name, 365),
          ]);
          return { holding: h, meta, quote, history };
        }
      }),
    ]);

    // ── Compute benchmark return since earliest purchase ───────────────────
    const earliestDate =
      holdings.map((h) => h.purchaseDate).sort()[0] ?? today();
    const benchmarkReturn = computeBenchmarkReturn(benchmarkHistory, earliestDate);

    // ── Enrich each holding ────────────────────────────────────────────────
    const rawMetrics: HoldingMetrics[] = [];
    const historiesMap = new Map<string, HistoricalPoint[]>();

    for (const data of instrumentData) {
      if (!data) continue;
      const metrics = computeHoldingMetrics(
        {
          ...data.holding,
          name: data.meta.name,
          source: data.meta.source,
        },
        data.quote,
        data.history
      );
      rawMetrics.push({
        ...metrics,
        sector: data.meta.sector,
        shortName: data.meta.shortName,
        category: data.meta.category,
      } as HoldingMetrics & { sector?: string; shortName?: string; category?: string });

      historiesMap.set(data.holding.id, data.history);
    }

    const metrics = assignWeights(rawMetrics);
    const summary = computePortfolioSummary(metrics, benchmarkReturn);

    // ── Build timeline for charts ─────────────────────────────────────────
    const timeline = buildPortfolioTimeline(
      holdings,
      historiesMap,
      benchmarkHistory,
      summary.totalInvested
    );

    // ── Analytics ─────────────────────────────────────────────────────────
    const insights = generateInsights(metrics, summary);
    const healthScore = computeHealthScore(metrics, summary);
    const allocation = buildAllocationSlices(metrics);
    const performanceBars = buildPerformanceBars(metrics);

    // ── Data sources status ───────────────────────────────────────────────
    const sources = {
      stocks: {
        name: "Yahoo Finance",
        status: metrics.some((m) => m.type === "stock" && m.latestStatus === "live")
          ? "live"
          : "cached",
      },
      mutualFunds: {
        name: "MFAPI (AMFI)",
        status: metrics.some(
          (m) => m.type === "mutual_fund" && m.latestStatus === "live"
        )
          ? "live"
          : "cached",
      },
      benchmark: {
        name: "Yahoo Finance",
        status: benchmarkHistory.length > 0 ? "live" : "unavailable",
      },
    };

    return NextResponse.json({
      empty: false,
      metrics,
      summary,
      timeline,
      insights,
      healthScore,
      allocation,
      performanceBars,
      sources,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[portfolio/analyze]", err);
    return NextResponse.json(
      { error: "Analysis failed", details: String(err) },
      { status: 500 }
    );
  }
}
