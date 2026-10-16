"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { PackageOpen } from "lucide-react"
import ProductCard from "@/components/orinket/ProductCard"
import { useAppSelector } from "@/store/hooks"
import { selectCatalogCategories, selectProducts } from "@/store/selectors"
import { slugifyLabel } from "@/lib/slugify"
import { fonts } from "@/lib/fonts"
import { useCmsSection } from "@/hooks/useStorefrontCms"

export default function FineGold() {
  const [activeFilter, setActiveFilter] = useState("All")
  const catalog = useAppSelector(selectProducts)
  const catalogCategories = useAppSelector(selectCatalogCategories)
  const baseProducts = useMemo(
    () =>
      catalog.filter((p) => {
        const keys = Array.isArray(p.storefrontHomeSectionKeys) ? p.storefrontHomeSectionKeys : []
        return keys.includes("showIn925SilverPost")
      }),
    [catalog]
  )
  const raw = useCmsSection("fineGoldSection")
  const title = "925 SILVER POST"
  const filters = useMemo(() => {
    const names = catalogCategories
      .map((c) => String(c.displayName || "").trim())
      .filter(Boolean)
    const unique = [...new Set(names)]
    return ["All", ...unique]
  }, [catalogCategories])
  const emptyRaw = raw?.emptyState
  const emptyState =
    emptyRaw && typeof emptyRaw === "object" && !Array.isArray(emptyRaw)
      ? (emptyRaw as { title?: string; descriptionAll?: string; descriptionFiltered?: string })
      : {}
  const emptyTitle = emptyState.title?.trim() || "No products found"
  const emptyAll =
    emptyState.descriptionAll?.trim() ||
    "This collection is empty for now. Add products in the dashboard or try again later."
  const emptyFiltered =
    emptyState.descriptionFiltered?.trim() || "Try a different style using the filters above."

  if (baseProducts.length === 0) return null

  const activeFilterSlug = slugifyLabel(activeFilter)
  const filteredProducts =
    activeFilter === "All"
      ? baseProducts
      : baseProducts.filter((p) => {
          const categorySlug = slugifyLabel(p.categoryName || p.category || "")
          return categorySlug === activeFilterSlug
        })
  const collectionHref =
    filteredProducts[0]?.categoryId
      ? `/category/${filteredProducts[0].categoryId}`
      : baseProducts[0]?.categoryId
        ? `/category/${baseProducts[0].categoryId}`
        : "/category/all"

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-[#faf9f7] via-white to-[#f0ede8] pt-8 pb-1 text-stone-900 sm:pt-10 sm:pb-2 md:pt-12 md:pb-2 lg:pt-14 lg:pb-3 xl:pt-16 xl:pb-3"
      aria-labelledby="fine-gold-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] sm:opacity-[0.45]"
        style={{
          backgroundImage: `radial-gradient(ellipse 100% 50% at 50% -20%, color-mix(in oklab, var(--gold) 11%, transparent), transparent 58%)`,
        }}
      />
      <div className="pointer-events-none absolute -right-24 top-16 h-64 w-64 rounded-full bg-[#1e2a3a]/[0.035] blur-3xl sm:-right-32 sm:top-24 sm:h-96 sm:w-96 sm:bg-[#1e2a3a]/[0.04]" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-[#c4a574]/[0.06] blur-3xl sm:-left-24 sm:h-80 sm:w-80 sm:bg-[#c4a574]/[0.08]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-5 lg:px-6">
        {/* Simple heading (same style direction as For Every You) */}
        <div className="mb-4">
          <div className="text-center">
            <div className="mx-auto mb-3 flex items-center justify-center gap-3">
              <span className="h-px w-12 bg-gold/50" aria-hidden />
              <p className={`text-[10px] uppercase tracking-[0.42em] text-gold-dark/90 ${fonts.labels}`}>
                Collection
              </p>
              <span className="h-px w-12 bg-gold/50" aria-hidden />
            </div>
            <h2
              id="fine-gold-heading"
              className={`text-3xl md:text-4xl font-light tracking-[0.1em] mb-0 text-center font-[family-name:var(--font-nunito)]`}
            >
              {title}
            </h2>
          </div>
        </div>

        {/* Filters: horizontal scroll on narrow viewports, centered wrap on larger */}
        <div className="mb-6 sm:mb-7 md:mb-8">
          <div className="relative">
            <div
              className="flex snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-hidden pb-2 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:gap-2.5 sm:overflow-x-visible sm:pb-0 md:gap-3 [&::-webkit-scrollbar]:hidden"
              role="tablist"
              aria-label="Filter products by style"
            >
              {filters.map((filter) => {
                const isActive = activeFilter === filter
                return (
                  <button
                    key={filter}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveFilter(filter)}
                    className={`min-h-[44px] shrink-0 snap-center rounded-full border px-4 py-2.5 text-[11px] font-semibold tracking-[0.1em] transition-all duration-300 sm:min-h-0 sm:px-5 sm:py-2.5 sm:text-xs sm:tracking-[0.12em] md:text-sm ${fonts.buttons} ${
                      isActive
                        ? "border-[#1e2a3a] bg-[#1e2a3a] text-white"
                        : "border-stone-200/90 bg-white/90 text-stone-600 backdrop-blur-sm hover:border-stone-300 hover:text-stone-900"
                    }`}
                  >
                    {filter}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Product grid or empty state */}
        {filteredProducts.length === 0 ? (
          <div
            className="mb-3 rounded-2xl border border-dashed border-stone-200/90 bg-white/60 px-6 py-14 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] sm:mb-4 sm:py-16 md:mb-4 md:py-16"
            role="status"
            aria-live="polite"
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100/90 text-stone-400 ring-1 ring-stone-200/80 sm:mb-6">
              <PackageOpen className="h-7 w-7" strokeWidth={1.25} aria-hidden />
            </div>
            <h3
              className={`mb-2 text-lg font-semibold tracking-tight text-stone-900 sm:text-xl ${fonts.headings}`}
            >
              {emptyTitle}
            </h3>
            <p
              className={`mx-auto max-w-md text-sm leading-relaxed text-stone-600 sm:text-[15px] ${fonts.body}`}
            >
              {activeFilter === "All"
                ? emptyAll
                : `No pieces in “${activeFilter}” right now. ${emptyFiltered}`}
            </p>
          </div>
        ) : (
          <div className="mb-3 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 min-[480px]:gap-4 sm:mb-4 sm:gap-5 md:grid-cols-3 md:gap-5 md:mb-4 lg:gap-6 xl:grid-cols-4 xl:gap-5 2xl:gap-6">
            {filteredProducts.map((product, idx) => (
              <div
                key={product.id}
                className="group/card-wrap min-w-0 animate-fadeIn"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="transition duration-500 ease-out group-hover/card-wrap:-translate-y-1 motion-reduce:group-hover/card-wrap:translate-y-0">
                  <ProductCard product={product} />
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredProducts.length >= 8 && (
          <div className="border-t border-stone-200/70 pt-2 text-center sm:pt-2.5 md:pt-3">
            <Link
              href={collectionHref}
              className={`inline-flex min-h-[48px] w-full max-w-sm items-center justify-center rounded-full border border-stone-200/90 bg-white px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-900 shadow-[0_8px_28px_-12px_rgba(28,25,23,0.14)] transition-all duration-300 hover:border-[#1e2a3a] hover:bg-[#1e2a3a] hover:text-white hover:shadow-[0_16px_40px_-16px_rgba(30,42,58,0.32)] sm:min-h-0 sm:w-auto sm:max-w-none sm:px-10 sm:py-3.5 sm:text-xs sm:tracking-[0.2em] ${fonts.buttons}`}
            >
              View all collection
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
