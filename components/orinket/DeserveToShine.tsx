"use client"

import Image from "next/image"
import Link from "next/link"
import { fonts } from "@/lib/fonts"
import { useCmsSection } from "@/hooks/useStorefrontCms"

export default function DeserveToShine() {
  const raw = useCmsSection("deserveToShine")
  const title = typeof raw?.title === "string" ? raw.title : ""
  const image = typeof raw?.image === "string" ? raw.image : ""
  const description = Array.isArray(raw?.description) ? raw.description.map(String) : []
  const ctaRaw = raw?.cta
  const cta =
    ctaRaw && typeof ctaRaw === "object" && !Array.isArray(ctaRaw)
      ? (ctaRaw as { text?: string; href?: string })
      : null

  if (!title.trim() && !image.trim()) return null

  return (
    <section className="bg-white py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 items-center gap-8 md:gap-10 lg:grid-cols-[5fr_7fr] lg:gap-12">
          {image.trim() ? (
            <div className="relative mx-auto aspect-[3/4] max-w-md overflow-hidden rounded-xl shadow-2xl lg:mx-0">
              <Image src={image} alt={title || "Campaign"} fill className="object-cover" />
            </div>
          ) : null}

          <div className="lg:pl-12">
            {title.trim() ? (
              <h2
                className={`mb-8 text-2xl font-light tracking-[0.08em] text-gray-900 md:text-3xl lg:mb-10 lg:text-4xl ${fonts.headings}`}
              >
                {title}
              </h2>
            ) : null}
            {description.map((paragraph, index: number) => (
              <p
                key={index}
                className={`mb-6 max-w-2xl text-base font-light leading-relaxed text-gray-700 md:text-lg lg:mb-8 lg:text-xl ${fonts.body}`}
              >
                {paragraph}
              </p>
            ))}
            {cta?.text?.trim() && cta?.href?.trim() ? (
              <div className="mt-10 md:mt-12">
                <Link
                  href={cta.href}
                  className={`inline-flex min-h-[48px] w-full max-w-sm items-center justify-center bg-black px-8 py-4 text-center text-sm tracking-[0.12em] text-white transition-all duration-300 hover:bg-gray-900 sm:w-auto sm:max-w-none sm:px-12 sm:py-4 md:px-14 md:py-5 md:text-base ${fonts.buttons} font-light`}
                >
                  {cta.text}
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
