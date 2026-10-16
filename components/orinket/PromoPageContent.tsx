"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import ProductGrid from "@/components/orinket/ProductGrid"
import FilterSidebar from "@/components/orinket/FilterSidebar"
import {
  ProductListingShell,
  ProductListingHero,
  ProductListingToolbar,
} from "@/components/orinket/ProductListingShell"
import {
  getBuyOneGetOneProducts,
  getProductsByOccasionId,
  getProductsForRecipient,
  getProductsWithDiscountUpTo,
  getProductsWithStorefrontSectionKey,
} from "@/lib/catalogQueries"
import { slugifyLabel } from "@/lib/slugify"
import {
  isStorefrontSectionListingKey,
  titleForStorefrontSectionListingKey,
  type StorefrontSectionListingKey,
} from "@/lib/storefrontSectionListingKeys"
import { useAppSelector } from "@/store/hooks"
import {
  selectCatalogShopError,
  selectCatalogShopFailed,
  selectCatalogShopLoading,
  selectCatalogShopReady,
  selectProducts,
} from "@/store/selectors"
import { getFilterOptions, filterProducts, type FilterState } from "@/lib/productFilters"
import { useCurrency } from "@/context/CurrencyContext"
import { fonts } from "@/lib/fonts"
import Link from "next/link"
import ProductListingPagination from "@/components/orinket/ProductListingPagination"
import ProductListingPageShimmer from "@/components/orinket/ProductListingPageShimmer"
import GridListShimmer from "@/components/orinket/GridListShimmer"
import useListingTransitionShimmer from "@/hooks/useListingTransitionShimmer"

const PRODUCTS_PER_PAGE = 12

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "bestseller", label: "Bestseller" },
]

type PromoMode =
  | { kind: "bogo" }
  | { kind: "discount"; percent: number }
  | { kind: "section"; key: StorefrontSectionListingKey }
  | { kind: "recipient"; key: "her" | "him" }
  | { kind: "occasion"; key: string }
  | { kind: "invalid" }

function parsePromoMode(searchParams: URLSearchParams): PromoMode {
  const offer = String(searchParams.get("offer") || "")
    .trim()
    .toLowerCase()
  if (offer === "bogo") return { kind: "bogo" }

  const raw = searchParams.get("discount")
  if (raw != null && String(raw).trim() !== "") {
    const n = Number.parseInt(String(raw).trim(), 10)
    if (Number.isFinite(n) && n >= 1 && n <= 99) return { kind: "discount", percent: n }
  }

  const sectionRaw = String(searchParams.get("section") || "").trim()
  if (sectionRaw && isStorefrontSectionListingKey(sectionRaw)) {
    return { kind: "section", key: sectionRaw }
  }

  const recipientRaw = String(searchParams.get("recipient") || "")
    .trim()
    .toLowerCase()
  if (recipientRaw === "her" || recipientRaw === "him") {
    return { kind: "recipient", key: recipientRaw as "her" | "him" }
  }

  const occasionKey = String(searchParams.get("occasion") || "").trim()
  if (occasionKey) return { kind: "occasion", key: occasionKey }

  return { kind: "invalid" }
}

function PromoInner() {
  const { formatPrice } = useCurrency()
  const catalog = useAppSelector(selectProducts)
  const searchParams = useSearchParams()
  const router = useRouter()
  const mode = useMemo(() => parsePromoMode(searchParams), [searchParams])

  const [occasionMeta, setOccasionMeta] = useState<{ id: string; name: string } | null>(null)
  const [occasionResolved, setOccasionResolved] = useState(false)

  useEffect(() => {
    if (mode.kind !== "occasion") {
      setOccasionMeta(null)
      setOccasionResolved(true)
      return
    }
    setOccasionResolved(false)
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/public/occasions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: "{}",
        })
        const j = (await res.json()) as {
          success?: boolean
          data?: { _id: string; occasionname?: string; slug?: string }[]
        }
        if (cancelled) return
        if (!res.ok || !j.success || !Array.isArray(j.data)) {
          setOccasionMeta(null)
          setOccasionResolved(true)
          return
        }
        const key = mode.key
        const row = OBJECT_ID_RE.test(key)
          ? j.data.find((r) => String(r._id) === key)
          : j.data.find(
              (r) =>
                slugifyLabel(String(r.slug || "")) === slugifyLabel(key) ||
                String(r.slug || "").toLowerCase() === key.toLowerCase()
            )
        if (row) {
          setOccasionMeta({
            id: String(row._id),
            name: String(row.occasionname || "").trim() || "Occasion",
          })
        } else {
          setOccasionMeta(null)
        }
      } catch {
        if (!cancelled) setOccasionMeta(null)
      } finally {
        if (!cancelled) setOccasionResolved(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [mode])

  const shopReady = useAppSelector(selectCatalogShopReady)
  const shopLoading = useAppSelector(selectCatalogShopLoading)
  const shopFailed = useAppSelector(selectCatalogShopFailed)
  const shopError = useAppSelector(selectCatalogShopError)

  const [listSearchQuery, setListSearchQuery] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("relevance")
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    categories: [],
    priceRange: null,
    materials: [],
    platings: [],
    rating: [],
    inStock: false,
  })

  const baseProducts = useMemo(() => {
    if (!shopReady) return []
    if (mode.kind === "bogo") return getBuyOneGetOneProducts(catalog)
    if (mode.kind === "discount") return getProductsWithDiscountUpTo(catalog, mode.percent)
    if (mode.kind === "section") return getProductsWithStorefrontSectionKey(catalog, mode.key)
    if (mode.kind === "recipient") return getProductsForRecipient(catalog, mode.key)
    if (mode.kind === "occasion") {
      if (!occasionMeta) return []
      return getProductsByOccasionId(catalog, occasionMeta.id)
    }
    return []
  }, [shopReady, mode, catalog, occasionMeta])

  const filterOptions = useMemo(
    () => getFilterOptions(catalog, formatPrice),
    [catalog, formatPrice]
  )

  const filteredResults = useMemo(() => {
    const list = filterProducts(baseProducts, activeFilters)
    const copy = [...list]
    switch (sortBy) {
      case "price-low":
        return copy.sort((a, b) => a.price - b.price)
      case "price-high":
        return copy.sort((a, b) => b.price - a.price)
      case "newest":
        return copy.sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)))
      case "bestseller":
        return copy.sort(
          (a, b) => Number(Boolean(b.isBestseller)) - Number(Boolean(a.isBestseller))
        )
      default:
        return copy
    }
  }, [baseProducts, activeFilters, sortBy])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeFilters, baseProducts, sortBy])

  const totalPages = Math.ceil(filteredResults.length / PRODUCTS_PER_PAGE)
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
  const currentProducts = filteredResults.slice(startIndex, startIndex + PRODUCTS_PER_PAGE)
  const completionSignal = useMemo(
    () =>
      [
        JSON.stringify(mode),
        sortBy,
        currentPage,
        filteredResults.length,
        currentProducts.map((product) => product.id).join("|"),
      ].join("::"),
    [mode, sortBy, currentPage, filteredResults.length, currentProducts]
  )
  const { isTransitioning, triggerTransition } = useListingTransitionShimmer(completionSignal)

  const handlePageChange = (page: number) => {
    triggerTransition()
    setCurrentPage(page)
  }

  const handleFiltersChange = (filters: FilterState) => {
    triggerTransition()
    setActiveFilters(filters)
  }

  const handleSortChange = (value: string) => {
    triggerTransition()
    setSortBy(value)
  }

  const hero = useMemo(() => {
    if (mode.kind === "bogo") {
      return {
        badge: "Offer",
        title: "Buy one, get one free",
        subtitle: "Every piece here is tagged for this promotion in Product Master.",
      }
    }
    if (mode.kind === "discount") {
      return {
        badge: "Offer",
        title: `Up to ${mode.percent}% off`,
        subtitle: `On-sale pieces from about 1% up to ${mode.percent}% off versus original price (rounded), same logic as product cards.`,
      }
    }
    if (mode.kind === "section") {
      const label = titleForStorefrontSectionListingKey(mode.key)
      return {
        badge: "Collection",
        title: label,
        subtitle:
          "Discover our collection of 18k thick gold plated jewellery. Premium metals, lasting shine, and designs for every day.",
      }
    }
    if (mode.kind === "recipient") {
      return {
        badge: "Gifts",
        title: mode.key === "her" ? "Gifts For Her" : "Gifts For Him",
        subtitle:
          "Thoughtfully curated pieces perfect for that special someone. Explore our most loved giftable jewellery.",
      }
    }
    if (mode.kind === "occasion") {
      return {
        badge: "Shop by occasion",
        title: !occasionResolved ? "Loading…" : occasionMeta?.name || "Occasion not found",
        subtitle: !occasionResolved
          ? "Resolving occasion…"
          : occasionMeta
            ? "Pieces tagged with this occasion in Product Master (Occasions, multi-select)."
            : "Check the link or pick another occasion from the homepage carousel.",
      }
    }
    return {
      badge: "Promotions",
      title: "Promotion link",
      subtitle:
        "Use a valid URL, for example /promo?offer=bogo, /promo?discount=50, /promo?section=demiFineJewelleryProducts, or /promo?occasion={occasionId}.",
    }
  }, [mode, occasionMeta, occasionResolved])

  const handleListSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = listSearchQuery.trim()
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  const clearListSearch = () => setListSearchQuery("")

  const filterCount = useMemo(() => {
    let c = 0
    if (activeFilters.categories.length > 0) c++
    if (activeFilters.priceRange) c++
    if (activeFilters.materials.length > 0) c++
    if (activeFilters.platings.length > 0) c++
    if (activeFilters.rating.length > 0) c++
    if (activeFilters.inStock) c++
    return c
  }, [activeFilters])

  const extraCountSlot =
    filterCount > 0 ? (
      <span className="ml-2 inline-flex items-center rounded-full border border-gold/30 bg-gold-light/40 px-2.5 py-0.5 text-xs font-medium text-gold-dark">
        {filterCount} filter{filterCount > 1 ? "s" : ""} applied
      </span>
    ) : null

  if (shopLoading) {
    return <ProductListingPageShimmer count={PRODUCTS_PER_PAGE} />
  }

  if (shopFailed) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h2 className={`text-xl font-semibold text-stone-900 ${fonts.headings}`}>
          Could not load catalog
        </h2>
        <p className={`mt-2 text-stone-600 ${fonts.body}`}>
          {shopError ?? "Please try again later."}
        </p>
      </div>
    )
  }

  if (mode.kind === "invalid") {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className={`mb-3 text-2xl font-light text-stone-900 ${fonts.headings}`}>
          {hero.title}
        </h1>
        <p className={`mb-8 text-stone-600 ${fonts.body}`}>{hero.subtitle}</p>
        <Link
          href="/category/all"
          className={`inline-flex rounded-xl bg-gradient-to-r from-stone-900 to-stone-800 px-8 py-3 ${fonts.buttons} text-sm font-semibold tracking-wide text-white shadow-lg transition hover:from-gold-dark hover:to-stone-900`}
        >
          Browse all products
        </Link>
      </div>
    )
  }

  return (
    <>
      <ProductListingShell
        hero={
          <ProductListingHero
            badge={hero.badge}
            title={hero.title}
            subtitle={hero.subtitle}
          />
        }
        filterDrawer={
          <FilterSidebar
            filters={filterOptions}
            activeFilters={activeFilters}
            onFiltersChange={handleFiltersChange}
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
          />
        }
      >
        <ProductListingToolbar
          productCount={filteredResults.length}
          searchQuery={listSearchQuery}
          onSearchChange={setListSearchQuery}
          onSearchSubmit={handleListSearchSubmit}
          onClearSearch={clearListSearch}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          sortOptions={SORT_OPTIONS}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenFiltersMobile={() => setIsFilterOpen(true)}
          mobileFilterBadge={filterCount}
          extraCountSlot={extraCountSlot}
        />

        {isTransitioning ? (
          <GridListShimmer count={PRODUCTS_PER_PAGE} />
        ) : filteredResults.length > 0 ? (
          <>
            <ProductGrid products={currentProducts} viewMode={viewMode} />

            <ProductListingPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="rounded-2xl border border-stone-200/70 bg-white/70 py-16 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-sm">
            <p className={`mx-auto mb-6 max-w-md ${fonts.body} text-stone-600`}>
              {mode.kind === "bogo"
                ? "No products are marked Buy 1 Get 1 Free yet. Enable it on each product in Product Master."
                : mode.kind === "section"
                  ? `No products are tagged for “${titleForStorefrontSectionListingKey(mode.key)}” yet. Use Product Master → Marketing → Product Listed On, or run backend/scripts/backfill-storefront-section-products.js.`
                  : mode.kind === "recipient"
                    ? mode.key === "him"
                      ? "No Gifts-category products match “for him” yet (Man / Male / Men or Both). Assign Category = Gifts and Product For in Product Master, or clear filters."
                      : "No Gifts-category products match “for her” yet (Woman / Female / Women or Both). Assign Category = Gifts and Product For in Product Master, or clear filters."
                    : mode.kind === "occasion"
                      ? !occasionMeta
                        ? "This occasion is inactive or the link is invalid."
                        : "No in-stock products are tagged with this occasion yet. Use Product Master → Category tab → Occasions (multi-select)."
                      : `No on-sale products found up to ${mode.percent}% off. Ensure original price is above sale price in Product Master, or widen filters.`}
            </p>
            <button
              type="button"
              onClick={() =>
                handleFiltersChange({
                  categories: [],
                  priceRange: null,
                  materials: [],
                  platings: [],
                  rating: [],
                  inStock: false,
                })
              }
              className={`rounded-xl bg-gradient-to-r from-stone-900 to-stone-800 px-8 py-3 ${fonts.buttons} text-sm font-semibold tracking-wide text-white shadow-lg transition hover:from-gold-dark hover:to-stone-900`}
            >
              Clear filters
            </button>
          </div>
        )}
      </ProductListingShell>
    </>
  )
}

export default function PromoPageContent() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <Suspense
        fallback={
          <ProductListingPageShimmer count={PRODUCTS_PER_PAGE} />
        }
      >
        <PromoInner />
      </Suspense>
      <Footer />
    </main>
  )
}
