"use client"

import GridListShimmer from "@/components/orinket/GridListShimmer"
import { ProductListingShell } from "@/components/orinket/ProductListingShell"

function ShimmerBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-stone-200/80 ${className}`} />
}

function ProductListingHeroShimmer() {
  return (
    <section className="mb-10 md:mb-12">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-stone-200/70 bg-gradient-to-br from-white via-cream/40 to-white p-6 shadow-[0_24px_64px_-28px_rgba(28,25,23,0.18)] ring-1 ring-stone-900/[0.04] sm:p-8 lg:p-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center lg:items-start lg:text-left">
          <div className="flex items-center gap-4">
            <ShimmerBlock className="h-8 w-32 rounded-full" />
            <ShimmerBlock className="hidden h-px w-16 rounded-full sm:block lg:w-24" />
          </div>
          <div className="w-full space-y-3">
            <ShimmerBlock className="mx-auto h-12 w-full max-w-[18rem] lg:mx-0 lg:max-w-[22rem]" />
            <ShimmerBlock className="mx-auto h-4 w-full max-w-[32rem] lg:mx-0" />
            <ShimmerBlock className="mx-auto h-4 w-4/5 max-w-[26rem] lg:mx-0" />
          </div>
        </div>
      </div>
    </section>
  )
}

function ProductListingToolbarShimmer() {
  return (
    <div className="relative z-20 mb-5 overflow-visible rounded-2xl border border-stone-200/80 bg-white/90 p-3 shadow-[0_8px_40px_-14px_rgba(28,25,23,0.12)] backdrop-blur-sm ring-1 ring-stone-900/[0.04] sm:mb-7 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <ShimmerBlock className="h-11 w-28" />
          <ShimmerBlock className="h-11 w-36 sm:w-40" />
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-1 sm:flex-row sm:justify-end">
          <ShimmerBlock className="h-10 w-full sm:max-w-[22rem]" />
          <ShimmerBlock className="h-10 w-full sm:max-w-[16rem]" />
          <ShimmerBlock className="h-10 w-24 sm:w-28" />
        </div>
      </div>
    </div>
  )
}

export default function ProductListingPageShimmer({ count = 8 }: { count?: number }) {
  return (
    <ProductListingShell hero={<ProductListingHeroShimmer />} filterDrawer={null}>
      <ProductListingToolbarShimmer />
      <GridListShimmer count={count} />
    </ProductListingShell>
  )
}
