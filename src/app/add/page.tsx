"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { STOCKS, MUTUAL_FUNDS, findInstrument, ALL_INSTRUMENTS } from "@/lib/instruments";
import { usePortfolioStore } from "@/hooks/usePortfolioStore";
import { today } from "@/lib/dates";
import { useState } from "react";
import {
  CheckCircle2,
  ArrowLeft,
  TrendingUp,
  Landmark,
  Info,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const schema = z.object({
  instrumentId: z.string().min(1, "Select an instrument"),
  quantity: z
    .number()
    .positive("Must be > 0")
    .max(100_000),
  purchasePrice: z
    .number()
    .positive("Must be > 0"),
  purchaseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")
    .refine((d) => d <= today(), "Purchase date cannot be in the future"),
});

type FormValues = z.infer<typeof schema>;

export default function AddHoldingPage() {
  const router = useRouter();
  const { addHolding } = usePortfolioStore();
  const [success, setSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { purchaseDate: today() },
  });

  const selectedId = watch("instrumentId");
  const quantity = watch("quantity");
  const purchasePrice = watch("purchasePrice");
  const meta = selectedId ? findInstrument(selectedId) : null;

  const filteredInstruments = ALL_INSTRUMENTS.filter((inst) => {
    const q = searchQuery.toLowerCase();
    return (
      inst.name.toLowerCase().includes(q) ||
      inst.shortName.toLowerCase().includes(q) ||
      inst.symbol.toLowerCase().includes(q) ||
      (inst.sector && inst.sector.toLowerCase().includes(q)) ||
      (inst.category && inst.category.toLowerCase().includes(q))
    );
  });

  const estimatedValue =
    quantity && purchasePrice && !isNaN(quantity) && !isNaN(purchasePrice)
      ? quantity * purchasePrice
      : null;

  const onSubmit = (data: FormValues) => {
    addHolding(data);
    setSuccess(true);
    setTimeout(() => router.push("/"), 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1220]">
      <Header />

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6 flex flex-col gap-4 sm:gap-5 lg:gap-6 xl:gap-8 animate-fade-in text-sm lg:text-base">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm lg:text-base text-[#94A3B8] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Page heading */}
        <div className="border-b border-white/5 pb-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight leading-none">
            Add Holding
          </h1>
          <p className="text-[#94A3B8] text-sm lg:text-base mt-1">
            Search stocks/mutual funds and enter purchase details to simulate performance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 xl:gap-8 items-start">

          {/* ── LEFT: form (8 columns) ─────────────────────────────────── */}
          <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-5 lg:gap-6 xl:gap-8">
            <div className="premium-card">
              {success ? (
                /* Success state */
                <div className="flex flex-col items-center gap-4 py-12 text-center">
                  <div className="w-16 h-16 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
                  </div>
                  <div>
                    <div className="text-xl lg:text-2xl font-bold text-white">Holding Added!</div>
                    <div className="text-sm lg:text-base text-[#94A3B8] mt-1">
                      Updating and loading your dashboard...
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Instrument selector */}
                  <Field label="Instrument" error={errors.instrumentId?.message}>
                    <Controller
                      name="instrumentId"
                      control={control}
                      render={({ field }) => {
                        const activeInstrument = field.value ? findInstrument(field.value) : null;
                        return (
                          <div className="relative text-sm lg:text-base">
                            <div className="relative">
                              <input
                                type="text"
                                placeholder={activeInstrument ? activeInstrument.name : "Search stock or mutual fund..."}
                                value={searchQuery}
                                onChange={(e) => {
                                  setSearchQuery(e.target.value);
                                  setIsOpen(true);
                                }}
                                onFocus={() => setIsOpen(true)}
                                className={cn(
                                  "w-full h-11 px-4 rounded-lg bg-[#161F30] border border-white/10 text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#3B82F6]/50 focus:ring-1 focus:ring-[#3B82F6]/30 transition-all font-medium text-sm lg:text-base",
                                  errors.instrumentId && "border-[#EF4444]/40"
                                )}
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[#94A3B8]">
                                {activeInstrument && (
                                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#3B82F6]/10 text-[#3B82F6] font-bold uppercase">
                                    {activeInstrument.type === "stock" ? "Stock" : "MF"}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Dropdown list */}
                            {isOpen && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => {
                                  setIsOpen(false);
                                  setSearchQuery("");
                                }} />
                                <div className="absolute left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-[#111827] border border-white/10 rounded-lg z-50 shadow-2xl divide-y divide-white/[0.03] scrollbar">
                                  {filteredInstruments.length === 0 ? (
                                    <div className="px-4 py-3 text-sm lg:text-base text-[#94A3B8]">
                                      No instruments found
                                    </div>
                                  ) : (
                                    filteredInstruments.map((inst) => {
                                      const isSelected = field.value === inst.id;
                                      return (
                                        <button
                                          key={inst.id}
                                          type="button"
                                          onClick={() => {
                                            field.onChange(inst.id);
                                            setSearchQuery("");
                                            setIsOpen(false);
                                          }}
                                          className={cn(
                                            "w-full text-left px-4 py-3 hover:bg-white/5 flex items-center justify-between transition-colors",
                                            isSelected && "bg-[#3B82F6]/15"
                                          )}
                                        >
                                          <div className="flex items-center gap-3 min-w-0">
                                            <div className={cn(
                                              "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0",
                                              inst.type === "stock"
                                                ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                                                : "bg-[#10B981]/10 text-[#10B981]"
                                            )}>
                                              {inst.shortName.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="truncate">
                                              <div className="font-semibold text-sm lg:text-base text-white truncate">{inst.shortName}</div>
                                              <div className="text-xs text-[#94A3B8] truncate">
                                                {inst.type === "stock" ? inst.sector : inst.category}
                                              </div>
                                            </div>
                                          </div>
                                          <span className="font-mono text-xs text-[#94A3B8] ml-2">
                                            {inst.symbol}
                                          </span>
                                        </button>
                                      );
                                    })
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      }}
                    />
                  </Field>

                  {/* Instrument info card */}
                  {meta && (
                    <div className="premium-card bg-[#3B82F6]/5 border-[#3B82F6]/20 relative overflow-hidden animate-fade-in">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center text-sm lg:text-base font-bold flex-shrink-0 shadow-inner border",
                          meta.type === "stock"
                            ? "bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/25"
                            : "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/25"
                        )}>
                          {meta.shortName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-[#94A3B8]">
                              {meta.type === "stock" ? "NSE Equity" : "Mutual Fund"}
                            </span>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] font-mono">
                              {meta.symbol}
                            </span>
                          </div>
                          <h3 className="text-xl lg:text-2xl font-bold text-white tracking-tight">{meta.name}</h3>
                          {meta.description && (
                            <p className="text-sm lg:text-base text-[#94A3B8] leading-relaxed">{meta.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-[#94A3B8] pt-2 border-t border-white/5">
                            <div>
                              Sector/Category: <span className="text-white font-semibold">{meta.sector || meta.category}</span>
                            </div>
                            <div>
                              Source: <span className="text-white font-semibold">{meta.source === "yahoo_finance" ? "Yahoo Finance" : "MFAPI"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quantity + Price in a 2-col grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      label={meta?.type === "mutual_fund" ? "Units" : "Quantity (Shares)"}
                      error={errors.quantity?.message}
                    >
                      <input
                        type="number"
                        step="0.001"
                        placeholder="e.g. 10"
                        className={cn(
                          "w-full h-11 px-4 rounded-lg bg-[#161F30] border border-white/10 text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#3B82F6]/50 focus:ring-1 focus:ring-[#3B82F6]/30 transition-all font-mono text-sm lg:text-base",
                          errors.quantity && "border-[#EF4444]/40"
                        )}
                        {...register("quantity", { valueAsNumber: true })}
                      />
                    </Field>

                    <Field
                      label={meta?.type === "mutual_fund" ? "NAV (₹)" : "Price (₹)"}
                      error={errors.purchasePrice?.message}
                    >
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 2450.50"
                        className={cn(
                          "w-full h-11 px-4 rounded-lg bg-[#161F30] border border-white/10 text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#3B82F6]/50 focus:ring-1 focus:ring-[#3B82F6]/30 transition-all font-mono text-sm lg:text-base",
                          errors.purchasePrice && "border-[#EF4444]/40"
                        )}
                        {...register("purchasePrice", { valueAsNumber: true })}
                      />
                    </Field>
                  </div>

                  {/* Estimated value */}
                  {estimatedValue !== null && !isNaN(estimatedValue) && estimatedValue > 0 && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#3B82F6]/5 border border-[#3B82F6]/10 text-sm lg:text-base text-[#94A3B8]">
                      <Sparkles className="w-4 h-4 text-[#3B82F6]" />
                      <span>
                        Estimated investment:{" "}
                        <span className="text-white font-semibold font-mono">
                          ₹{new Intl.NumberFormat("en-IN").format(estimatedValue)}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Date */}
                  <Field
                    label="Purchase Date"
                    error={errors.purchaseDate?.message}
                  >
                    <input
                      type="date"
                      max={today()}
                      className={cn(
                        "w-full h-11 px-4 rounded-lg bg-[#161F30] border border-white/10 text-white focus:outline-none focus:border-[#3B82F6]/50 focus:ring-1 focus:ring-[#3B82F6]/30 transition-all text-sm lg:text-base",
                        errors.purchaseDate && "border-[#EF4444]/40"
                      )}
                      {...register("purchaseDate")}
                    />
                  </Field>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 flex items-center justify-center bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white rounded-lg font-bold text-sm lg:text-base transition-all btn-primary"
                  >
                    {isSubmitting ? "Adding..." : "Add to Portfolio"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* ── RIGHT: info panel (4 columns) ───────────────────────────── */}
          <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-5 lg:gap-6 xl:gap-8 lg:sticky lg:top-24">

            {/* Supported Stocks */}
            <div className="premium-card flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#3B82F6]" />
                  <span className="font-bold text-white text-sm lg:text-base">Supported Stocks</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-bold">
                  NSE
                </span>
              </div>
              <div className="space-y-3">
                {STOCKS.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-white/3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center text-xs font-bold text-[#3B82F6] flex-shrink-0">
                        {s.shortName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="text-sm lg:text-base font-medium text-white truncate">
                          {s.shortName}
                        </div>
                        <div className="text-xs text-[#94A3B8] truncate">{s.sector}</div>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-[#3B82F6]/60 flex-shrink-0 ml-2">
                      {s.symbol}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Supported Mutual Funds */}
            <div className="premium-card flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-[#10B981]" />
                  <span className="font-bold text-white text-sm lg:text-base">Mutual Funds</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#10B981]/10 text-[#10B981] text-xs font-bold">
                  AMFI
                </span>
              </div>
              <div className="space-y-3">
                {MUTUAL_FUNDS.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-white/3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-xs font-bold text-[#10B981] flex-shrink-0">
                        {f.shortName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="text-sm lg:text-base font-medium text-white truncate">
                          {f.shortName}
                        </div>
                        <div className="text-xs text-[#94A3B8] truncate">{f.category}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LOCF note */}
            <div className="premium-card bg-[#94A3B8]/5 border-white/5 flex gap-3 text-sm lg:text-base text-[#94A3B8] leading-relaxed">
              <Info className="w-4 h-4 text-[#94A3B8] flex-shrink-0 mt-0.5" />
              <span>
                Missing NAV / prices on weekends & holidays are automatically
                forward-filled using <strong className="text-white">LOCF</strong>{" "}
                (Last Observation Carried Forward).
              </span>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t border-white/5 py-8 text-center text-sm lg:text-base text-[#94A3B8] max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10">
        <p>© {new Date().getFullYear()} MarketPulse. All rights reserved. Built for professional portfolio analytics.</p>
      </footer>
    </div>
  );
}

/** Reusable form field wrapper */
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 text-sm lg:text-base">
      <label className="text-[#94A3B8] text-xs font-semibold uppercase tracking-wider block">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-[#EF4444] mt-1 font-semibold">{error}</p>}
    </div>
  );
}
