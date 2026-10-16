"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  createCurrencyFormatters,
  FALLBACK_UNITS_PER_USD,
  type CreateCurrencyFormattersOptions,
  type UnitsPerUsd,
} from "@/lib/currency"
import { useStoreSettings } from "@/context/StoreSettingsContext"

export type CurrencyContextValue = ReturnType<typeof createCurrencyFormatters> & {
  /** After first `/api/exchange-rates` attempt finishes */
  ratesReady: boolean
  liveSource: "frankfurter" | "fallback" | "pending"
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { settings } = useStoreSettings()
  const [units, setUnits] = useState<UnitsPerUsd>({ ...FALLBACK_UNITS_PER_USD })
  const [liveSource, setLiveSource] = useState<CurrencyContextValue["liveSource"]>("pending")
  const [ratesReady, setRatesReady] = useState(false)

  const formatOptions = useMemo<CreateCurrencyFormattersOptions | undefined>(() => {
    if (!settings) return undefined
    const code = String(settings.defaultCurrency || "INR").toUpperCase()
    return {
      displayCurrency: code as CreateCurrencyFormattersOptions["displayCurrency"],
      nonInrMarkupPercent: settings.otherCurrencyPriceIncreasePercent,
    }
  }, [settings])

  useEffect(() => {
    let cancelled = false
    fetch("/api/exchange-rates")
      .then((r) => r.json())
      .then(
        (data: {
          unitsPerUsd?: UnitsPerUsd
          source?: string
        }) => {
          if (cancelled) return
          if (data.unitsPerUsd) {
            setUnits(data.unitsPerUsd)
            setLiveSource(data.source === "frankfurter" ? "frankfurter" : "fallback")
          } else {
            setLiveSource("fallback")
          }
        }
      )
      .catch(() => {
        if (!cancelled) setLiveSource("fallback")
      })
      .finally(() => {
        if (!cancelled) setRatesReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const formatters = useMemo(
    () => createCurrencyFormatters(units, formatOptions),
    [units, formatOptions]
  )

  const value = useMemo<CurrencyContextValue>(
    () => ({
      ...formatters,
      ratesReady,
      liveSource,
    }),
    [formatters, ratesReady, liveSource]
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider")
  }
  return ctx
}
