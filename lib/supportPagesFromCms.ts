import { parseStorefrontContentJson } from "@/lib/parseStorefrontContentJson"
import type { StoreSettings } from "@/lib/storeSettings"

export function supportPagesBlock(
  settings: StoreSettings | null | undefined,
  pageKey: string
): Record<string, unknown> | null {
  const cms = parseStorefrontContentJson(settings?.storefrontContentJson)
  const sp = cms.supportPages
  if (!sp || typeof sp !== "object" || Array.isArray(sp)) return null
  const block = (sp as Record<string, unknown>)[pageKey]
  if (!block || typeof block !== "object" || Array.isArray(block)) return null
  return block as Record<string, unknown>
}

export function legalBulletsFromCms(
  settings: StoreSettings | null | undefined,
  key: "termsPage" | "privacyPage"
): string[] {
  const cms = parseStorefrontContentJson(settings?.storefrontContentJson)
  const block = cms[key]
  if (!block || typeof block !== "object" || Array.isArray(block)) return []
  const bullets = (block as { bullets?: unknown }).bullets
  if (!Array.isArray(bullets)) return []
  return bullets.map((b) => String(b).trim()).filter(Boolean)
}
