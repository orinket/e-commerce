/**
 * Whitelist for /promo?section=… — must match dashboard Product Master
 * `orinketHomePageSectionOptions` values (storefrontHomeSectionKeys).
 */
export const STOREFRONT_SECTION_LISTING_KEYS = [
  'demiFineJewelleryProducts',
  'topStylesProducts',
  'trendingProducts',
  'recommendedProducts',
  'fineGoldProducts',
  'showIn925SilverPost',
] as const

export type StorefrontSectionListingKey = (typeof STOREFRONT_SECTION_LISTING_KEYS)[number]

const SECTION_LISTING_LABELS: Record<StorefrontSectionListingKey, string> = {
  demiFineJewelleryProducts: 'Demi-fine jewellery',
  topStylesProducts: 'Top styles',
  trendingProducts: 'Trending',
  recommendedProducts: 'Recommended for you',
  fineGoldProducts: 'Fine gold',
  showIn925SilverPost: '925 Silver Post',
}

export function isStorefrontSectionListingKey(s: string): s is StorefrontSectionListingKey {
  return (STOREFRONT_SECTION_LISTING_KEYS as readonly string[]).includes(s)
}

export function titleForStorefrontSectionListingKey(key: StorefrontSectionListingKey): string {
  return SECTION_LISTING_LABELS[key]
}
