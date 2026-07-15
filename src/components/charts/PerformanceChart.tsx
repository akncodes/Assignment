"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { useState, useEffect } from "react";

interface PerformanceBar {
  name: string;
  gainLossPercent: number;
  type: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const v = Number(payload[0].value);
  return (
    <div className="premium-card p-3 text-14 border-white/10 shadow-xl bg-[#111827]/95">
      <div className="font-semibold text-white mb-0.5">{label}</div>
      <div className={v >= 0 ? "text-[#10B981] font-semibold" : "text-[#EF4444] font-semibold"}>
        {v >= 0 ? "+" : ""}
        {v.toFixed(2)}%
      </div>
    </div>
  );
};

export function PerformanceBarChart({ data }: { data: PerformanceBar[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Make names unique for Recharts to avoid duplicating axis rows
  const uniqueData = data.map((item, index) => {
    const count = data.filter((d) => d.name === item.name).length;
    return {
      ...item,
      displayName: count > 1 ? `${item.name} (${index + 1})` : item.name,
    };
  });

  if (!mounted) {
    return <div className="w-full h-full bg-white/5 animate-pulse rounded-lg" />;
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={uniqueData}
          layout="vertical"
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
          <XAxis
            type="number"
            tickFormatter={(v) => `${v > 0 ? "+" : ""}${v.toFixed(0)}%`}
            tick={{ fill: "#94A3B8", fontSize: 14 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="displayName"
            tick={{ fill: "#94A3B8", fontSize: 14 }}
            axisLine={false}
            tickLine={false}
            width={120}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
          <ReferenceLine x={0} stroke="rgba(255,255,255,0.08)" />
          <Bar
            dataKey="gainLossPercent"
            radius={[0, 4, 4, 0]}
            background={{ fill: "rgba(255,255,255,0.01)", radius: 4 }}
          >
            {uniqueData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.gainLossPercent >= 0 ? "#10B981" : "#EF4444"}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
