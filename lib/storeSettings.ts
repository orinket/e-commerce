/**
 * Store settings from dashboard General Settings → public API (`/api/public/store-settings`).
 * Shapes match backend `generalsetting` documents (not dashboard table-field transforms).
 */

export type HeroSlide = {
  image?: string
  title?: string
  subtitle?: string
  caption?: string
  cta?: string
  href?: string
  buyOneGetOneFree?: boolean | number
  discountUpTo?: number
}

export type StoreSettings = {
  storeName: string
  storeDescription: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  supportHours: string
  defaultCurrency: "INR" | "USD" | "EUR" | "OTHER" | string
  otherCurrencyPriceIncreasePercent: number
  timezone: string
  taxRate: number
  topBannerDesktopText: string
  topBannerMobileText: string
  secondaryBannerText: string
  showTopBanner: number
  showSecondaryBanner: number
  brandName: string
  brandDescription: string
  footerLogoUrl: string
  newsletterTitle: string
  newsletterDescription: string
  newsletterPlaceholder: string
  newsletterButtonText: string
  newsletterEnabled: number
  shopFooterLinks: Array<{
    categoryid?: string
    category?: string
    linklabel?: string
    linkhref?: string
  }>
  /** Fixed company column — path or full URL per link */
  urlCompanyAbout: string
  urlCompanyStory: string
  urlCompanyStores: string
  urlCompanyBlog: string
  urlCompanyCareers: string
  urlSupportContact: string
  urlSupportFaq: string
  urlSupportShipping: string
  urlSupportReturns: string
  urlSupportTrack: string
  urlLegalPrivacy: string
  urlLegalTerms: string
  urlLegalRefund: string
  instagramUrl: string
  facebookUrl: string
  twitterUrl: string
  youtubeUrl: string
  pinterestUrl: string
  paymentVisa: number
  paymentMastercard: number
  paymentUpi: number
  paymentPaytm: number
  seoHomepageTitle: string
  seoHomepageMetaDescription: string
  heroSlides?: HeroSlide[]
  /** Optional JSON string for homepage sections & policy copy (see dashboard). */
  storefrontContentJson?: string
}

export function parseStoreSettingsPayload(json: unknown): StoreSettings | null {
  if (!json || typeof json !== "object") return null
  const data = (json as { data?: unknown }).data
  const row = Array.isArray(data) ? data[0] : null
  if (!row || typeof row !== "object") return null
  return row as StoreSettings
}
