"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Check, Heart, ShoppingBag, Star } from "lucide-react"
import type { Product } from "@/types/product"
import { useCart } from "@/store/useCart"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  selectShowGridListShimmer,
  selectTopStylesError,
  selectTopStylesItems,
  selectTopStylesStatus,
  selectTopStylesTotalCount,
} from "@/store/selectors"
import GridListShimmer from "@/components/orinket/GridListShimmer"
import { fetchTopStyles } from "@/store/slices/topStylesSlice"
import { topStyleLabelToTab } from "@/lib/topStyles/labelToTabSlug"
import { slugifyLabel } from "@/lib/slugify"
import { fonts } from "@/lib/fonts"
import { useCurrency } from "@/context/CurrencyContext"
import { useStorefrontCms } from "@/hooks/useStorefrontCms"
import { selectCatalogCategories } from "@/store/selectors"

type RowProduct = Product & { discount: number }

function TopStyleProductTile({
  product,
  index,
  formatPrice,
}: {
  product: RowProduct
  index: number
  formatPrice: (n: number) => string
}) {
  const tileImageSrc = typeof product.image === "string" ? product.image.trim() : ""
  const formatTilePrice = (price: number | undefined) => {
    if (price == null || price <= 0) return formatPrice(0)
    return formatPrice(price)
  }
  const categoryPathPart = product.categoryId || "uncategorized"
  const categoryLabel = (product.categoryName || product.category || "").replace(/-/g, " ")
  const { addToWishlist, removeFromWishlist, isInWishlist, addToCart } = useCart()
  const [bagAdded, setBagAdded] = useState(false)
  const [oosHint, setOosHint] = useState<string | null>(null)
  const inList = isInWishlist(product.id)

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inList) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: tileImageSrc,
        category: product.category,
        stockLeft: product.stockLeft,
      })
    }
  }

  const handleAddToBag = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!product.inStock) {
      setOosHint("Out of stock")
      window.setTimeout(() => setOosHint(null), 2200)
      return
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: tileImageSrc,
      stockLeft: product.stockLeft,
    })
    setBagAdded(true)
  }

  return (
    <Link
      href={`/category/${categoryPathPart}/${product.id}`}
      className="group animate-slideUp relative block h-full cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      <article className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-gradient-to-b from-card via-card to-cream/30 shadow-[0_2px_16px_-6px_rgba(25,18,14,0.08)] ring-1 ring-black/[0.04] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgba(25,18,14,0.14)] hover:ring-gold/15">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-cream-dark/80 via-cream to-cream-dark/60">
          {tileImageSrc ? (
            <Image
              src={tileImageSrc}
              alt={product.name}
              fill
              className="object-cover object-center transition-transform duration-[650ms] ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="h-full w-full bg-gray-100" aria-hidden />
          )}

          <div className="absolute left-2 top-2 z-10 flex max-w-[calc(100%-4rem)] flex-col gap-1">
            {product.isNew && (
              <span className={`inline-flex w-fit items-center border border-border/60 bg-white/95 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-foreground shadow-sm backdrop-blur-sm ${fonts.labels}`}>
                New
              </span>
            )}
            {product.isBestseller && (
              <span className={`inline-flex w-fit items-center border border-white/20 bg-[#1e2a3a] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#f5f2eb] shadow-sm ${fonts.labels}`}>
                Bestseller
              </span>
            )}
            {product.discount > 0 ? (
              <span className={`inline-flex w-fit items-center border border-stone-200/60 bg-gradient-to-r from-[#2d3d4f] to-[#1e2a3a] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white shadow-sm ${fonts.labels}`}>
                {product.discount}% off
              </span>
            ) : null}
          </div>

          <div className="absolute right-2 top-2 z-10 flex flex-col gap-1.5 opacity-100 transition-all duration-300 sm:translate-x-1 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100">
            <button
              type="button"
              onClick={handleWishlist}
              className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/40 shadow-md backdrop-blur-md transition-colors hover:scale-105 ${
                inList
                  ? "bg-gradient-to-br from-gold to-gold-dark text-white"
                  : "bg-white/90 text-foreground hover:bg-foreground hover:text-white"
              }`}
              aria-label={inList ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`h-3.5 w-3.5 ${inList ? "fill-current" : ""}`} strokeWidth={1.75} />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            <button
              type="button"
              onClick={handleAddToBag}
              disabled={bagAdded}
              className={`flex min-h-[44px] w-full items-center justify-center gap-2 py-3 ${fonts.buttons} text-[10px] uppercase tracking-[0.14em] transition-colors sm:text-xs ${
                bagAdded ? "bg-emerald-700 text-white" : "bg-foreground text-background"
              }`}
            >
              {bagAdded ? (
                <>
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                  Added to cart
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  Quick add
                </>
              )}
            </button>
            {oosHint && (
              <p className={`bg-white/95 px-2 py-1 text-center text-[11px] text-amber-900 ${fonts.labels}`}>
                {oosHint}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 border-t border-border/40 bg-gradient-to-b from-white/90 to-cream/20 px-2.5 pb-2.5 pt-2 sm:gap-2 sm:px-3 sm:pb-3 sm:pt-2.5">
          {categoryLabel ? (
            <p className={`text-[9px] uppercase tracking-[0.2em] text-gold-dark/90 ${fonts.labels}`}>
              {categoryLabel}
            </p>
          ) : null}

          <h3 className={`line-clamp-2 text-[13px] font-medium leading-snug tracking-tight text-foreground transition-colors duration-300 group-hover:text-gold-dark sm:text-sm md:text-base ${fonts.headings}`}>
            {product.name}
          </h3>

          {product.rating != null ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${
                      i < Math.floor(product.rating!)
                        ? "fill-gold text-gold"
                        : "text-border"
                    }`}
                  />
                ))}
              </div>
              <span className={`text-xs font-medium tabular-nums text-foreground/90 ${fonts.body}`}>
                {product.rating}
              </span>
              <span className={`text-xs text-muted-foreground ${fonts.body}`}>
                ({product.reviews ?? 0})
              </span>
            </div>
          ) : null}

          <div className={`mt-auto flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 border-t border-border/30 pt-2 ${fonts.body}`}>
            <span className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
              {formatTilePrice(product.price)}
            </span>
            {product.originalPrice && (
              <>
                <span className="text-xs text-muted-foreground line-through">
                  {formatTilePrice(product.originalPrice)}
                </span>
                {product.discount > 0 ? (
                  <span className={`text-[9px] font-semibold uppercase tracking-wide text-[#3d5a4a] ${fonts.labels}`}>
                    Save {product.discount}%
                  </span>
                ) : null}
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

function useTopStylesPageSize(): number {
  const [limit, setLimit] = useState(8)

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    const sync = () => setLimit(mq.matches ? 8 : 4)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  return limit
}

const MIN_PRODUCTS_FOR_VIEW_ALL = 8

export default function TopStyles() {
  const { formatPrice } = useCurrency()
  const dispatch = useAppDispatch()
  const { settings } = useStorefrontCms()
  const catalogCategoryRows = useAppSelector(selectCatalogCategories)
  const [activeCategory, setActiveCategory] = useState("ALL")
  const visibleLimit = useTopStylesPageSize()

  const items = useAppSelector(selectTopStylesItems)
  const status = useAppSelector(selectTopStylesStatus)
  const error = useAppSelector(selectTopStylesError)
  const topStylesTotalCount = useAppSelector(selectTopStylesTotalCount)
  const showGridShimmer = useAppSelector(selectShowGridListShimmer)

  const categories = useMemo(
    () => ["ALL", ...catalogCategoryRows.map((c) => c.displayName.toUpperCase())],
    [catalogCategoryRows]
  )

  const sectionTitle = useMemo(() => {
    const name = settings?.storeName?.trim() || "Shop"
    return `${name.toUpperCase()} TOP STYLES`
  }, [settings?.storeName])

  useEffect(() => {
    if (categories.length && !categories.includes(activeCategory)) {
      setActiveCategory(categories[0]!)
    }
  }, [categories, activeCategory])

  const tab = topStyleLabelToTab(activeCategory)
  const activeCategoryId = useMemo(() => {
    if (activeCategory === "ALL") return undefined
    return catalogCategoryRows.find(
      (c) => c.displayName.toUpperCase() === activeCategory.toUpperCase()
    )?.id
  }, [activeCategory, catalogCategoryRows])

  useEffect(() => {
    dispatch(
      fetchTopStyles({
        categoryid: activeCategoryId,
        pageno: 1,
        pagelimit: visibleLimit,
      })
    )
  }, [dispatch, activeCategoryId, visibleLimit])

  const rowProducts = useMemo((): RowProduct[] => {
    return items
      .filter((product) => {
        const keys = product.storefrontHomeSectionKeys
        return Array.isArray(keys) && keys.includes("topStylesProducts")
      })
      .map((product) => ({
        ...product,
        discount: 0, // Discount managed per-product or fixed at 0 since master is gone
      }))
  }, [items])

  const viewAllHref = useMemo(() => {
    if (activeCategory === "ALL") return "/category/all"
    const tabSlug = topStyleLabelToTab(activeCategory)
    const stripTrailingS = (s: string) =>
      s.length > 1 ? s.replace(/s$/i, "") : s
    const row = catalogCategoryRows.find((c) => {
      const cSlug = String(c.slug || "").trim().toLowerCase()
      const fromName = slugifyLabel(String(c.displayName || ""))
      return (
        cSlug === tabSlug ||
        fromName === tabSlug ||
        stripTrailingS(cSlug) === stripTrailingS(tabSlug) ||
        stripTrailingS(fromName) === stripTrailingS(tabSlug)
      )
    })
    if (row?.id) return `/category/${row.id}`
    // Fallback to slug route; category page will canonicalize to `/category/<id>` once catalog resolves.
    return `/category/${tabSlug || "all"}`
  }, [activeCategory, catalogCategoryRows])

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <h2 className={`mb-8 animate-fadeIn ${fonts.headings} text-3xl font-light tracking-[0.1em] md:text-4xl`}>
            {sectionTitle}
          </h2>

          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {categories.map((category, index: number) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 ${fonts.buttons} text-xs tracking-wider transition-all duration-300 animate-slideUp hover:shadow-sm md:text-sm ${
                  activeCategory === category
                    ? "bg-foreground text-background shadow-md"
                    : "bg-transparent text-foreground hover:bg-cream"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {(showGridShimmer || status === "loading") && (
          <div className="py-2">
            <GridListShimmer count={visibleLimit} />
          </div>
        )}

        {status === "failed" && error && !showGridShimmer && (
          <p className={`py-8 text-center text-sm text-red-700 ${fonts.body}`}>{error}</p>
        )}

        {status === "succeeded" && rowProducts.length === 0 && !showGridShimmer && (
          <div className={`mx-auto max-w-md py-16 text-center ${fonts.body}`}>
            <p className="text-base font-medium text-stone-800">Products not available</p>
            <p className="mt-2 text-sm text-muted-foreground">
              There are no products to show for this category right now. Try another tab or check back later.
            </p>
          </div>
        )}

        {status === "succeeded" && rowProducts.length > 0 && !showGridShimmer && (
          <>
            <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8">
              {rowProducts.map((product: RowProduct, index: number) => (
                <TopStyleProductTile
                  key={product.id ? `${product.id}-${index}` : `top-style-${index}`}
                  product={product}
                  index={index}
                  formatPrice={formatPrice}
                />
              ))}
            </div>

            {topStylesTotalCount >= MIN_PRODUCTS_FOR_VIEW_ALL ? (
              <div className="mt-12 text-center">
                <Link
                  href={viewAllHref}
                  className={`animate-slideUp inline-block border border-foreground px-8 py-3 ${fonts.buttons} text-sm tracking-[0.2em] text-foreground transition-all duration-300 hover:bg-foreground hover:text-background hover:shadow-lg`}
                  style={{ animationDelay: "600ms" }}
                >
                  VIEW ALL
                </Link>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}
