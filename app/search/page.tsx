"use client"

import { Suspense, useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search } from "lucide-react"
import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import ProductGrid from "@/components/orinket/ProductGrid"
import FilterSidebar from "@/components/orinket/FilterSidebar"
import {
  ProductListingShell,
  ProductListingHero,
  ProductListingToolbar,
} from "@/components/orinket/ProductListingShell"
import ProductListingPagination from "@/components/orinket/ProductListingPagination"
import { searchProducts } from "@/lib/catalogQueries"
import { useAppSelector } from "@/store/hooks"
import { selectProducts } from "@/store/selectors"
import { getFilterOptions, filterProducts, FilterState } from "@/lib/productFilters"
import { useCurrency } from "@/context/CurrencyContext"
import { fonts } from "@/lib/fonts"
import ProductListingPageShimmer from "@/components/orinket/ProductListingPageShimmer"
import GridListShimmer from "@/components/orinket/GridListShimmer"
import useListingTransitionShimmer from "@/hooks/useListingTransitionShimmer"

const PRODUCTS_PER_PAGE = 12

function SearchContent() {
  const { formatPrice } = useCurrency()
  const catalog = useAppSelector(selectProducts)
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get("q") || ""
  const [searchInput, setSearchInput] = useState(query)
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("relevance")
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    categories: [],
    priceRange: null,
    materials: [],
    platings: [],
    rating: [],
    inStock: true,
  })

  const filterOptions = useMemo(
    () => getFilterOptions(catalog, formatPrice),
    [catalog, formatPrice]
  )

  const baseProducts = useMemo(
    () => (query.trim() ? searchProducts(catalog, query) : catalog),
    [query, catalog]
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
      default:
        return copy
    }
  }, [baseProducts, activeFilters, sortBy])

  useEffect(() => {
    setSearchInput(query)
  }, [query])

  useEffect(() => {
    setCurrentPage(1)
  }, [query, activeFilters, sortBy, catalog])

  const totalPages = Math.ceil(filteredResults.length / PRODUCTS_PER_PAGE)
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
  const currentProducts = filteredResults.slice(startIndex, startIndex + PRODUCTS_PER_PAGE)
  const completionSignal = useMemo(
    () =>
      [
        query,
        sortBy,
        currentPage,
        filteredResults.length,
        currentProducts.map((product) => product.id).join("|"),
      ].join("::"),
    [query, sortBy, currentPage, filteredResults.length, currentProducts]
  )
  const { isTransitioning, triggerTransition } = useListingTransitionShimmer(completionSignal)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchInput.trim()
    triggerTransition()
    router.replace(q ? `/search?q=${encodeURIComponent(q)}` : "/search", { scroll: false })
  }

  const clearSearch = () => {
    setSearchInput("")
    triggerTransition()
    router.replace("/search", { scroll: false })
  }

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

  const filterDrawer = (
    <FilterSidebar
      filters={filterOptions}
      activeFilters={activeFilters}
      onFiltersChange={handleFiltersChange}
      isOpen={isFilterOpen}
      onClose={() => setIsFilterOpen(false)}
    />
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <ProductListingShell
        hero={
          <ProductListingHero
            badge={query ? "Search" : "Catalog"}
            title={
              query ? (
                <>
                  Results for{" "}
                  <span className="bg-gradient-to-r from-gold-dark to-stone-800 bg-clip-text text-transparent">
                    &ldquo;{query}&rdquo;
                  </span>
                </>
              ) : (
                <>All products</>
              )
            }
            subtitle={
              query
                ? "Use Filters to narrow results."
                : "Explore every piece in our catalog — refined metals, timeless silhouettes."
            }
          />
        }
        filterDrawer={filterDrawer}
      >
        <ProductListingToolbar
          productCount={filteredResults.length}
          searchQuery={searchInput}
          onSearchChange={setSearchInput}
          onSearchSubmit={handleSearchSubmit}
          onClearSearch={clearSearch}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenFiltersMobile={() => setIsFilterOpen(true)}
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
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold-light/80 to-cream-dark ring-1 ring-gold/20">
              <Search className="h-9 w-9 text-gold-dark/60" />
            </div>
            <h2 className={`mb-2 ${fonts.headings} text-xl font-semibold text-stone-900`}>
              No products found
            </h2>
            <p className={`mx-auto mb-8 max-w-md ${fonts.body} text-sm text-stone-600`}>
              Try adjusting your search or filters to find what you&apos;re looking for.
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
                  inStock: true,
                })
              }
              className={`rounded-xl bg-gradient-to-r from-stone-900 to-stone-800 px-8 py-3 ${fonts.buttons} text-sm font-semibold tracking-wide text-white shadow-lg transition hover:from-gold-dark hover:to-stone-900`}
            >
              Clear filters
            </button>
          </div>
        )}
      </ProductListingShell>

      <Footer />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<ProductListingPageShimmer count={PRODUCTS_PER_PAGE} />}>
      <SearchContent />
    </Suspense>
  )
}
