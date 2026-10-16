"use client"

import Image from "next/image"
import Link from "next/link"
import { fonts } from "@/lib/fonts"
import { useCmsSection } from "@/hooks/useStorefrontCms"

export default function BrandStory() {
  const raw = useCmsSection("brandStory")
  const title = typeof raw?.title === "string" ? raw.title : ""
  const image = typeof raw?.image === "string" ? raw.image : ""
  const alt = typeof raw?.alt === "string" ? raw.alt : ""
  const description = Array.isArray(raw?.description) ? raw.description.map(String) : []
  const ctaRaw = raw?.cta
  const cta =
    ctaRaw && typeof ctaRaw === "object" && !Array.isArray(ctaRaw)
      ? (ctaRaw as { text?: string; href?: string })
      : null

  if (!title.trim() && !image.trim()) return null

  return (
    <section className="py-16 md:py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {image.trim() ? (
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image src={image} alt={alt || title || "Brand"} fill className="object-cover" />
            </div>
          ) : null}

          <div className="lg:pl-12">
            {title.trim() ? (
              <h2 className={`text-3xl md:text-4xl font-light tracking-[0.1em] mb-6 ${fonts.headings}`}>
                {title}
              </h2>
            ) : null}
            {description.map((paragraph, index: number) => (
              <p key={index} className={`text-muted-foreground mb-4 ${fonts.body} leading-relaxed`}>
                {paragraph}
              </p>
            ))}
            {cta?.text?.trim() && cta?.href?.trim() ? (
              <Link
                href={cta.href}
                className={`inline-block px-8 py-3 bg-foreground text-background text-sm tracking-[0.2em] hover:bg-gold-dark transition-colors ${fonts.buttons}`}
              >
                {cta.text}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
