"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin } from "lucide-react"
import { fonts } from "@/lib/fonts"
import { useCmsSection } from "@/hooks/useStorefrontCms"

export default function VisitStores() {
  const raw = useCmsSection("visitStores")
  const title = typeof raw?.title === "string" ? raw.title : ""
  const subtitle = typeof raw?.subtitle === "string" ? raw.subtitle : ""
  const stores = Array.isArray(raw?.stores) ? raw.stores : []
  const btnRaw = raw?.button
  const button =
    btnRaw && typeof btnRaw === "object" && !Array.isArray(btnRaw)
      ? (btnRaw as { text?: string; href?: string })
      : null

  if (!title.trim() || stores.length === 0) return null

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className={`text-3xl md:text-4xl font-light tracking-[0.1em] mb-4 text-center ${fonts.headings}`}>
          {title}
        </h2>
        {subtitle.trim() ? (
          <p className={`text-center text-muted-foreground mb-12 ${fonts.body}`}>{subtitle}</p>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {stores.map((s, idx) => {
            const row = s && typeof s === "object" && !Array.isArray(s) ? (s as Record<string, unknown>) : null
            const name = typeof row?.name === "string" ? row.name : ""
            const city = typeof row?.city === "string" ? row.city : ""
            const address = typeof row?.address === "string" ? row.address : ""
            const image = typeof row?.image === "string" ? row.image : ""
            const href = typeof row?.href === "string" ? row.href : ""
            if (!name.trim() || !image.trim() || !href.trim()) return null
            const line = address.split("—")[0]?.trim() ?? address
            return (
              <Link key={`${name}-${idx}`} href={href} className="group block">
                <div className="relative aspect-video overflow-hidden mb-4">
                  <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
                  <div>
                    <h3 className={`text-lg mb-1 group-hover:text-gold-dark transition-colors ${fonts.headings}`}>
                      {city.trim() ? `${city} — ${name}` : name}
                    </h3>
                    {line.trim() ? (
                      <p className={`text-sm text-muted-foreground ${fonts.body}`}>{line}</p>
                    ) : null}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {button?.text?.trim() && button?.href?.trim() ? (
          <div className="text-center mt-12">
            <Link
              href={button.href}
              className={`inline-block px-8 py-3 border border-foreground text-foreground text-sm tracking-[0.2em] hover:bg-foreground hover:text-background transition-all ${fonts.buttons}`}
            >
              {button.text}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  )
}
