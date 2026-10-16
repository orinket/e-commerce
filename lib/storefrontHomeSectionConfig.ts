/**
 * Homepage CMS sections driven by `GeneralSetting.storefrontContentJson`
 * (same keys as dashboard storefront *Master APIs).
 *
 * Order here = render order. Hero + automated rails are composed in `HomePageClient`.
 */
import type { ComponentType } from "react"
import DemifineSection from "@/components/orinket/DemifineSection"
import TopStyles from "@/components/orinket/TopStyles"
import DiscountBanner from "@/components/orinket/DiscountBanner"
import ShopByRecipient from "@/components/orinket/ShopByRecipient"
import ForEveryYou from "@/components/orinket/ForEveryYou"
import FineGold from "@/components/orinket/FineGold"
import DeserveToShine from "@/components/orinket/DeserveToShine"
import FounderMessage from "@/components/orinket/FounderMessage"
import BlogSection from "@/components/orinket/BlogSection"
import ShopWithConfidence from "@/components/orinket/ShopWithConfidence"
import BrandStory from "@/components/orinket/BrandStory"
import Reviews from "@/components/orinket/Reviews"
// import CTABanner from "@/components/orinket/CTABanner"

export type HomeSectionAnimation = "fadeIn" | "slideUp" | "slideInLeft" | "slideInRight" | "scaleIn"

export type StorefrontHomeCmsSectionDef = {
  id: string
  /** Key inside parsed `storefrontContentJson` — components use `useCmsSection` with this */
  cmsKey: string
  Component: ComponentType
  animation: HomeSectionAnimation
  delay: number
}

/** Sections above the automated product rails (trending / recommended). */
export const storefrontHomeCmsSectionsBeforeEcom: StorefrontHomeCmsSectionDef[] = [
  { id: "demifine", cmsKey: "demifineSection", Component: DemifineSection, animation: "slideUp", delay: 50 },
  { id: "top-styles", cmsKey: "topStylesSection", Component: TopStyles, animation: "slideInLeft", delay: 100 },
]

/** Ecom-driven block sits between the two groups (see `AutomatedStorefrontSections`). */

/** Remaining CMS sections (JSON-backed). */
export const storefrontHomeCmsSectionsAfterEcom: StorefrontHomeCmsSectionDef[] = [
  { id: "discount-banner", cmsKey: "discountBanner", Component: DiscountBanner, animation: "scaleIn", delay: 150 },
  { id: "shop-by-recipient", cmsKey: "shopByRecipient", Component: ShopByRecipient, animation: "slideInRight", delay: 200 },
  { id: "for-every-you", cmsKey: "forEveryYou", Component: ForEveryYou, animation: "slideUp", delay: 250 },
  { id: "fine-gold", cmsKey: "fineGoldSection", Component: FineGold, animation: "fadeIn", delay: 300 },
  { id: "deserve-to-shine", cmsKey: "deserveToShine", Component: DeserveToShine, animation: "slideInLeft", delay: 350 },
  { id: "founder-message", cmsKey: "founderMessage", Component: FounderMessage, animation: "fadeIn", delay: 400 },
  { id: "blog-section", cmsKey: "blogSection", Component: BlogSection, animation: "slideInRight", delay: 450 },
  { id: "shop-with-confidence", cmsKey: "shopWithConfidence", Component: ShopWithConfidence, animation: "slideUp", delay: 500 },
  { id: "brand-story", cmsKey: "brandStory", Component: BrandStory, animation: "fadeIn", delay: 550 },
  { id: "reviews", cmsKey: "reviews", Component: Reviews, animation: "slideInLeft", delay: 600 },
  // { id: "cta-banner", cmsKey: "ctaBanner", Component: CTABanner, animation: "scaleIn", delay: 650 },
]

/** All 14 JSON section keys in render order (for docs / validation). */
export const STOREFRONT_HOME_CMS_KEYS_IN_ORDER = [
  ...storefrontHomeCmsSectionsBeforeEcom.map((s) => s.cmsKey),
  ...storefrontHomeCmsSectionsAfterEcom.map((s) => s.cmsKey),
] as const
