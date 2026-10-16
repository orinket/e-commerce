"use client"

import { useRouter } from "next/navigation"
import ProductGrid from "@/components/orinket/ProductGrid"
import FilterSidebar from "@/components/orinket/FilterSidebar"
import {
  ProductListingShell,
  ProductListingHero,
  ProductListingToolbar,
} from "@/components/orinket/ProductListingShell"
import ProductListingPagination from "@/components/orinket/ProductListingPagination"
import type { Product } from "@/types/product"
import { getProductsByCategory } from "@/lib/catalogQueries"
import { X } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { getFilterOptions, filterProducts, FilterState } from "@/lib/productFilters"
import { useCurrency } from "@/context/CurrencyContext"
import { fonts } from "@/lib/fonts"
import { useAppSelector } from "@/store/hooks"
import type { CatalogCategoryRow } from "@/store/slices/catalogSlice"
import {
  selectCatalogCategories,
  selectCatalogShopError,
  selectCatalogShopFailed,
  selectCatalogShopLoading,
  selectCatalogShopReady,
  selectProducts,
} from "@/store/selectors"
import ProductListingPageShimmer from "@/components/orinket/ProductListingPageShimmer"
import GridListShimmer from "@/components/orinket/GridListShimmer"
import useListingTransitionShimmer from "@/hooks/useListingTransitionShimmer"

const ALL_CATEGORY_META = {
  displayName: "All Products",
  description:
    "Discover our complete collection of beautiful jewelry pieces",
} as const

const PRODUCTS_PER_PAGE = 12

function displayNameFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
    .trim() || slug
}

function getBaseProductsForSlug(
  slug: string,
  allProducts: Product[],
  catalogCategories: CatalogCategoryRow[]
) {
  return slug === "all"
    ? allProducts
    : getProductsByCategory(allProducts, slug, catalogCategories)
}

const CATEGORY_SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "bestseller", label: "Bestseller" },
]

interface CategoryPageContentProps {
  slug: string
}

function isObjectId(value: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(String(value || "").trim())
}

function resolveCategoryRoute(
  routeParam: string,
  catalogCategories: CatalogCategoryRow[]
): { row: CatalogCategoryRow | null; effectiveSlug: string } {
  const raw = String(routeParam || "").trim()
  if (!raw || raw === "all") return { row: null, effectiveSlug: "all" }

  const byId = isObjectId(raw)
    ? catalogCategories.find((c) => String(c.id) === raw)
    : null
  if (byId) return { row: byId, effectiveSlug: byId.slug }

  const bySlug = catalogCategories.find((c) => c.slug === raw)
  if (bySlug) return { row: bySlug, effectiveSlug: bySlug.slug }

  return { row: null, effectiveSlug: raw }
}

export default function CategoryPageContent({ slug }: CategoryPageContentProps) {
  const { formatPrice } = useCurrency()
  const router = useRouter()
  const allProducts = useAppSelector(selectProducts)
  const catalogCategories = useAppSelector(selectCatalogCategories)
  const shopReady = useAppSelector(selectCatalogShopReady)
  const shopLoading = useAppSelector(selectCatalogShopLoading)
  const shopFailed = useAppSelector(selectCatalogShopFailed)
  const shopError = useAppSelector(selectCatalogShopError)
  const resolvedRoute = useMemo(
    () => resolveCategoryRoute(slug, catalogCategories),
    [slug, catalogCategories]
  )

  useEffect(() => {
    if (!shopReady) return
    if (slug === "all") return
    if (isObjectId(slug)) return
    if (!resolvedRoute.row?.id) return
    router.replace(`/category/${resolvedRoute.row.id}`)
  }, [shopReady, slug, resolvedRoute, router])

  const categoryMeta = useMemo(() => {
    if (resolvedRoute.effectiveSlug === "all") {
      return {
        displayName: ALL_CATEGORY_META.displayName,
        description: ALL_CATEGORY_META.description,
      }
    }
    const fromCatalog = resolvedRoute.row
    if (fromCatalog) {
      return {
        displayName: fromCatalog.displayName,
        description: fromCatalog.description,
      }
    }
    /** If route id/slug is not in catalog yet, still show listing shell without 404. */
    const label = displayNameFromSlug(resolvedRoute.effectiveSlug)
    return {
      displayName: label,
      description: `Discover ${label.toLowerCase()} from our collection.`,
    }
  }, [resolvedRoute])

  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [listSearchQuery, setListSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("relevance")
  /** Route already scopes PLP by category; sidebar `categories` stays empty unless user refines. `inStock: false` = show OOS too (default). */
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    categories: [],
    priceRange: null,
    materials: [],
    platings: [],
    rating: [],
    inStock: false,
  })

  const baseCategoryProducts = useMemo(
    () =>
      getBaseProductsForSlug(
        resolvedRoute.effectiveSlug,
        allProducts,
        catalogCategories
      ),
    [resolvedRoute.effectiveSlug, allProducts, catalogCategories]
  )

  const filterOptions = useMemo(
    () => {
      const sourceProducts =
        resolvedRoute.effectiveSlug === "all" ? allProducts : baseCategoryProducts
      const options = getFilterOptions(sourceProducts, formatPrice)
      return {
        ...options,
        categories: resolvedRoute.effectiveSlug === "all" ? options.categories : [],
      }
    },
    [resolvedRoute.effectiveSlug, allProducts, baseCategoryProducts, formatPrice]
  )

  useEffect(() => {
    if (!shopReady || !categoryMeta) return

    setFilteredProducts(baseCategoryProducts)

    setActiveFilters((prev) => ({
      ...prev,
      categories: [],
    }))
  }, [baseCategoryProducts, resolvedRoute, shopReady, categoryMeta])

  useEffect(() => {
    if (!shopReady || !categoryMeta) return
    const filtered = filterProducts(baseCategoryProducts, activeFilters)
    setFilteredProducts(filtered)
    setCurrentPage(1)
  }, [activeFilters, baseCategoryProducts, shopReady, categoryMeta])

  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts]
    switch (sortBy) {
      case "price-low":
        return products.sort((a, b) => a.price - b.price)
      case "price-high":
        return products.sort((a, b) => b.price - a.price)
      case "newest":
        return products.sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)))
      case "bestseller":
        return products.sort((a, b) => Number(Boolean(b.isBestseller)) - Number(Boolean(a.isBestseller)))
      default:
        return products
    }
  }, [filteredProducts, sortBy])

  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE)
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
  const endIndex = startIndex + PRODUCTS_PER_PAGE
  const currentProducts = sortedProducts.slice(startIndex, endIndex)
  const completionSignal = useMemo(
    () =>
      [
        resolvedRoute.effectiveSlug,
        sortBy,
        currentPage,
        sortedProducts.length,
        currentProducts.map((product) => product.id).join("|"),
      ].join("::"),
    [resolvedRoute.effectiveSlug, sortBy, currentPage, sortedProducts.length, currentProducts]
  )
  const { isTransitioning, triggerTransition } = useListingTransitionShimmer(completionSignal)

  const handleFiltersChange = (filters: FilterState) => {
    triggerTransition()
    setActiveFilters(filters)
  }

  const handleSortChange = (value: string) => {
    triggerTransition()
    setSortBy(value)
  }

  const handlePageChange = (page: number) => {
    triggerTransition()
    setCurrentPage(page)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (activeFilters.categories.length > 0) count++
    if (activeFilters.priceRange) count++
    if (activeFilters.materials.length > 0) count++
    if (activeFilters.platings.length > 0) count++
    if (activeFilters.rating.length > 0) count++
    if (activeFilters.inStock) count++
    return count
  }

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

  const category = categoryMeta

  const handleListSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = listSearchQuery.trim()
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`)
    }
  }

  const clearListSearch = () => setListSearchQuery("")

  const filterCount = getActiveFilterCount()

  const extraCountSlot =
    filterCount > 0 ? (
      <span className="ml-2 inline-flex items-center rounded-full border border-gold/30 bg-gold-light/40 px-2.5 py-0.5 text-xs font-medium text-gold-dark">
        {filterCount} filter{filterCount > 1 ? "s" : ""} applied
      </span>
    ) : null

  return (
    <ProductListingShell
      hero={
        <ProductListingHero
          badge="Collection"
          title={category.displayName}
          subtitle={`${category.description} Tap Filters to narrow results.`}
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
        productCount={sortedProducts.length}
        searchQuery={listSearchQuery}
        onSearchChange={setListSearchQuery}
        onSearchSubmit={handleListSearchSubmit}
        onClearSearch={clearListSearch}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        sortOptions={CATEGORY_SORT_OPTIONS}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenFiltersMobile={() => setIsFilterOpen(true)}
        mobileFilterBadge={filterCount}
        extraCountSlot={extraCountSlot}
      />

      {isTransitioning ? (
        <GridListShimmer count={PRODUCTS_PER_PAGE} />
      ) : currentProducts.length > 0 ? (
        <>
          <ProductGrid products={currentProducts} viewMode={viewMode} />

          <ProductListingPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <div className="rounded-2xl border border-stone-200/70 bg-white/70 py-20 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-sm">
          <div className="mx-auto max-w-lg space-y-8">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-gold-light/80 to-cream-dark shadow-[0_12px_40px_-8px_rgba(28,25,23,0.15)] ring-1 ring-gold/20">
              <svg className="h-14 w-14 text-gold-dark/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <div className="space-y-3">
              <h2 className="font-serif text-2xl text-stone-900 sm:text-3xl">No products found</h2>
              <p className={`${fonts.body} text-base leading-relaxed text-stone-600 sm:text-lg`}>
                We couldn&apos;t find any products matching your current filters. Try adjusting your criteria to see more results.
              </p>
            </div>
            <div className="space-y-4 pt-2">
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
                className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-stone-900 to-stone-800 px-8 py-3.5 ${fonts.buttons} text-sm font-semibold tracking-wide text-white shadow-lg transition hover:from-gold-dark hover:to-stone-900`}
              >
                <X className="h-5 w-5" />
                Clear all filters
              </button>
            </div>
          </div>
        </div>
      )}
    </ProductListingShell>
  )
}
