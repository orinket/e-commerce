import { resolveOrinketBackendOrigin } from "@/lib/publicApi/server/resolveBackendOrigin"
import { parseStoreSettingsPayload, type StoreSettings } from "@/lib/storeSettings"

/** Server Components: load the same store row the storefront uses (public API). */
export async function fetchStoreSettingsServer(): Promise<StoreSettings | null> {
  const origin = resolveOrinketBackendOrigin()
  if (!origin) return null
  try {
    const res = await fetch(`${origin}/api/public/store-settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
      next: { revalidate: 120 },
    })
    const json: unknown = await res.json()
    return parseStoreSettingsPayload(json)
  } catch {
    return null
  }
}
