import { NextResponse } from "next/server"
import type { UnitsPerUsd } from "@/lib/currency"
import { FALLBACK_UNITS_PER_USD } from "@/lib/currency"

const FRANKFURTER =
  "https://api.frankfurter.app/latest?from=USD&to=INR,GBP,EUR"

type FrankfurterResponse = {
  amount: number
  base: string
  date: string
  rates: Record<string, number>
}

function normalizeUnits(rates: Record<string, number>): UnitsPerUsd | null {
  const inr = rates.INR
  const gbp = rates.GBP
  const eur = rates.EUR
  if (
    typeof inr !== "number" ||
    typeof gbp !== "number" ||
    typeof eur !== "number" ||
    !Number.isFinite(inr) ||
    inr <= 0
  ) {
    return null
  }
  return {
    USD: 1,
    INR: inr,
    GBP: gbp,
    EUR: eur,
  }
}

/** Cached ~1h at the edge; client still refetches on navigation unless you add SWR. */
export async function GET() {
  try {
    const res = await fetch(FRANKFURTER, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    })
    if (!res.ok) {
      return NextResponse.json({
        unitsPerUsd: { ...FALLBACK_UNITS_PER_USD },
        source: "fallback",
        error: `HTTP ${res.status}`,
      })
    }
    const data = (await res.json()) as FrankfurterResponse
    const units = normalizeUnits(data.rates ?? {})
    if (!units) {
      return NextResponse.json({
        unitsPerUsd: { ...FALLBACK_UNITS_PER_USD },
        source: "fallback",
        error: "invalid_rates",
      })
    }
    return NextResponse.json({
      unitsPerUsd: units,
      date: data.date,
      source: "frankfurter",
    })
  } catch (e) {
    return NextResponse.json({
      unitsPerUsd: { ...FALLBACK_UNITS_PER_USD },
      source: "fallback",
      error: e instanceof Error ? e.message : "fetch_failed",
    })
  }
}
