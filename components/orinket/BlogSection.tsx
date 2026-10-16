"use client"

import Image from "next/image"
import Link from "next/link"
import { fonts } from "@/lib/fonts"
import { useCmsSection } from "@/hooks/useStorefrontCms"

export default function BlogSection() {
  const raw = useCmsSection("blogSection")
  const title = typeof raw?.title === "string" ? raw.title : ""
  const posts = Array.isArray(raw?.posts) ? raw.posts : []
  const btnRaw = raw?.button
  const button =
    btnRaw && typeof btnRaw === "object" && !Array.isArray(btnRaw)
      ? (btnRaw as { text?: string; href?: string })
      : null

  if (!title.trim() || posts.length === 0) return null

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className={`text-3xl md:text-4xl font-light tracking-[0.1em] mb-12 text-center ${fonts.headings}`}>
          {title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((p, i) => {
            const row = p && typeof p === "object" && !Array.isArray(p) ? (p as Record<string, unknown>) : null
            const slug = typeof row?.slug === "string" ? row.slug : ""
            const pt = typeof row?.title === "string" ? row.title : ""
            const excerpt = typeof row?.excerpt === "string" ? row.excerpt : ""
            const dateLabel = typeof row?.dateLabel === "string" ? row.dateLabel : ""
            const image = typeof row?.image === "string" ? row.image : ""
            const href = typeof row?.href === "string" && row.href.trim() ? row.href : slug ? `/blog/${slug}` : ""
            if (!pt.trim() || !image.trim() || !href) return null
            const shortDate = dateLabel.split(" ").slice(0, 2).join(" ")
            return (
              <Link key={`${slug || pt}-${i}`} href={href} className="group">
                <div className="relative aspect-[4/3] overflow-hidden mb-4">
                  <Image
                    src={image}
                    alt={pt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {shortDate.trim() ? (
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-sm text-gold ${fonts.labels}`}>{shortDate}</span>
                  </div>
                ) : null}
                <h3
                  className={`text-lg md:text-xl mb-2 group-hover:text-gold-dark transition-colors line-clamp-2 ${fonts.headings}`}
                >
                  {pt}
                </h3>
                {excerpt.trim() ? (
                  <p className={`text-sm text-muted-foreground line-clamp-2 ${fonts.body}`}>{excerpt}</p>
                ) : null}
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
