/**
 * INSTRUMENTS REGISTRY
 *
 * Central catalog of all supported stocks and mutual funds.
 * This is the single source of truth for instrument metadata.
 */

import type { InstrumentType, DataSource } from "@/types";

export interface InstrumentMeta {
  id: string;
  name: string;
  shortName: string;
  type: InstrumentType;
  symbol: string;       // Yahoo ticker (for stocks) or MFAPI scheme code (for MFs)
  source: DataSource;
  sector?: string;
  category?: string;   // for mutual funds
  currency: string;
  description?: string;
}

export const STOCKS: InstrumentMeta[] = [
  {
    id: "reliance",
    name: "Reliance Industries Limited",
    shortName: "Reliance",
    type: "stock",
    symbol: "RELIANCE.NS",
    source: "yahoo_finance",
    sector: "Energy & Petrochemicals",
    currency: "INR",
    description: "India's largest conglomerate by revenue",
  },
  {
    id: "tcs",
    name: "Tata Consultancy Services",
    shortName: "TCS",
    type: "stock",
    symbol: "TCS.NS",
    source: "yahoo_finance",
    sector: "Information Technology",
    currency: "INR",
    description: "India's largest IT services company",
  },
  {
    id: "infosys",
    name: "Infosys Limited",
    shortName: "Infosys",
    type: "stock",
    symbol: "INFY.NS",
    source: "yahoo_finance",
    sector: "Information Technology",
    currency: "INR",
    description: "Global IT consulting and outsourcing",
  },
  {
    id: "hdfc-bank",
    name: "HDFC Bank Limited",
    shortName: "HDFC Bank",
    type: "stock",
    symbol: "HDFCBANK.NS",
    source: "yahoo_finance",
    sector: "Banking & Finance",
    currency: "INR",
    description: "India's largest private sector bank",
  },
  {
    id: "icici-bank",
    name: "ICICI Bank Limited",
    shortName: "ICICI Bank",
    type: "stock",
    symbol: "ICICIBANK.NS",
    source: "yahoo_finance",
    sector: "Banking & Finance",
    currency: "INR",
    description: "Leading private sector bank in India",
  },
];

export const MUTUAL_FUNDS: InstrumentMeta[] = [
  {
    id: "sbi-bluechip",
    name: "SBI Bluechip Fund",
    shortName: "SBI Bluechip",
    type: "mutual_fund",
    symbol: "135781",  // MFAPI scheme code
    source: "mfapi",
    category: "Large Cap",
    currency: "INR",
    description: "Large-cap equity fund by SBI Mutual Fund",
  },
  {
    id: "hdfc-top100",
    name: "HDFC Top 100 Fund",
    shortName: "HDFC Top 100",
    type: "mutual_fund",
    symbol: "101992",  // MFAPI scheme code
    source: "mfapi",
    category: "Large Cap",
    currency: "INR",
    description: "Top 100 large-cap equity fund by HDFC AMC",
  },
  {
    id: "ppfas-flexicap",
    name: "Parag Parikh Flexi Cap Fund",
    shortName: "PPFAS Flexi Cap",
    type: "mutual_fund",
    symbol: "122639",  // MFAPI scheme code
    source: "mfapi",
    category: "Flexi Cap",
    currency: "INR",
    description: "Multi-asset flexi cap fund with global exposure",
  },
];

export const BENCHMARK = {
  id: "nifty50",
  name: "NIFTY 50",
  shortName: "NIFTY 50",
  type: "benchmark" as InstrumentType,
  symbol: "^NSEI",
  source: "yahoo_finance" as DataSource,
  currency: "INR",
  description: "India's premier broad market index",
};

export const ALL_INSTRUMENTS: InstrumentMeta[] = [...STOCKS, ...MUTUAL_FUNDS];

export function findInstrument(id: string): InstrumentMeta | undefined {
  return ALL_INSTRUMENTS.find((i) => i.id === id);
}
