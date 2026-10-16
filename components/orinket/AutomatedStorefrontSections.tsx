"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { fonts } from "@/lib/fonts"
import { useCurrency } from "@/context/CurrencyContext"
import { ecomFetch } from "@/lib/ecom/client"

type SectionProduct = {
  id: string
  name: string
  price: number
  image?: string
}

type SectionRow = {
  key: string
  mode: "auto" | "custom"
  tooltip?: string
  products: SectionProduct[]
}

function RailProductCard({
  p,
  formatPrice,
}: {
  p: SectionProduct
  formatPrice: (value: number) => string
}) {
  const [imgSrc, setImgSrc] = useState(p.image || "/images/product-necklace-1.jpg")

  return (
    <Link
      href={`/product/${p.id}`}
      className="rounded-xl border border-[#e8dece] bg-white p-2 shadow-sm transition hover:shadow-md sm:p-2.5"
    >
      <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-[#f7f2e8]">
        <Image
          src={imgSrc}
          alt={p.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
          onError={() => setImgSrc("/images/product-necklace-1.jpg")}
        />
      </div>
      <p className={`line-clamp-2 text-sm text-foreground ${fonts.body}`}>{p.name}</p>
      <p className={`mt-1 text-sm font-semibold sm:text-base ${fonts.headings}`}>{formatPrice(p.price)}</p>
    </Link>
  )
}

export default function AutomatedStorefrontSections() {
  const { formatPrice } = useCurrency()
  const [sections, setSections] = useState<SectionRow[]>([])

  useEffect(() => {
    const load = async () => {
      const response = await ecomFetch<{ success: boolean; data?: SectionRow[] }>(
        "/api/ecom/storefront/home",
        { method: "GET" }
      )
      if (response?.success && Array.isArray(response.data)) {
        setSections(response.data)
      }
    }
    load()
  }, [])

  const displaySections = useMemo(() => {
    return sections.filter((s) => s.key === "trending" || s.key === "recommended")
  }, [sections])

  if (!displaySections.length) return null

  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 pt-0 md:pb-10">
      {displaySections.map((section) => (
        <div key={section.key} className="mb-6 md:mb-8 last:mb-0">
          <div
            className={`text-center ${
              section.key === "recommended"
                ? "mb-10 mt-10 md:mb-12 md:mt-12"
                : "mb-6 mt-4 md:mb-8 md:mt-6"
            }`}
          >
            <h2
              className={`text-3xl font-light tracking-[0.08em] text-foreground md:text-4xl ${fonts.headings}`}
            >
              {section.key === "trending" ? "TRENDING NOW" : "RECOMMENDED FOR YOU"}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-4">
            {section.products.slice(0, 8).map((p) => (
              <RailProductCard key={p.id} p={p} formatPrice={formatPrice} />
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
