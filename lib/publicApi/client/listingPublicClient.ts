import { STOREFRONT_PUBLIC_API } from "@/lib/publicApi/storefrontRoutes"
import type { ListingRequestBody, ListingResponsePayload } from "@/lib/publicApi/types/listing"
import type { PublicResourceKey } from "@/lib/publicApi/types/listing"

const ROUTE_BY_RESOURCE: Record<PublicResourceKey, string> = {
  categories: STOREFRONT_PUBLIC_API.categories,
  subcategories: STOREFRONT_PUBLIC_API.subcategories,
  products: STOREFRONT_PUBLIC_API.products,
}

export type ListingResult<T> = {
  data: T
  totalCount: number
  count: number
}

export async function postPublicListing<T>(
  resource: PublicResourceKey,
  body: ListingRequestBody
): Promise<ListingResult<T>> {
  const res = await fetch(ROUTE_BY_RESOURCE[resource], {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body ?? {}),
    cache: "no-store",
  })
  const json = (await res.json()) as ListingResponsePayload<T>
  if (!res.ok || json.success === false || json.data === undefined) {
    throw new Error(json.message || `${resource}: HTTP ${res.status}`)
  }
  const list = json.data
  const count = json.count ?? (Array.isArray(list) ? list.length : 0)
  const totalCount = json.totalCount ?? count
  return { data: list, totalCount, count }
}
