"use client"

import { fonts } from "@/lib/fonts"

type GridListShimmerProps = {
  /** Number of placeholder tiles (e.g. same as API limit). */
  count: number
  className?: string
}

/**
 * Skeleton grid aligned with Top Styles / product listing grids.
 */
export default function GridListShimmer({ count, className = "" }: GridListShimmerProps) {
  const safe = Math.min(Math.max(count, 1), 24)
  return (
    <div
      className={`grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-4 xl:grid-cols-4 2xl:grid-cols-5 ${className}`}
      aria-busy
      aria-label="Loading products"
    >
      {Array.from({ length: safe }, (_, i) => (
        <div
          key={i}
          className="mx-auto w-full max-w-[26rem] animate-pulse sm:max-w-none"
          style={{ animationDelay: `${i * 45}ms` }}
        >
          <div className="overflow-hidden rounded-xl border border-stone-200/80 bg-white/80 shadow-[0_2px_16px_-6px_rgba(25,18,14,0.08)] ring-1 ring-stone-200/70">
            <div className="relative mb-0 aspect-[4/3] overflow-hidden bg-gradient-to-br from-stone-200 via-stone-100 to-stone-200 sm:aspect-square" />
            <div className="space-y-2.5 border-t border-stone-200/80 px-3.5 pb-3.5 pt-3">
              <div className={`h-3 w-20 rounded-md bg-stone-200 ${fonts.body}`} />
              <div className={`h-4 w-[88%] rounded-md bg-stone-200 ${fonts.body}`} />
              <div className={`h-4 w-[62%] rounded-md bg-stone-200 ${fonts.body}`} />
              <div className="flex gap-2 pt-1">
                <div className="h-4 w-20 rounded-md bg-stone-200" />
                <div className="h-4 w-14 rounded-md bg-stone-100" />
              </div>
              <div className="h-10 w-full rounded-md bg-stone-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
