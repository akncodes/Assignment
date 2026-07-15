"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { SummaryCard } from "@/components/SummaryCard";
import { HoldingsTable } from "@/components/HoldingsTable";
import { InsightsPanel } from "@/components/InsightsPanel";
import { AnalysisLoadingProgress } from "@/components/LoadingProgress";
import { PortfolioVsBenchmarkChart } from "@/components/charts/PortfolioChart";
import { AllocationDonut } from "@/components/charts/AllocationDonut";
import { PerformanceBarChart } from "@/components/charts/PerformanceChart";
import { usePortfolioStore } from "@/hooks/usePortfolioStore";
import { usePortfolioAnalysis } from "@/hooks/usePortfolioAnalysis";
import { formatINR, formatPercent } from "@/lib/formatters";
import { Plus, AlertCircle, RefreshCw } from "lucide-react";

function pct(value: number, showSign = true) {
  return formatPercent(value, showSign);
}

export default function DashboardPage() {
  const { holdings, removeHolding, initialized } = usePortfolioStore();
  const { data, isLoading, isError, error, refetch } = usePortfolioAnalysis(
    holdings,
    initialized
  );

  /* ── Empty state ─────────────────────────────────────────────────────────── */
  if (initialized && holdings.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0B1220]">
        <Header />
        <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-12 flex flex-col items-center justify-center text-center animate-fade-in">
          <div className="premium-card max-w-lg w-full flex flex-col items-center gap-6 p-8">
            <div className="w-16 h-16 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center text-3xl">
              📈
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Simulate Your Portfolio
              </h1>
              <p className="text-sm lg:text-base text-[#94A3B8] leading-relaxed">
                Add your first Indian stock or mutual fund to unlock live market pricing, historical performance analytics, and custom AI insights against NIFTY 50.
              </p>
            </div>

            <Link
              href="/add"
              className="w-full h-11 flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white rounded-lg font-semibold text-sm lg:text-base transition-all btn-primary"
            >
              <Plus className="w-4 h-4" />
              Add Your First Holding
            </Link>

            <div className="flex flex-wrap justify-center gap-2 pt-4 border-t border-white/5 w-full">
              {["Yahoo Finance Feed", "MFAPI NAV", "NIFTY 50 Benchmark", "LOCF Analysis"].map(
                (f) => (
                  <span
                    key={f}
                    className="px-2.5 py-1 rounded bg-white/5 border border-white/5 text-[11px] font-semibold text-[#94A3B8]"
                  >
                    {f}
                  </span>
                )
              )}
            </div>
          </div>
        </main>
        <footer className="border-t border-white/5 py-6 text-center text-sm lg:text-base text-[#94A3B8] max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10">
          <p>© {new Date().getFullYear()} MarketPulse. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  /* ── Loading state ───────────────────────────────────────────────────────── */
  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0B1220]">
        <Header />
        <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-16 flex items-center justify-center">
          <AnalysisLoadingProgress isLoading={true} />
        </main>
      </div>
    );
  }

  /* ── Error state ─────────────────────────────────────────────────────────── */
  if (isError) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0B1220]">
        <Header />
        <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-16 flex flex-col items-center justify-center gap-6">
          <div className="w-16 h-16 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-[#EF4444]" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl lg:text-2xl font-bold text-white">Analysis Failed</h2>
            <p className="text-sm lg:text-base text-[#94A3B8] max-w-md">
              {String(error) || "Failed to fetch market data. Check your network and try again."}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm lg:text-base text-white font-medium transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Analysis
          </button>
        </main>
      </div>
    );
  }

  const summary = data?.summary ?? null;
  const metrics = data?.metrics ?? [];
  const timeline = data?.timeline ?? [];
  const insights = data?.insights ?? [];
  const health = data?.healthScore ?? null;
  const allocation = data?.allocation ?? [];
  const performanceBars = data?.performanceBars ?? [];
  const gainLoss = summary?.totalGainLoss ?? 0;
  const outperf = summary?.outperformance ?? 0;

  // Calculate Today's Gain (daily change) using the last two data points in the timeline
  let todayGain = 0;
  let todayGainPercent = 0;
  if (timeline && timeline.length >= 2) {
    const last = timeline[timeline.length - 1];
    const prev = timeline[timeline.length - 2];
    todayGain = last.portfolioValue - prev.portfolioValue;
    todayGainPercent = prev.portfolioValue > 0 ? (todayGain / prev.portfolioValue) * 100 : 0;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1220]">
      <Header />

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6 flex flex-col gap-4 sm:gap-5 lg:gap-6 xl:gap-8 animate-fade-in">

        {/* ── Page Title Row ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight leading-none">
              MarketPulse Dashboard
            </h1>
            <p className="text-sm lg:text-base text-[#94A3B8]">
              Portfolio Simulator · <span className="font-semibold text-white">{metrics.length} Position{metrics.length !== 1 ? "s" : ""}</span> · NIFTY 50 Benchmark
            </p>
          </div>
          <Link
            href="/add"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white rounded-lg font-semibold text-sm lg:text-base transition-all btn-primary sm:w-auto w-full"
          >
            <Plus className="w-4 h-4" />
            Add Holding
          </Link>
        </div>

        {/* ── Summary Cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6 xl:gap-8">
          <SummaryCard
            label="Portfolio Value"
            value={formatINR(summary?.currentValue ?? 0, true)}
            highlight="accent"
          />
          <SummaryCard
            label="Amount Invested"
            value={formatINR(summary?.totalInvested ?? 0, true)}
          />
          <SummaryCard
            label="Today's Gain"
            value={
              (todayGain < 0 ? "−" : "+") +
              formatINR(Math.abs(todayGain), true).replace("₹", "₹")
            }
            trend={todayGainPercent}
            highlight={todayGain >= 0 ? "gain" : "loss"}
          />
          <SummaryCard
            label="Overall Return"
            value={
              (gainLoss < 0 ? "−" : "+") +
              formatINR(Math.abs(gainLoss), true).replace("₹", "₹")
            }
            trend={summary?.totalGainLossPercent ?? 0}
            highlight={gainLoss >= 0 ? "gain" : "loss"}
          />
          <SummaryCard
            label="Benchmark Return"
            value={pct(summary?.benchmarkReturn ?? 0)}
            trend={summary?.benchmarkReturn ?? 0}
            highlight={(summary?.benchmarkReturn ?? 0) >= 0 ? "gain" : "loss"}
          />
          <SummaryCard
            label="Outperformance"
            value={(outperf >= 0 ? "+" : "") + pct(outperf, false)}
            trend={outperf}
            highlight={outperf >= 0 ? "gain" : "loss"}
          />
        </div>


        <div className="premium-card flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-xl lg:text-2xl font-bold text-white leading-none">Portfolio Performance</h2>
            <p className="text-sm lg:text-base text-[#94A3B8]">1-year trend compared against NIFTY 50 and Invested Value</p>
          </div>
          <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[400px] pt-2">
            <PortfolioVsBenchmarkChart data={timeline} />
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 xl:gap-8">

          {/* Charts (8 columns on desktop) */}
          <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-5 lg:gap-6 xl:gap-8">

            {/* Allocation Donut Card */}
            <div className="premium-card flex flex-col gap-4 h-[400px] sm:h-[450px] lg:h-[500px]">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-xl lg:text-2xl font-bold text-white leading-none">Portfolio Allocation</h2>
                <p className="text-sm lg:text-base text-[#94A3B8]">Asset distribution based on current market valuation</p>
              </div>
              <div className="flex-1 w-full overflow-hidden">
                <AllocationDonut data={allocation} />
              </div>
            </div>

            {/* Performance Bar Card */}
            <div className="premium-card flex flex-col gap-4 h-[280px] sm:h-[320px] lg:h-[350px]">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-xl lg:text-2xl font-bold text-white leading-none">Asset Performance</h2>
                <p className="text-sm lg:text-base text-[#94A3B8]">Relative percentage returns of individual holdings</p>
              </div>
              <div className="flex-1 w-full overflow-hidden pr-2">
                <PerformanceBarChart data={performanceBars} />
              </div>
            </div>

          </div>

          {/* Insights (4 columns on desktop) */}
          <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-5 lg:gap-6">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-xl lg:text-2xl font-bold text-white leading-none">Portfolio Insights</h2>
              <p className="text-sm lg:text-base text-[#94A3B8]">Key metrics and system metadata summaries</p>
            </div>
            <InsightsPanel
              metrics={metrics}
              summary={summary}
              health={health}
              sources={data?.sources}
              fetchedAt={data?.fetchedAt}
            />
          </div>

        </div>

        {/* ── Portfolio Holdings Table ─────────────────────────────────── */}
        <div className="premium-card flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-xl lg:text-2xl font-bold text-white leading-none">Positions & Holdings</h2>
            <p className="text-sm lg:text-base text-[#94A3B8]">Details of all stock and mutual fund investments</p>
          </div>
          <div className="w-full pt-2">
            <HoldingsTable metrics={metrics} onRemove={removeHolding} />
          </div>
        </div>

      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 text-center text-14 text-[#94A3B8]">
        <p>© {new Date().getFullYear()} MarketPulse. All rights reserved. Built for professional portfolio analytics.</p>
      </footer>
    </div>
  );
}
