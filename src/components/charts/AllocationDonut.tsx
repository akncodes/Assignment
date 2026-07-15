"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatINR } from "@/lib/formatters";
import { useState, useEffect } from "react";

// Professional fintech color shades based on Blue, Green, and Gray
const COLORS = ["#3B82F6", "#10B981", "#60A5FA", "#94A3B8", "#1D4ED8", "#059669"];

interface AllocationSlice {
  name: string;
  value: number;
  percent: number;
  type: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as AllocationSlice;
  return (
    <div className="premium-card p-3 text-14 border-white/10 shadow-xl bg-[#111827]/95">
      <div className="font-semibold text-white mb-0.5">{d.name}</div>
      <div className="text-[#94A3B8] font-mono">{formatINR(d.value, true)}</div>
      <div className="text-[#3B82F6] font-semibold mt-0.5">{d.percent.toFixed(1)}%</div>
    </div>
  );
};

export function AllocationDonut({ data }: { data: AllocationSlice[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalValue = data.reduce((sum, s) => sum + s.value, 0);
  const activeItem = activeIndex !== null ? data[activeIndex] : null;

  return (
    <div className="relative text-sm lg:text-base select-none w-full h-full">
      {!mounted ? (
        <div className="w-full h-full bg-white/5 animate-pulse rounded-full" />
      ) : (
        <>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={72}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                    opacity={activeIndex === null || activeIndex === i ? 1 : 0.4}
                    stroke="#111827"
                    strokeWidth={activeIndex === i ? 2 : 1}
                    style={{
                      outline: "none",
                      transition: "all 0.15s ease",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-[#94A3B8] text-sm lg:text-base font-medium hover:text-white transition-colors">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center content */}
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none flex flex-col items-center w-28 text-sm lg:text-base">
            {activeItem ? (
              <>
                <span className="text-xs lg:text-sm text-[#94A3B8] font-medium truncate max-w-full px-1">
                  {activeItem.name}
                </span>
                <span className="text-xl lg:text-2xl font-bold text-white mt-0.5 font-mono truncate max-w-full">
                  {activeItem.percent.toFixed(1)}%
                </span>
                <span className="text-xs lg:text-sm text-[#3B82F6] font-semibold mt-0.5">
                  {activeItem.type === "stock" ? "Stock" : "MF"}
                </span>
              </>
            ) : (
              <>
                <span className="text-xs lg:text-sm text-[#94A3B8] font-medium">
                  Total Assets
                </span>
                <span className="text-xl lg:text-2xl font-bold text-white mt-0.5 font-mono truncate max-w-full">
                  {formatINR(totalValue, true)}
                </span>
                <span className="text-xs lg:text-sm text-[#94A3B8] font-semibold mt-0.5">
                  {data.length} Position{data.length !== 1 ? "s" : ""}
                </span>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
