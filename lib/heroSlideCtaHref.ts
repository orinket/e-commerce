import type { HeroSlide } from "@/lib/storeSettings"

function coercedBogo(slide: HeroSlide): boolean {
  const v = slide.buyOneGetOneFree as unknown
  if (v === true || v === 1) return true
  if (v === "1" || String(v).toLowerCase() === "true") return true
  return false
}

function coercedDiscountField(slide: HeroSlide): number | null {
  const v = slide.discountUpTo as unknown
  if (v === undefined || v === null || v === "") return null
  const n = Number(v)
  if (!Number.isFinite(n)) return null
  const f = Math.floor(n)
  if (f < 1 || f > 99) return null
  return f
}

function promoTextBlob(slide: HeroSlide): string {
  return [slide.title, slide.subtitle, slide.caption]
    .map((s) => (typeof s === "string" ? s : ""))
    .join(" ")
}

/** Match "up to 50%", "upto 40 %", "50% off", "save 25%" in hero copy */
export function inferDiscountPercentFromText(slide: HeroSlide): number | null {
  const blob = promoTextBlob(slide)
  const upTo =
    blob.match(/(?:up\s*to|upto)\s*(\d{1,2})\s*%/i) ||
    blob.match(/(?:up\s*to|upto)\s*(\d{1,2})\b(?!%)/i)
  if (upTo) {
    const n = Number.parseInt(upTo[1], 10)
    if (n >= 1 && n <= 99) return n
  }
  const pctOff = blob.match(/(\d{1,2})\s*%\s*(?:off|discount)/i)
  if (pctOff) {
    const n = Number.parseInt(pctOff[1], 10)
    if (n >= 1 && n <= 99) return n
  }
  return null
}

export function inferBogoFromText(slide: HeroSlide): boolean {
  const blob = promoTextBlob(slide).toLowerCase()
  return (
    /buy\s*one\s*get\s*one|b1g1|bogo|1\s*\+\s*1|one\s*on\s*one/i.test(blob) ||
    /buy\s*1\s*get\s*1/i.test(blob)
  )
}

/**
 * CTA destination without requiring a manual URL when BOGO / % is configured on the slide
 * or mentioned in title/subtitle/caption.
 */
export function resolveHeroSlideCtaHref(slide: HeroSlide): string {
  if (coercedBogo(slide)) return "/promo?offer=bogo"

  const fromField = coercedDiscountField(slide)
  if (fromField != null) return `/promo?discount=${fromField}`

  if (inferBogoFromText(slide)) return "/promo?offer=bogo"

  const fromText = inferDiscountPercentFromText(slide)
  if (fromText != null) return `/promo?discount=${fromText}`

  const manual = String(slide.href || "").trim()
  if (manual) return manual

  const cta = String(slide.cta || "").toLowerCase()
  if (/\bsale\b|%\s*off|discount/i.test(cta)) return "/sale"

  return "/category/all"
}
