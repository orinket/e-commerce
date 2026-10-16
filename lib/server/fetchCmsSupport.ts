import { resolveOrinketBackendOrigin } from "@/lib/publicApi/server/resolveBackendOrigin"

export type CmsContactDoc = {
  pageTitle?: string
  subtitle?: string
  email?: string
  phone?: string
  address?: string
  hours?: string
  hoursNote?: string
  brandDisplayName?: string
} | null

export type CmsFaqRow = {
  groupTitle?: string
  question: string
  answer?: string
  sortOrder?: number
}

export type CmsShippingDoc = {
  title?: string
  subtitle?: string
  packaging?: string
  zones?: Array<{ name?: string; eta?: string; note?: string }>
  bullets?: string[]
} | null

export type CmsReturnsDoc = {
  title?: string
  subtitle?: string
  eligible?: string[]
  notEligible?: string[]
  howTo?: string[]
  supportNote?: string
  refundPolicyUrl?: string
} | null

async function postPublic<T>(path: string): Promise<T | null> {
  const origin = resolveOrinketBackendOrigin()
  if (!origin) return null
  try {
    const res = await fetch(`${origin}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
      next: { revalidate: 120 },
    })
    const json = (await res.json()) as { data?: T }
    return json?.data ?? null
  } catch {
    return null
  }
}

export async function fetchCmsContactServer(): Promise<CmsContactDoc> {
  return postPublic<CmsContactDoc>("/api/public/cms-contact")
}

export async function fetchCmsFaqServer(): Promise<CmsFaqRow[]> {
  const rows = await postPublic<CmsFaqRow[]>("/api/public/cms-faq")
  return Array.isArray(rows) ? rows : []
}

export async function fetchCmsShippingServer(): Promise<CmsShippingDoc> {
  return postPublic<CmsShippingDoc>("/api/public/cms-shipping")
}

export async function fetchCmsReturnsServer(): Promise<CmsReturnsDoc> {
  return postPublic<CmsReturnsDoc>("/api/public/cms-returns")
}
