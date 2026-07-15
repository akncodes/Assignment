/**
 * GET /api/instruments
 *
 * Returns the static catalog of supported instruments.
 * No external API calls — pure registry.
 */

import { NextResponse } from "next/server";
import { ALL_INSTRUMENTS, BENCHMARK } from "@/lib/instruments";

export async function GET() {
  return NextResponse.json({
    stocks: ALL_INSTRUMENTS.filter((i) => i.type === "stock"),
    mutualFunds: ALL_INSTRUMENTS.filter((i) => i.type === "mutual_fund"),
    benchmark: BENCHMARK,
  });
}
