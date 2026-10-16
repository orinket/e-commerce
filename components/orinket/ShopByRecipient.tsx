"use client"

import Image from "next/image"
import Link from "next/link"
import { fonts } from "@/lib/fonts"
import { useCmsSection } from "@/hooks/useStorefrontCms"

export default function ShopByRecipient() {
  const raw = useCmsSection("shopByRecipient")
  const title = typeof raw?.title === "string" ? raw.title : ""
  const recipients = Array.isArray(raw?.recipients) ? raw.recipients : []

  if (!title.trim() || recipients.length === 0) return null

  return (
    <section className="bg-cream py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className={`mb-10 text-center text-3xl font-light tracking-[0.08em] md:mb-12 md:text-4xl ${fonts.headings}`}>
          {title}
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8">
          {recipients.map((r, i) => {
            const row = r && typeof r === "object" && !Array.isArray(r) ? (r as Record<string, unknown>) : null
            const rt = typeof row?.title === "string" ? row.title : ""
            const img = typeof row?.image === "string" ? row.image : ""
            let href = typeof row?.href === "string" ? row.href : ""
            
            // Legacy /gifts/* → common promo PLP with recipient filter
            if (href.startsWith("/gifts/for-her")) href = "/promo?recipient=her"
            if (href.startsWith("/gifts/for-him")) href = "/promo?recipient=him"
            
            if (!rt.trim() || !img.trim() || !href.trim()) return null
            return (
              <Link
                key={`${rt}-${i}`}
                href={href}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl md:aspect-[5/4]"
              >
                <Image
                  src={img}
                  alt={rt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                <div className="absolute inset-0 flex items-end justify-center px-4 pb-8 sm:pb-10 md:pb-12">
                  <div className="text-center">
                    <h3 className={`mb-4 text-2xl tracking-[0.12em] text-white sm:text-3xl ${fonts.headings}`}>
                      {rt}
                    </h3>
                    <span
                      className={`inline-flex min-h-[44px] items-center justify-center border border-white px-5 py-2 text-xs tracking-[0.18em] text-white transition-all group-hover:bg-white group-hover:text-foreground sm:px-6 sm:text-sm ${fonts.buttons}`}
                    >
                      SHOP NOW
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
