"use client";

import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatINR } from "@/lib/formatters";
import { formatShort as _fmt } from "@/lib/dates";

interface PortfolioChartProps {
  data: {
    date: string;
    portfolioValue: number;
    benchmarkValue: number;
    investedValue: number;
  }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length || !label) return null;

  return (
    <div className="premium-card p-3 text-14 space-y-1.5 border-white/10 shadow-xl bg-[#111827]/95">
      <div className="text-[#94A3B8] font-semibold mb-1">{_fmt(String(label))}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
            <span className="text-[#94A3B8]">{p.name}:</span>
          </div>
          <span className="font-semibold text-white font-mono">{formatINR(Number(p.value), true)}</span>
        </div>
      ))}
    </div>
  );
};

import { useState, useEffect } from "react";

export function PortfolioVsBenchmarkChart({ data }: PortfolioChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-full bg-white/5 animate-pulse rounded-lg" />;
  }

  // Sample to ~60 points for performance
  const sampled = data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 60)) === 0);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sampled} margin={{ top: 10, right: 5, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="benchmarkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.05} />
              <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
          <XAxis
            dataKey="date"
            tickFormatter={_fmt}
            tick={{ fill: "#94A3B8", fontSize: 14 }}
            axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v) => formatINR(v, true)}
            tick={{ fill: "#94A3B8", fontSize: 14 }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
          <Legend
            wrapperStyle={{ fontSize: "14px", color: "#94A3B8", paddingTop: "12px" }}
            formatter={(value) => <span className="text-[#94A3B8] font-medium">{value}</span>}
          />
          <Area
            type="monotone"
            dataKey="portfolioValue"
            name="Portfolio"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="url(#portfolioGrad)"
            dot={false}
            activeDot={{ r: 5, fill: "#3B82F6", stroke: "#0B1220", strokeWidth: 1.5 }}
          />
          <Area
            type="monotone"
            dataKey="benchmarkValue"
            name="NIFTY 50"
            stroke="#94A3B8"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            fill="url(#benchmarkGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#94A3B8", stroke: "#0B1220", strokeWidth: 1.5 }}
          />
          <Line
            type="monotone"
            dataKey="investedValue"
            name="Invested"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1}
            strokeDasharray="2 4"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
