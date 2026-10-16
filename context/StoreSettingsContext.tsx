"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { type StoreSettings, parseStoreSettingsPayload } from "@/lib/storeSettings"

type StoreSettingsContextValue = {
  settings: StoreSettings | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const StoreSettingsContext = createContext<StoreSettingsContextValue | null>(null)

export function StoreSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/public/store-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const json = await res.json()
      if (!res.ok) {
        setSettings(null)
        setError(typeof json?.message === "string" ? json.message : "Failed to load store settings")
        return
      }
      setSettings(parseStoreSettingsPayload(json))
    } catch (e) {
      setSettings(null)
      setError(e instanceof Error ? e.message : "Failed to load store settings")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo<StoreSettingsContextValue>(
    () => ({ settings, loading, error, refresh }),
    [settings, loading, error, refresh]
  )

  return <StoreSettingsContext.Provider value={value}>{children}</StoreSettingsContext.Provider>
}

export function useStoreSettings(): StoreSettingsContextValue {
  const ctx = useContext(StoreSettingsContext)
  if (!ctx) {
    throw new Error("useStoreSettings must be used within StoreSettingsProvider")
  }
  return ctx
}
