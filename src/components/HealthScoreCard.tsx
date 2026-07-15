"use client";

import type { HealthScore } from "@/types";

export function HealthScoreCard({ health }: { health: HealthScore }) {
  const arcColor =
    health.score >= 80
      ? "#34d399"
      : health.score >= 65
      ? "#38bdf8"
      : health.score >= 45
      ? "#fbbf24"
      : "#f87171";

  return (
    <div className="glass-card p-6 space-y-5">
      {/* Score display */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">
            Portfolio Health
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-5xl font-bold tracking-tight"
              style={{ color: arcColor }}
            >
              {health.score}
            </span>
            <span className="text-lg text-slate-500">/100</span>
          </div>
          <div
            className="text-sm font-semibold mt-1"
            style={{ color: arcColor }}
          >
            {health.label}
          </div>
        </div>

        {/* Arc visual */}
        <div className="relative w-20 h-20">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="32"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="6"
            />
            <circle
              cx="40"
              cy="40"
              r="32"
              fill="none"
              stroke={arcColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(health.score / 100) * 201} 201`}
              style={{ transition: "stroke-dasharray 1s ease-out", filter: `drop-shadow(0 0 4px ${arcColor}60)` }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: arcColor }}>
            {health.score}%
          </div>
        </div>
      </div>

      {/* Factor breakdown */}
      <div className="space-y-3">
        {health.factors.map((f) => (
          <div key={f.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{f.name}</span>
              <span className="font-mono text-slate-300">
                {f.score}/{f.maxScore}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(f.score / f.maxScore) * 100}%`,
                  background: arcColor,
                  opacity: 0.7,
                }}
              />
            </div>
            <div className="text-xs text-slate-600">{f.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
