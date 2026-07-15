"use client";

import { CheckCircle2, Loader2, Circle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
  status: "pending" | "loading" | "done" | "error";
}

interface LoadingProgressProps {
  steps: Step[];
  className?: string;
}

export function LoadingProgress({ steps, className }: LoadingProgressProps) {
  return (
    <div className={cn("glass-card p-8 flex flex-col items-center gap-6", className)}>
      <div className="text-center">
        <div className="text-4xl mb-3">📊</div>
        <h2 className="text-lg font-semibold text-white">Building Your Dashboard</h2>
        <p className="text-sm text-slate-500 mt-1">
          Fetching live data from multiple sources...
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {steps.map((step, i) => (
          <div
            key={step.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300",
              step.status === "loading"
                ? "bg-sky-400/10 border border-sky-400/20"
                : step.status === "done"
                ? "bg-emerald-400/5 border border-emerald-400/10"
                : step.status === "error"
                ? "bg-red-400/10 border border-red-400/20"
                : "border border-white/5"
            )}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex-shrink-0">
              {step.status === "done" && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
              {step.status === "loading" && (
                <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
              )}
              {step.status === "pending" && (
                <Circle className="w-4 h-4 text-slate-600" />
              )}
              {step.status === "error" && (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
            </div>
            <span
              className={cn(
                "text-sm",
                step.status === "loading"
                  ? "text-sky-400 font-medium"
                  : step.status === "done"
                  ? "text-emerald-400"
                  : step.status === "error"
                  ? "text-red-400"
                  : "text-slate-500"
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Simplified loading state using the analysis query status */
export function AnalysisLoadingProgress({ isLoading }: { isLoading: boolean }) {
  const steps: Step[] = [
    {
      id: "stocks",
      label: "Fetching Stock Prices",
      status: isLoading ? "loading" : "done",
    },
    {
      id: "nav",
      label: "Fetching Mutual Fund NAV Data",
      status: isLoading ? "loading" : "done",
    },
    {
      id: "portfolio",
      label: "Building Portfolio",
      status: isLoading ? "loading" : "done",
    },
    {
      id: "benchmark",
      label: "Calculating NIFTY 50 Benchmark",
      status: isLoading ? "loading" : "done",
    },
    {
      id: "insights",
      label: "Generating Insights",
      status: isLoading ? "pending" : "done",
    },
  ];

  return <LoadingProgress steps={steps} className="max-w-xl mx-auto" />;
}
