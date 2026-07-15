"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: number; // positive = up, negative = down
  highlight?: "gain" | "loss" | "neutral" | "accent";
  loading?: boolean;
  className?: string; // preserve prop in case page uses it
}

export function SummaryCard({
  label,
  value,
  subValue,
  trend,
  highlight = "neutral",
  loading = false,
}: SummaryCardProps) {
  const trendIcon =
    trend === undefined ? null : trend > 0 ? (
      <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
    ) : trend < 0 ? (
      <TrendingDown className="w-3.5 h-3.5 flex-shrink-0" />
    ) : (
      <Minus className="w-3.5 h-3.5 flex-shrink-0" />
    );

  const trendColor =
    trend === undefined
      ? "text-[#94A3B8]"
      : trend > 0
      ? "text-[#10B981]"
      : trend < 0
      ? "text-[#EF4444]"
      : "text-[#94A3B8]";

  const valueColor =
    highlight === "gain"
      ? "text-[#10B981]"
      : highlight === "loss"
      ? "text-[#EF4444]"
      : highlight === "accent"
      ? "text-[#3B82F6]"
      : "text-[#F3F4F6]";

  return (
    <div className="premium-card flex flex-col justify-between h-full w-full select-none gap-4">
      {loading ? (
        <div className="h-9 w-3/4 bg-white/5 animate-pulse rounded" />
      ) : (
        <div className={cn("text-2xl lg:text-3xl font-bold font-mono tracking-tight leading-none", valueColor)}>
          {value}
        </div>
      )}
      
      <div className="flex items-center justify-between text-sm lg:text-base mt-auto">
        <span className="text-[#94A3B8] font-medium truncate mr-2">{label}</span>
        {!loading && (subValue || trend !== undefined) && (
          <span className={cn("flex items-center gap-0.5 font-semibold font-mono whitespace-nowrap", trendColor)}>
            {trendIcon}
            <span>{subValue || (trend !== undefined ? `${trend > 0 ? "+" : ""}${trend.toFixed(1)}%` : "")}</span>
          </span>
        )}
      </div>
    </div>
  );
}
