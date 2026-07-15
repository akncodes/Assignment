"use client";

import { CheckCircle2, RefreshCw, AlertCircle } from "lucide-react";

interface DataSourcePanelProps {
  sources?: {
    stocks: { name: string; status: string };
    mutualFunds: { name: string; status: string };
    benchmark: { name: string; status: string };
  };
  fetchedAt?: string;
}

export function DataSourcePanel({ sources, fetchedAt }: DataSourcePanelProps) {
  const rows = sources
    ? [
        { label: "Stocks", ...sources.stocks },
        { label: "Mutual Funds", ...sources.mutualFunds },
        { label: "Benchmark", ...sources.benchmark },
      ]
    : [
        { label: "Stocks",        name: "Yahoo Finance", status: "—" },
        { label: "Mutual Funds",  name: "MFAPI (AMFI)",  status: "—" },
        { label: "Benchmark",     name: "Yahoo Finance", status: "—" },
      ];

  return (
    <div className="glass-card p-4">
      <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">
        Data Sources
      </div>
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0"
          >
            <span className="text-sm text-slate-400">{row.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white font-medium">{row.name}</span>
              <StatusDot status={row.status} />
            </div>
          </div>
        ))}
      </div>

      {fetchedAt && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
          <RefreshCw className="w-3 h-3" />
          Updated {new Date(fetchedAt).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  if (status === "live") {
    return (
      <span className="flex items-center gap-1 text-emerald-400 text-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
        Live
      </span>
    );
  }
  if (status === "cached") {
    return (
      <span className="text-slate-500 text-xs flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" /> Cached
      </span>
    );
  }
  if (status === "unavailable") {
    return (
      <span className="text-red-400 text-xs flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> Down
      </span>
    );
  }
  return <span className="text-slate-600 text-xs">—</span>;
}
