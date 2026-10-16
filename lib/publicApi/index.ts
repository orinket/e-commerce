/**
 * Storefront integration with the Orinket public API (proxied via Next `/api/public/*`).
 * - Listing POSTs: `client/listingPublicClient` + `STOREFRONT_PUBLIC_API`
 * - Page → calls mapping: `config/public-page-apis.json` + `pageApi/resolvePageApiCalls`
 * - Next route handlers: `server/proxyToBackend` + `backendRoutes`
 * - Mapping API → UI models: `mappers/catalogFromApi`
 */
export { STOREFRONT_PUBLIC_API } from "./storefrontRoutes"
export { ORINKET_BACKEND_PUBLIC } from "./backendRoutes"
export { postPublicListing } from "./client/listingPublicClient"
export { resolvePageApiCalls } from "./pageApi/resolvePageApiCalls"
