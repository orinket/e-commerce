"use client"

import { useCurrency } from "@/context/CurrencyContext"
import { fonts } from "@/lib/fonts"
import { useCmsSection } from "@/hooks/useStorefrontCms"

export default function ShopWithConfidence() {
  const { formatPrice } = useCurrency()
  const raw = useCmsSection("shopWithConfidence")
  const title = typeof raw?.title === "string" ? raw.title : ""
  const features = Array.isArray(raw?.features) ? raw.features : []

  if (!title.trim() || features.length === 0) return null

  return (
    <section className="bg-cream py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className={`mb-10 text-center text-3xl font-light tracking-[0.08em] md:mb-12 md:text-4xl ${fonts.headings}`}>
          {title}
        </h2>

        <div className="grid grid-cols-2 gap-5 sm:gap-6 md:gap-8 lg:grid-cols-4">
          {features.map((f, i) => {
            const row = f && typeof f === "object" && !Array.isArray(f) ? (f as Record<string, unknown>) : null
            const ft = typeof row?.title === "string" ? row.title : ""
            const desc = typeof row?.description === "string" ? row.description : ""
            const thr = row?.freeShippingThresholdInr
            const n = typeof thr === "number" && Number.isFinite(thr) ? thr : null
            if (!ft.trim()) return null
            return (
              <div key={`${ft}-${i}`} className="mx-auto w-full max-w-[11rem] text-center sm:max-w-xs">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold-light sm:mb-4 sm:h-16 sm:w-16">
                  <span className={`text-gold-dark text-lg font-semibold ${fonts.headings}`}>{i + 1}</span>
                </div>
                <h3 className={`mb-2 text-sm tracking-wide sm:text-base md:text-lg ${fonts.headings}`}>{ft}</h3>
                <p className={`text-xs leading-relaxed text-muted-foreground sm:text-sm ${fonts.body}`}>
                  {n != null ? `On orders above ${formatPrice(n)}` : desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
