"use client"

import Image from "next/image"
import { Play } from "lucide-react"
import type { Product } from "@/types/product"
import { fonts } from "@/lib/fonts"

interface ProductVideoAnd360Props {
  product: Product
  galleryImages?: string[]
}

export default function ProductVideoAnd360({
  product,
}: ProductVideoAnd360Props) {
  const showVideo = Boolean(product.videoUrl)

  if (!showVideo) return null

  return (
    <div className="mt-10">
      {showVideo && product.videoUrl && (
        <section className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-[0_18px_40px_-24px_rgba(25,18,14,0.12)] max-w-2xl mx-auto">
          <div className="flex items-center gap-2 border-b border-border/40 px-4 py-3">
            <Play className="h-4 w-4 text-gold-dark" fill="currentColor" />
            <h2 className={`text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground ${fonts.labels}`}>
              Product video
            </h2>
          </div>
          <div className="relative aspect-video w-full bg-black">
            <iframe
              title={`${product.name} video`}
              src={product.videoUrl}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </section>
      )}
    </div>
  )
}
