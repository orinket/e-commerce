"use client"

import Image from "next/image"
import Link from "next/link"
import { fonts } from "@/lib/fonts"
import { useCmsSection } from "@/hooks/useStorefrontCms"

export default function DiscountBanner() {
  const b = useCmsSection("discountBanner")
  const image = typeof b?.image === "string" ? b.image : ""
  const alt = typeof b?.alt === "string" ? b.alt : ""
  const subtitle = typeof b?.subtitle === "string" ? b.subtitle : ""
  const title = typeof b?.title === "string" ? b.title : ""
  const description = typeof b?.description === "string" ? b.description : ""
  const cta = typeof b?.cta === "string" ? b.cta : ""
  const discountRaw = Number(b?.discountUpTo)
  const discountUpTo = Number.isFinite(discountRaw)
    ? Math.max(0, Math.min(99, Math.floor(discountRaw)))
    : 0
  const href = discountUpTo > 0 ? `/promo?discount=${discountUpTo}` : ""

  if (!image.trim()) return null

  return (
    <section className="relative w-full overflow-hidden min-h-[24rem] h-[clamp(24rem,62vh,36rem)] sm:min-h-[28rem] sm:h-[clamp(28rem,68vh,42rem)]">
      <Image src={image} alt={alt || title || "Offer"} fill className="object-cover" />
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex items-center justify-center px-4 py-12 text-center text-white sm:px-6 sm:py-16">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
        {subtitle.trim() ? (
          <p className={`mb-3 text-xs uppercase tracking-[0.22em] sm:text-sm md:text-base ${fonts.labels}`}>{subtitle}</p>
        ) : null}
        {title.trim() ? (
          <h2 className={`mb-4 text-3xl font-light leading-[1.1] tracking-[0.08em] sm:text-4xl md:text-5xl lg:text-6xl ${fonts.headings}`}>{title}</h2>
        ) : null}
        {description.trim() ? (
          <p className={`mb-8 max-w-2xl text-sm font-light leading-relaxed sm:text-base md:text-lg lg:text-xl ${fonts.body}`}>{description}</p>
        ) : null}
        {cta.trim() && href ? (
          <Link
            href={href}
            className={`inline-flex min-h-[48px] w-full max-w-xs items-center justify-center bg-white px-6 py-3 text-center text-xs tracking-[0.18em] text-foreground transition-all hover:bg-gold hover:text-white sm:w-auto sm:max-w-none sm:px-8 sm:text-sm ${fonts.buttons}`}
          >
            {cta}
          </Link>
        ) : null}
        </div>
      </div>
    </section>
  )
}
