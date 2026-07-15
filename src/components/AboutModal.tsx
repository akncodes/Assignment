"use client";

import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const sections = [
  {
    title: "Why Yahoo Finance?",
    body: "Yahoo Finance (via yahoo-finance2) provides real-time and historical equity price data for NSE-listed stocks including Reliance, TCS, Infosys, HDFC Bank, and ICICI Bank. It is the most reliable publicly accessible source for Indian market data with minute-level granularity.",
  },
  {
    title: "Why MFAPI?",
    body: "AMFI (Association of Mutual Funds in India) publishes raw NAV text files daily. MFAPI normalizes these into clean JSON with scheme-code based lookups. This allows us to fetch historical NAV data for SBI Bluechip, HDFC Top 100, and Parag Parikh Flexi Cap without API key requirements.",
  },
  {
    title: "Caching Strategy",
    body: "Stock prices are cached for 5 minutes (market data changes frequently). Mutual fund NAVs are cached for 24 hours (AMFI publishes NAV once daily after 5 PM). The cache is designed as an in-memory Map that can be swapped for Redis in production.",
  },
  {
    title: "Missing Date Handling (LOCF)",
    body: "Markets close on weekends and public holidays. Mutual funds don't publish NAV on non-business days. We apply LOCF (Last Observation Carried Forward): if no price exists for a date, we use the most recent previous value and mark it as 'Forward Filled'. This ensures chart continuity and prevents gaps in portfolio valuation.",
  },
  {
    title: "Data Conflict Resolution",
    body: "When two sources provide different prices (e.g., Yahoo ₹1502 vs scraper ₹1500), we prefer the source with the latest timestamp. Yahoo Finance is preferred as the primary source for stocks; MFAPI is preferred for mutual funds. Conflicts are logged but never silently resolved.",
  },
  {
    title: "Benchmark Comparison",
    body: "NIFTY 50 (^NSEI) is fetched from Yahoo Finance. We compute its % change from the date of your earliest holding purchase to today. Your portfolio's % return is compared against this to compute outperformance. This provides a risk-adjusted perspective on your investment decisions.",
  },
];

export function AboutModal() {
  return (
    <Dialog>
      <DialogTrigger>
        <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-14 font-medium text-[#94A3B8] hover:text-white hover:bg-white/5 border border-transparent transition-all cursor-pointer">
          <Info className="w-4 h-4" />
          <span>About</span>
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-[#111827] border-white/10 text-white max-h-[80vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-20 font-bold text-white leading-none">
            How MarketPulse Works
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 mt-4 text-14">
          {sections.map((s) => (
            <div key={s.title} className="space-y-1">
              <h3 className="text-14 font-semibold text-[#3B82F6]">{s.title}</h3>
              <p className="text-14 text-[#94A3B8] leading-relaxed">{s.body}</p>
            </div>
          ))}

          {/* Data sources table */}
          <div className="mt-4 rounded-lg border border-white/5 overflow-hidden bg-[#0B1220]">
            <div className="px-4 py-2 bg-white/5 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
              Data Sources
            </div>
            {[
              { name: "Stocks", source: "Yahoo Finance", note: "Live (~5 min delay)" },
              { name: "Mutual Funds", source: "MFAPI (AMFI)", note: "Updated daily post 5 PM" },
              { name: "NIFTY 50 Benchmark", source: "Yahoo Finance", note: "Live (~5 min delay)" },
            ].map((row) => (
              <div
                key={row.name}
                className="flex items-center justify-between px-4 py-3 border-t border-white/5 text-14"
              >
                <span className="text-[#94A3B8]">{row.name}</span>
                <span className="text-white font-medium">{row.source}</span>
                <span className="text-14 text-[#94A3B8]/60">{row.note}</span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
