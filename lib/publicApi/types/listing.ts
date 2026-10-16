export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[]

export type PublicResourceKey = "categories" | "subcategories" | "products"

export type PageWhen =
  | { type: "exact"; path: string }
  | { type: "prefix"; path: string }
  | { type: "regex"; pattern: string }
  | { type: "catchAll" }

export type PublicPageApiCallDef = {
  resource: PublicResourceKey
  searchtext?: string
  skipIfLoaded?: boolean
  paginationinfo?: Record<string, JsonValue>
}

export type PublicPageDef = {
  id: string
  when: PageWhen
  calls: PublicPageApiCallDef[]
}

export type PublicPageApisManifest = {
  version: number
  pages: PublicPageDef[]
}

export type ListingRequestBody = {
  paginationinfo?: Record<string, unknown>
  searchtext?: string
}

export type ListingResponsePayload<T> = {
  success?: boolean
  data?: T
  totalCount?: number
  count?: number
  message?: string
}
