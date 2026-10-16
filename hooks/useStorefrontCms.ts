"use client"

import { useMemo } from "react"
import { useStoreSettings } from "@/context/StoreSettingsContext"
import { parseStorefrontContentJson } from "@/lib/parseStorefrontContentJson"
import type { StoreSettings } from "@/lib/storeSettings"

export type HeroSlideRow = NonNullable<StoreSettings["heroSlides"]>[number]

export function useStorefrontCms() {
  const { settings } = useStoreSettings()

  const cms = useMemo(
    () => parseStorefrontContentJson(settings?.storefrontContentJson),
    [settings?.storefrontContentJson]
  )

  const heroSlides = useMemo(() => {
    const rows = settings?.heroSlides
    if (!Array.isArray(rows)) return []
    return rows.filter((s) => s?.image?.trim())
  }, [settings?.heroSlides])

  const section = useMemo(() => {
    return (key: string): unknown => cms[key]
  }, [cms])

  return { settings, cms, heroSlides, section }
}

/** Safe object slice from `storefrontContentJson` for one key. */
export function useCmsSection(key: string): Record<string, unknown> | null {
  const { cms } = useStorefrontCms()
  const v = cms[key]
  if (!v || typeof v !== "object" || Array.isArray(v)) return null
  return v as Record<string, unknown>
}
