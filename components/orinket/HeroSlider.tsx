"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { fonts } from "@/lib/fonts"
import { useStorefrontCms } from "@/hooks/useStorefrontCms"
import { resolveHeroSlideCtaHref } from "@/lib/heroSlideCtaHref"

export default function HeroSlider() {
  const { heroSlides } = useStorefrontCms()
  const slides = heroSlides
  const [currentSlide, setCurrentSlide] = useState(0)

  const len = slides.length

  const nextSlide = useCallback(() => {
    if (len < 1) return
    setCurrentSlide((prev) => (prev + 1) % len)
  }, [len])

  const prevSlide = useCallback(() => {
    if (len < 1) return
    setCurrentSlide((prev) => (prev - 1 + len) % len)
  }, [len])

  useEffect(() => {
    if (len < 2) return
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [nextSlide, len])

  useEffect(() => {
    if (currentSlide >= len) setCurrentSlide(0)
  }, [currentSlide, len])

  if (len === 0) return null

  return (
    <section className="relative w-full overflow-hidden min-h-[26rem] h-[clamp(26rem,72vh,48rem)] sm:min-h-[30rem] sm:h-[clamp(30rem,78vh,54rem)] lg:min-h-[36rem] lg:h-[clamp(36rem,82vh,62rem)]">
      {slides.map((slide, index) => {
        const ctaHref = resolveHeroSlideCtaHref(slide)
        return (
          <div
            key={`${slide.image}-${index}`}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide
                ? "z-[1] opacity-100 pointer-events-auto"
                : "z-0 opacity-0 pointer-events-none"
            }`}
          >
            <Image
              src={slide.image || ""}
              alt={slide.title || "Hero"}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
              loading={index === 0 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 py-16 text-center text-white sm:px-6 sm:py-20 md:px-10 lg:px-16">
              <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
              {slide.title?.trim() ? (
                <p
                  className={`mb-3 max-w-full text-xs font-light uppercase tracking-[0.24em] sm:mb-4 sm:text-sm md:text-base lg:text-lg ${fonts.labels}`}
                >
                  {slide.title}
                </p>
              ) : null}
              {slide.subtitle?.trim() ? (
                <h2
                  className={`mb-5 text-3xl font-light leading-[1.1] tracking-[0.08em] sm:mb-6 sm:text-4xl md:mb-8 md:text-5xl lg:mb-10 lg:text-6xl xl:text-7xl ${fonts.headings}`}
                >
                  {slide.subtitle}
                </h2>
              ) : null}
              {slide.caption?.trim() ? (
                <p
                  className={`mx-auto mb-8 max-w-3xl text-sm font-light leading-relaxed text-white/90 sm:text-base md:mb-10 lg:mb-12 lg:text-lg ${fonts.body}`}
                >
                  {slide.caption}
                </p>
              ) : null}
              {slide.cta?.trim() && ctaHref ? (
                <Link
                  href={ctaHref}
                  className={`inline-flex min-h-[48px] w-full max-w-xs items-center justify-center border border-white bg-transparent px-6 py-3 text-center text-xs font-light tracking-[0.18em] text-white transition-all duration-300 hover:bg-white/10 sm:w-auto sm:max-w-none sm:px-8 sm:text-sm md:px-10 md:py-4 md:text-base ${fonts.buttons} touch-target`}
                >
                  {slide.cta}
                </Link>
              ) : null}
              </div>
            </div>
          </div>
        )
      })}

      {len > 1 ? (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute bottom-4 left-4 z-20 rounded-full border border-white/25 bg-black/20 p-2 text-white/80 transition-colors hover:text-white sm:bottom-auto sm:left-4 sm:top-1/2 sm:-translate-y-1/2 sm:bg-transparent md:left-8 touch-target"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 sm:h-8 sm:w-8 md:h-10 md:w-10" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="absolute bottom-4 right-4 z-20 rounded-full border border-white/25 bg-black/20 p-2 text-white/80 transition-colors hover:text-white sm:bottom-auto sm:right-4 sm:top-1/2 sm:-translate-y-1/2 sm:bg-transparent md:right-8 touch-target"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5 sm:h-8 sm:w-8 md:h-10 md:w-10" />
          </button>
        </>
      ) : null}
    </section>
  )
}
