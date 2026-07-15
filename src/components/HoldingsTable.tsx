"use client";

import { Trash2 } from "lucide-react";
import { formatINR, formatPercent } from "@/lib/formatters";
import { formatDisplay } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { HoldingMetrics } from "@/types";
import { useState, useMemo } from "react";

interface HoldingsTableProps {
  metrics: HoldingMetrics[];
  onRemove?: (id: string) => void;
}

const statusLabel: Record<string, { label: string; cls: string }> = {
  live:           { label: "Live",    cls: "text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20" },
  cached:         { label: "Cached",  cls: "text-[#94A3B8] bg-[#94A3B8]/10 border border-[#94A3B8]/20" },
  forward_filled: { label: "Filled",  cls: "text-[#3B82F6] bg-[#3B82F6]/10 border border-[#3B82F6]/20" },
  unavailable:    { label: "N/A",     cls: "text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20" },
  error:          { label: "Error",   cls: "text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20" },
};

const sourceLabel: Record<string, string> = {
  yahoo_finance: "Yahoo Finance",
  mfapi:         "MFAPI",
  unknown:       "—",
};

export function HoldingsTable({ metrics, onRemove }: HoldingsTableProps) {
  const [filter, setFilter] = useState<"all" | "stock" | "mutual_fund">("all");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const processedMetrics = useMemo(() => {
    let result = [...metrics];

    if (filter !== "all") {
      result = result.filter((m) => m.type === filter);
    }

    if (sortKey) {
      result.sort((a, b) => {
        const valA = a[sortKey as keyof HoldingMetrics];
        const valB = b[sortKey as keyof HoldingMetrics];

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (typeof valA === "string" && typeof valB === "string") {
          return sortOrder === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        return sortOrder === "asc"
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      });
    }

    return result;
  }, [metrics, filter, sortKey, sortOrder]);

  const renderSortableHeader = (label: string, key: string, align: "left" | "right" = "left") => {
    const isSorted = sortKey === key;
    return (
      <th
        onClick={() => handleSort(key)}
        className={cn(
          "px-4 py-3 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none group",
          align === "right" ? "text-right" : "text-left"
        )}
      >
        <div className={cn("inline-flex items-center gap-1", align === "right" && "flex-row-reverse")}>
          <span>{label}</span>
          <span className={cn(
            "text-[9px] transition-opacity duration-150",
            isSorted ? "text-[#3B82F6] opacity-100" : "opacity-0 group-hover:opacity-60 text-[#94A3B8]"
          )}>
            {isSorted ? (sortOrder === "asc" ? " ▲" : " ▼") : " ↕"}
          </span>
        </div>
      </th>
    );
  };

  if (!metrics.length) return null;

  return (
    <div className="space-y-4 text-14">
      {/* Filtering Tab Bar */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-14 font-medium transition-all duration-150 border",
              filter === "all"
                ? "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20"
                : "text-[#94A3B8] hover:text-white hover:bg-white/5 border-transparent"
            )}
          >
            All Assets
          </button>
          <button
            onClick={() => setFilter("stock")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-14 font-medium transition-all duration-150 border",
              filter === "stock"
                ? "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20"
                : "text-[#94A3B8] hover:text-white hover:bg-white/5 border-transparent"
            )}
          >
            Stocks
          </button>
          <button
            onClick={() => setFilter("mutual_fund")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-14 font-medium transition-all duration-150 border",
              filter === "mutual_fund"
                ? "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20"
                : "text-[#94A3B8] hover:text-white hover:bg-white/5 border-transparent"
            )}
          >
            Mutual Funds
          </button>
        </div>
        <span className="text-14 text-[#94A3B8]">
          Showing {processedMetrics.length} of {metrics.length} holdings
        </span>
      </div>

      {processedMetrics.length === 0 ? (
        <div className="py-12 text-center text-[#94A3B8] text-14 premium-card">
          No holdings match this filter.
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block table-container overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] scrollbar">
              <table className="w-full min-w-[1200px] text-14 border-collapse">
                <thead className="table-header-sticky bg-[#161F30] border-b border-white/5">
                  <tr>
                    {renderSortableHeader("Instrument", "name", "left")}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Type</th>
                    {renderSortableHeader("Purchase Date", "purchaseDate", "left")}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Period</th>
                    {renderSortableHeader("Qty", "quantity", "right")}
                    {renderSortableHeader("Avg Price", "purchasePrice", "right")}
                    {renderSortableHeader("Latest Price", "latestPrice", "right")}
                    {renderSortableHeader("Invested", "investedAmount", "right")}
                    {renderSortableHeader("Current Value", "currentValue", "right")}
                    {renderSortableHeader("Gain/Loss %", "gainLossPercent", "right")}
                    {renderSortableHeader("Gain/Loss ₹", "gainLossAmount", "right")}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Source</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {processedMetrics.map((h) => (
                    <tr
                      key={h.id}
                      className="table-row-alternate transition-colors group"
                    >
                      {/* Left aligned text */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-semibold text-white">{(h as any).shortName ?? h.name}</div>
                        <div className="text-xs text-[#94A3B8] font-mono">{h.symbol}</div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={cn(
                          "text-[11px] font-semibold uppercase px-2 py-0.5 rounded",
                          h.type === "stock"
                            ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                            : "bg-[#10B981]/10 text-[#10B981]"
                        )}>
                          {h.type === "stock" ? "Stock" : "MF"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[#94A3B8] whitespace-nowrap">
                        {formatDisplay(h.purchaseDate)}
                      </td>
                      <td className="px-4 py-3.5 text-[#94A3B8] whitespace-nowrap">
                        {h.holdingPeriodLabel}
                      </td>
                      {/* Right aligned numbers */}
                      <td className="px-4 py-3.5 font-mono text-right text-[#F3F4F6]">
                        {h.quantity}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-right text-[#94A3B8] whitespace-nowrap">
                        {formatINR(h.purchasePrice)}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-right text-[#F3F4F6] whitespace-nowrap font-medium">
                        {formatINR(h.latestPrice)}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-right text-[#94A3B8] whitespace-nowrap">
                        {formatINR(h.investedAmount, true)}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-right text-[#F3F4F6] whitespace-nowrap font-semibold">
                        {formatINR(h.currentValue, true)}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap font-mono">
                        <span
                          className={cn(
                            "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold",
                            h.gainLossPercent >= 0
                              ? "text-[#10B981] bg-[#10B981]/10"
                              : "text-[#EF4444] bg-[#EF4444]/10"
                          )}
                        >
                          {h.gainLossPercent >= 0 ? "+" : ""}
                          {h.gainLossPercent.toFixed(2)}%
                        </span>
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3.5 font-mono font-semibold text-right whitespace-nowrap",
                          h.gainLossAmount >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
                        )}
                      >
                        {h.gainLossAmount >= 0 ? "+" : ""}
                        {formatINR(h.gainLossAmount, true)}
                      </td>
                      {/* Left aligned metadata */}
                      <td className="px-4 py-3.5 text-[#94A3B8] text-xs whitespace-nowrap">
                        {sourceLabel[h.source] ?? h.source}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {(() => {
                          const s = statusLabel[h.latestStatus] ?? { label: h.latestStatus, cls: "" };
                          return (
                            <span className={cn("text-xs px-2 py-0.5 rounded font-medium", s.cls)}>
                              {s.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {onRemove && (
                          <button
                            onClick={() => onRemove(h.id)}
                            className="opacity-0 group-hover:opacity-100 text-[#94A3B8] hover:text-[#EF4444] transition-all p-1"
                            title="Remove holding"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile responsive Cards layout */}
          <div className="block md:hidden space-y-3">
            {processedMetrics.map((h) => (
              <div key={h.id} className="premium-card space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-white text-14">{(h as any).shortName ?? h.name}</div>
                    <div className="text-xs text-[#94A3B8] font-mono flex items-center gap-1.5 mt-0.5">
                      <span>{h.symbol}</span>
                      <span className="text-slate-700">·</span>
                      <span className={cn(
                        "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                        h.type === "stock" ? "bg-[#3B82F6]/10 text-[#3B82F6]" : "bg-[#10B981]/10 text-[#10B981]"
                      )}>
                        {h.type === "stock" ? "Stock" : "MF"}
                      </span>
                    </div>
                  </div>

                  {onRemove && (
                    <button
                      onClick={() => onRemove(h.id)}
                      className="text-[#94A3B8] hover:text-[#EF4444] p-1.5 rounded-lg bg-white/5 transition-colors"
                      title="Remove holding"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-14">
                  <div className="flex flex-col">
                    <span className="text-[#94A3B8] text-xs uppercase font-medium">Invested</span>
                    <span className="font-mono text-[#F3F4F6] font-medium">{formatINR(h.investedAmount, true)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#94A3B8] text-xs uppercase font-medium">Current Value</span>
                    <span className="font-mono text-white font-semibold">{formatINR(h.currentValue, true)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#94A3B8] text-xs uppercase font-medium">Avg / Latest Price</span>
                    <span className="font-mono text-[#94A3B8]">
                      {formatINR(h.purchasePrice)} / <span className="text-white">{formatINR(h.latestPrice)}</span>
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#94A3B8] text-xs uppercase font-medium">Quantity</span>
                    <span className="font-mono text-[#F3F4F6]">{h.quantity}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-[#94A3B8] text-xs uppercase font-medium">Gain / Loss</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn("px-1.5 py-0.5 rounded font-mono font-bold text-xs", 
                        h.gainLossPercent >= 0 ? "text-[#10B981] bg-[#10B981]/10" : "text-[#EF4444] bg-[#EF4444]/10"
                      )}>
                        {h.gainLossPercent >= 0 ? "+" : ""}{h.gainLossPercent.toFixed(2)}%
                      </span>
                      <span className={cn("font-bold font-mono text-14", 
                        h.gainLossAmount >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
                      )}>
                        {h.gainLossAmount >= 0 ? "+" : ""}
                        {formatINR(h.gainLossAmount, true)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
