"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Palette } from "lucide-react";

const THEMES = [
  { name: "cyan", color: "bg-[#38bdf8]", label: "Cyan" },
  { name: "emerald", color: "bg-[#34d399]", label: "Emerald" },
  { name: "violet", color: "bg-[#a78bfa]", label: "Violet" },
  { name: "amber", color: "bg-[#fbbf24]", label: "Amber" },
  { name: "rose", color: "bg-[#f43f5e]", label: "Rose" },
];

export function ThemeToggle() {
  const [activeTheme, setActiveTheme] = useState<string>("cyan");

  useEffect(() => {
    const savedTheme = localStorage.getItem("market-pulse-theme") || "cyan";
    setActiveTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const changeTheme = (theme: string) => {
    setActiveTheme(theme);
    localStorage.setItem("market-pulse-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/4 border border-white/5">
      <Palette className="w-3.5 h-3.5 text-slate-400" />
      <span className="text-xs text-slate-500 font-medium mr-1 hidden sm:inline">Theme</span>
      <div className="flex items-center gap-1.5">
        {THEMES.map((t) => (
          <button
            key={t.name}
            onClick={() => changeTheme(t.name)}
            className={cn(
              "w-3.5 h-3.5 rounded-full transition-all duration-300 relative focus:outline-none hover:scale-125",
              t.color,
              activeTheme === t.name
                ? "ring-2 ring-white ring-offset-2 ring-offset-[#080b12] scale-110"
                : "opacity-60 hover:opacity-100"
            )}
            title={t.label}
          />
        ))}
      </div>
    </div>
  );
}
