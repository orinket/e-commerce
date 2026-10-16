"use client"

import Link from "next/link"
import { fonts } from "@/lib/fonts"
import { useCmsSection } from "@/hooks/useStorefrontCms"

export default function CTABanner() {
  const raw = useCmsSection("ctaBanner")
  const title = typeof raw?.title === "string" ? raw.title : ""
  const description = typeof raw?.description === "string" ? raw.description : ""
  const ctaRaw = raw?.cta
  const cta =
    ctaRaw && typeof ctaRaw === "object" && !Array.isArray(ctaRaw)
      ? (ctaRaw as { text?: string; href?: string })
      : null

  if (!title.trim()) return null

  return (
    <section className="py-20 md:py-32 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2
          className={`text-4xl md:text-5xl lg:text-6xl font-light tracking-[0.1em] mb-6 text-gray-900 ${fonts.headings}`}
        >
          {title}
        </h2>
        {description.trim() ? (
          <p
            className={`text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto ${fonts.body} font-light leading-relaxed`}
          >
            {description}
          </p>
        ) : null}
        {cta?.text?.trim() && cta?.href?.trim() ? (
          <Link
            href={cta.href}
            className={`inline-block px-12 py-4 bg-black text-white text-sm tracking-[0.2em] hover:bg-gray-900 transition-all duration-300 ${fonts.buttons} font-light`}
          >
            {cta.text}
          </Link>
        ) : null}
      </div>
    </section>
  )
}
