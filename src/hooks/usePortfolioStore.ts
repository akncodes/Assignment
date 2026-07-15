/**
 * PORTFOLIO STORE
 *
 * Client-side state management using localStorage persistence.
 * Holdings are stored as JSON in localStorage["market-pulse-holdings"].
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import type { Holding } from "@/types";
import { findInstrument } from "@/lib/instruments";

function loadHoldings(): Holding[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("market-pulse-holdings");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHoldings(holdings: Holding[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("market-pulse-holdings", JSON.stringify(holdings));
}

export function usePortfolioStore() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHoldings(loadHoldings());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInitialized(true);
  }, []);

  const addHolding = useCallback(
    (form: {
      instrumentId: string;
      quantity: number;
      purchasePrice: number;
      purchaseDate: string;
    }) => {
      const meta = findInstrument(form.instrumentId);
      if (!meta) return;

      const holding: Holding = {
        id: `${form.instrumentId}-${Date.now()}`,
        instrumentId: form.instrumentId,
        name: meta.name,
        type: meta.type,
        symbol: meta.symbol,
        quantity: form.quantity,
        purchasePrice: form.purchasePrice,
        purchaseDate: form.purchaseDate,
        source: meta.source,
      };

      setHoldings((prev) => {
        const next = [...prev, holding];
        saveHoldings(next);
        return next;
      });
    },
    []
  );

  const removeHolding = useCallback((id: string) => {
    setHoldings((prev) => {
      const next = prev.filter((h) => h.id !== id);
      saveHoldings(next);
      return next;
    });
  }, []);

  const clearPortfolio = useCallback(() => {
    setHoldings([]);
    saveHoldings([]);
  }, []);

  return { holdings, addHolding, removeHolding, clearPortfolio, initialized };
}
