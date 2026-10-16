/** Parsed optional JSON from General Settings → storefrontContentJson (dashboard). */
export function parseStorefrontContentJson(raw: string | undefined | null): Record<string, unknown> {
  if (!raw?.trim()) return {}
  try {
    const v = JSON.parse(raw) as unknown
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}
