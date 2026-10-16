import { parseStorefrontContentJson } from "@/lib/parseStorefrontContentJson"
import type { StoreSettings } from "@/lib/storeSettings"

export type CmsBlogPost = {
  slug: string
  title: string
  excerpt: string
  image: string
  dateLabel: string
  category: string
  readMinutes: number
  body: string[]
}

export type CmsStoreLocation = {
  id?: number
  slug: string
  name: string
  city: string
  address: string
  hours: string
  phone: string
  image: string
  highlights: string[]
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback
}

export function cmsBlogPosts(settings: StoreSettings | null): CmsBlogPost[] {
  const cms = parseStorefrontContentJson(settings?.storefrontContentJson)
  const raw = cms.blogPosts
  if (!Array.isArray(raw)) return []
  const out: CmsBlogPost[] = []
  for (const p of raw) {
    if (!p || typeof p !== "object" || Array.isArray(p)) continue
    const o = p as Record<string, unknown>
    const slug = str(o.slug).trim()
    const title = str(o.title).trim()
    if (!slug || !title) continue
    const body = Array.isArray(o.body) ? o.body.map((x) => String(x)) : []
    out.push({
      slug,
      title,
      excerpt: str(o.excerpt),
      image: str(o.image),
      dateLabel: str(o.dateLabel),
      category: str(o.category),
      readMinutes: typeof o.readMinutes === "number" ? o.readMinutes : 5,
      body,
    })
  }
  return out
}

export function cmsStoreLocations(settings: StoreSettings | null): CmsStoreLocation[] {
  const cms = parseStorefrontContentJson(settings?.storefrontContentJson)
  const raw = cms.storeLocations
  if (!Array.isArray(raw)) return []
  const out: CmsStoreLocation[] = []
  for (const s of raw) {
    if (!s || typeof s !== "object" || Array.isArray(s)) continue
    const o = s as Record<string, unknown>
    const slug = str(o.slug).trim()
    if (!slug) continue
    out.push({
      id: typeof o.id === "number" ? o.id : undefined,
      slug,
      name: str(o.name),
      city: str(o.city),
      address: str(o.address),
      hours: str(o.hours),
      phone: str(o.phone),
      image: str(o.image),
      highlights: Array.isArray(o.highlights) ? o.highlights.map((x) => String(x)) : [],
    })
  }
  return out
}

export function getCmsBlogPostBySlug(settings: StoreSettings | null, slug: string): CmsBlogPost | undefined {
  return cmsBlogPosts(settings).find((p) => p.slug === slug)
}

export function getCmsStoreBySlug(settings: StoreSettings | null, slug: string): CmsStoreLocation | undefined {
  return cmsStoreLocations(settings).find((s) => s.slug === slug)
}

export type CmsJobOpening = {
  id: string
  title: string
  team: string
  location: string
  type: string
  summary: string
}

export function cmsJobOpenings(settings: StoreSettings | null): CmsJobOpening[] {
  const cms = parseStorefrontContentJson(settings?.storefrontContentJson)
  const raw = cms.jobOpenings
  if (!Array.isArray(raw)) return []
  const out: CmsJobOpening[] = []
  for (const j of raw) {
    if (!j || typeof j !== "object" || Array.isArray(j)) continue
    const o = j as Record<string, unknown>
    const id = str(o.id).trim()
    const title = str(o.title).trim()
    if (!id || !title) continue
    out.push({
      id,
      title,
      team: str(o.team),
      location: str(o.location),
      type: str(o.type),
      summary: str(o.summary),
    })
  }
  return out
}

export function cmsCareersIntro(settings: StoreSettings | null): { intro?: string; perks: string[] } {
  const cms = parseStorefrontContentJson(settings?.storefrontContentJson)
  const c = cms.careersPage
  if (!c || typeof c !== "object" || Array.isArray(c)) return { perks: [] }
  const o = c as Record<string, unknown>
  return {
    intro: str(o.intro).trim() || undefined,
    perks: Array.isArray(o.perks) ? o.perks.map((x) => String(x)) : [],
  }
}
