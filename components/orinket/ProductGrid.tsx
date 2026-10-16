'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Check, Heart, ShoppingBag, Star } from 'lucide-react'
import type { Product } from '@/types/product'
import { useCart } from '@/store/useCart'
import ProductCard from '@/components/orinket/ProductCard'
import { useCurrency } from '@/context/CurrencyContext'
import { useTimedAdded } from '@/hooks/useTimedAdded'
import { fonts } from '@/lib/fonts'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  viewMode?: 'grid' | 'list'
}

function ProductGridListRow({
  product,
  idx,
  isInWishlist,
  onAddToCart,
  onWishlist,
  formatPrice,
}: {
  product: Product
  idx: number
  isInWishlist: boolean
  onAddToCart: (e: React.MouseEvent, product: Product) => void
  onWishlist: (e: React.MouseEvent, product: Product) => void
  formatPrice: (amountInStorage: number) => string
}) {
  const bagAdded = useTimedAdded()
  const categoryPathPart = product.categoryId || "uncategorized"
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0

  return (
    <Link
      href={`/category/${categoryPathPart}/${product.id}`}
      className="group relative animate-fadeIn block h-auto"
      style={{ animationDelay: `${idx * 50}ms` }}
    >
      <div className="flex h-auto flex-col overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-card to-cream/20 shadow-[0_6px_28px_-8px_rgba(28,25,23,0.1)] ring-1 ring-black/[0.04] transition-all duration-500 hover:-translate-y-1 hover:border-gold/20 hover:shadow-[0_22px_48px_-14px_rgba(28,25,23,0.14)] sm:h-40 sm:flex-row">
        <div className="relative aspect-[4/3] w-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-cream via-white to-stone-100 sm:h-40 sm:w-40 sm:aspect-auto">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 160px"
          />
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
            {product.isNew && (
              <span className={`rounded-full border border-border/60 bg-white/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground shadow-sm backdrop-blur-md ${fonts.labels}`}>
                New
              </span>
            )}
            {product.isBestseller && (
              <span className={`rounded-full bg-foreground px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-md ${fonts.labels}`}>
                Bestseller
              </span>
            )}
            {discount > 0 && (
              <span className={`rounded-full bg-rose-800 px-2 py-1 text-[10px] font-semibold text-white shadow-md ${fonts.labels}`}>
                {discount}% off
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
          <h3 className={`line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors duration-300 group-hover:text-gold-dark sm:line-clamp-1 ${fonts.headings}`}>
            {product.name}
          </h3>
          {product.rating && (
            <div className="flex items-center gap-1 py-1">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating!)
                        ? 'fill-gold text-gold'
                        : 'text-border'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-foreground/90">{product.rating}</span>
              <span className="text-xs text-muted-foreground">({product.reviews || 0})</span>
            </div>
          )}
          <div className="flex items-baseline gap-2 pt-1">
            <span className={`text-lg font-semibold tabular-nums text-foreground ${fonts.body}`}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className={`text-sm text-muted-foreground line-through ${fonts.body}`}>
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={(e) => {
                onAddToCart(e, product)
                bagAdded.pulse()
              }}
              disabled={bagAdded.added}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-sm py-2.5 px-3 ${fonts.buttons} text-xs font-semibold tracking-wide transition-all duration-300 ${
                bagAdded.added
                  ? "cursor-default border border-emerald-800 bg-emerald-700 text-white"
                  : "bg-foreground text-white hover:bg-gold-dark"
              }`}
            >
              {bagAdded.added ? (
                <>
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Added to cart
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Add to cart
                </>
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                onWishlist(e, product)
              }}
              className={`rounded-sm p-2.5 transition-all border ${
                isInWishlist
                  ? 'border-gold/40 bg-gold/10 text-gold-dark'
                  : 'border-border/60 bg-cream/50 text-foreground hover:border-gold/40'
              }`}
              aria-label="Add to wishlist"
            >
              <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function ProductGrid({ products, loading = false, viewMode = 'grid' }: ProductGridProps) {
  const { formatPrice } = useCurrency()
  const { addToCart, wishlistItems, addToWishlist, removeFromWishlist } = useCart()

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      stockLeft: product.stockLeft,
    }, 1)
  }

  const handleWishlist = (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    e.stopPropagation()
    
    const isInWishlist = wishlistItems.some(item => item.id === product.id)
    if (isInWishlist) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        category: product.category,
        stockLeft: product.stockLeft,
      })
    }
  }

  return (
    <div className="w-full">
      {products.length === 0 ? (
        <div className="text-center py-20">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No products found</h3>
            <p className="text-gray-600 mb-8 text-lg">We couldn&apos;t find any products matching your criteria.</p>
          </div>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-4 xl:grid-cols-4 2xl:grid-cols-5'
              : 'space-y-4 sm:space-y-5'
          }
        >
          {products.map((product, idx) => {
            const isInWishlist = wishlistItems.some(item => item.id === product.id)

            if (viewMode === 'grid') {
              return (
                <div
                  key={product.id}
                  className="animate-fadeIn h-full min-h-0 w-full max-w-[26rem] mx-auto sm:max-w-none"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <ProductCard product={product} compactMobile />
                </div>
              )
            }

            return (
              <ProductGridListRow
                key={product.id}
                product={product}
                idx={idx}
                isInWishlist={isInWishlist}
                onAddToCart={handleAddToCart}
                onWishlist={handleWishlist}
                formatPrice={formatPrice}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
