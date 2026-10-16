"use client"

import Link from "next/link"
import { fonts } from "@/lib/fonts"
import { useCmsSection } from "@/hooks/useStorefrontCms"

export default function DemifineSection() {
  const raw = useCmsSection("demifineSection")
  const subtitle = typeof raw?.subtitle === "string" ? raw.subtitle : ""
  const title = typeof raw?.title === "string" ? raw.title : ""
  const description = typeof raw?.description === "string" ? raw.description : ""
  const ctaRaw = raw?.cta
  const cta =
    ctaRaw && typeof ctaRaw === "object" && !Array.isArray(ctaRaw)
      ? (ctaRaw as { text?: string; href?: string })
      : null

  if (!title.trim()) return null

  return (
    <section className="bg-cream py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 text-center">
        {subtitle.trim() ? (
          <p
            className={`mb-3 text-xs uppercase tracking-[0.22em] text-muted-foreground sm:text-sm ${fonts.labels} animate-fadeIn`}
          >
            {subtitle}
          </p>
        ) : null}
        <h2
          className={`mb-6 text-3xl font-light tracking-[0.08em] md:text-5xl ${fonts.headings} animate-slideUp`}
          style={{ animationDelay: "100ms" }}
        >
          {title}
        </h2>
        {description.trim() ? (
          <p
            className={`mx-auto mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base ${fonts.body} animate-slideUp`}
            style={{ animationDelay: "200ms" }}
          >
            {description}
          </p>
        ) : null}
        {cta?.text?.trim() && cta?.href?.trim() ? (
          <Link
            href={cta.href}
            className={`inline-flex min-h-[48px] w-full max-w-xs items-center justify-center bg-foreground px-6 py-3 text-center text-xs tracking-[0.18em] text-background transition-all duration-300 hover:bg-gold-dark hover:shadow-lg sm:w-auto sm:max-w-none sm:px-8 sm:text-sm ${fonts.buttons} animate-slideUp`}
            style={{ animationDelay: "300ms" }}
          >
            {cta.text}
          </Link>
        ) : null}
      </div>
    </section>
  )
}
