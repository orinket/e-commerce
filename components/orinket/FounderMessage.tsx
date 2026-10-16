"use client"

import Image from "next/image"
import { fonts } from "@/lib/fonts"
import { useCmsSection } from "@/hooks/useStorefrontCms"

export default function FounderMessage() {
  const raw = useCmsSection("founderMessage")
  const title = typeof raw?.title === "string" ? raw.title : ""
  const quote = typeof raw?.quote === "string" ? raw.quote : ""
  const description = typeof raw?.description === "string" ? raw.description : ""
  const name = typeof raw?.name === "string" ? raw.name : ""
  const role = typeof raw?.role === "string" ? raw.role : ""
  const image = typeof raw?.image === "string" ? raw.image : ""
  const alt = typeof raw?.alt === "string" ? raw.alt : ""

  if (!title.trim() && !quote.trim()) return null

  return (
    <section className="bg-cream px-4 py-16 sm:px-6 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] md:gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,460px)] lg:gap-12 xl:gap-16">
          <div className="flex flex-col justify-center text-center md:text-left w-full max-w-2xl md:max-w-none space-y-5 md:space-y-6">
            {title.trim() ? (
              <h2 className={`text-3xl font-light tracking-[0.08em] sm:text-4xl lg:text-5xl ${fonts.headings}`}>{title}</h2>
            ) : null}
            {quote.trim() ? (
              <blockquote className={`text-lg italic leading-relaxed text-muted-foreground sm:text-xl lg:text-2xl ${fonts.body}`}>
                &quot;{quote}&quot;
              </blockquote>
            ) : null}
            {description.trim() ? (
              <p className={`max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg ${fonts.body}`}>{description}</p>
            ) : null}
            {(name.trim() || role.trim()) && (
              <div className="flex flex-col items-center gap-3 pt-2 md:items-start">
                <div className="w-16 h-0.5 bg-gold shrink-0" aria-hidden />
                {name.trim() ? (
                  <span className={`${fonts.headings} text-xl tracking-[0.08em] font-medium`}>{name}</span>
                ) : null}
                {role.trim() ? (
                  <p className={`text-sm leading-relaxed text-muted-foreground ${fonts.labels}`}>{role}</p>
                ) : null}
              </div>
            )}
          </div>

          {image.trim() ? (
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[300px] overflow-hidden rounded-2xl shadow-[0_28px_64px_-24px_rgba(28,25,23,0.28)] sm:max-w-[360px] md:max-w-none">
              <Image src={image} alt={alt || name || "Founder"} fill className="object-cover object-top" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
