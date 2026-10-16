"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { fonts } from "@/lib/fonts"
import { useCmsSection } from "@/hooks/useStorefrontCms"

type ReviewRow = {
  _id?: string
  rating?: number
  text?: string
  reviewerName?: string
  productName?: string
}

export default function Reviews() {
  const raw = useCmsSection("reviews")
  const title = typeof raw?.title === "string" ? raw.title : ""
  const subtitle = typeof raw?.subtitle === "string" ? raw.subtitle : ""
  const [list, setList] = useState<ReviewRow[]>([])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/public/product-reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            paginationinfo: {
              pageno: 1,
              pagelimit: 30,
              filter: {},
              sort: { createdAt: -1 },
            },
            searchtext: "",
          }),
        })
        const json = (await res.json().catch(() => null)) as
          | { success?: boolean; data?: ReviewRow[] }
          | null
        if (!cancelled && res.ok && json?.success && Array.isArray(json.data)) {
          setList(json.data)
        } else if (!cancelled) {
          setList([])
        }
      } catch {
        if (!cancelled) setList([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1)
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2)
      } else {
        setItemsPerView(3)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const reviewsData = useMemo(() => {
    return list
      .map((r, i) => ({
        id: r._id || `r-${i}`,
        rating: Math.min(5, Math.max(1, Math.round((Number(r.rating) || 5) * 2) / 2)),
        text: String(r.text || ""),
        name: String(r.reviewerName || "Customer"),
        product: String(r.productName || ""),
      }))
      .filter((r) => r.text.trim())
  }, [list])

  const maxIndex = Math.max(0, reviewsData.length - itemsPerView)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  }, [maxIndex])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  useEffect(() => {
    if (currentIndex > maxIndex) setCurrentIndex(0)
  }, [currentIndex, maxIndex])

  if (!title.trim() || reviewsData.length === 0) return null

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center md:mb-12">
          <h2 className={`mb-4 text-3xl font-light tracking-[0.08em] md:text-4xl ${fonts.headings}`}>{title}</h2>
          {subtitle.trim() ? <p className={`mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base ${fonts.body}`}>{subtitle}</p> : null}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className={`absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-md transition-colors sm:-left-2 lg:-left-3 ${
              currentIndex === 0 ? "cursor-not-allowed opacity-30" : "hover:bg-cream"
            }`}
            aria-label="Previous reviews"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className={`absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-md transition-colors sm:-right-2 lg:-right-3 ${
              currentIndex >= maxIndex ? "cursor-not-allowed opacity-30" : "hover:bg-cream"
            }`}
            aria-label="Next reviews"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="overflow-hidden px-8 sm:px-10">
            <div
              className="-mx-2 flex transition-transform duration-500 ease-out sm:-mx-3"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
            >
              {reviewsData.map((review) => (
                <div
                  key={review.id}
                  className="w-full shrink-0 px-2 md:w-1/2 lg:w-1/3 sm:px-3"
                >
                  <div className="h-full bg-cream p-5 sm:p-6 md:p-8">
                  <Quote className="mb-4 h-8 w-8 text-gold" />
                  <div className="mb-4 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => {
                      const full = review.rating >= n
                      const half = !full && review.rating >= n - 0.5
                      return (
                        <span key={n} className="relative inline-block h-4 w-4">
                          <Star className="h-4 w-4 text-border" />
                          {full && <Star className="absolute inset-0 h-4 w-4 fill-gold text-gold" />}
                          {half && (
                            <Star
                              className="absolute inset-0 h-4 w-4 fill-gold text-gold"
                              style={{ clipPath: "inset(0 50% 0 0)" }}
                            />
                          )}
                        </span>
                      )
                    })}
                    <span className={`text-xs text-muted-foreground ${fonts.body}`}>{review.rating.toFixed(1)}</span>
                  </div>
                  <p className={`mb-6 text-sm leading-relaxed text-foreground ${fonts.body}`}>
                    &quot;{review.text}&quot;
                  </p>
                  <div className="border-t border-border pt-4">
                    <p className={`${fonts.body} text-lg`}>{review.name}</p>
                    <p className={`text-sm text-muted-foreground ${fonts.body}`}>
                      {review.product || "Product review"}
                    </p>
                  </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {maxIndex > 0 ? (
          <div className="flex justify-center gap-2 mt-8">
            {[...Array(maxIndex + 1)].map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex ? "bg-gold w-6" : "bg-border"
                }`}
                aria-label={`Go to review group ${i + 1}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
