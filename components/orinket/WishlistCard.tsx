"use client"

import Image from "next/image"
import Link from "next/link"
import { Check, GitCompare, ShoppingBag, X } from "lucide-react"
import type { WishlistItem } from "@/types/cart"
import type { Product } from "@/types/product"
import { formatAddedAgo, getStockDisplay } from "@/lib/wishlistDisplay"
import { useTimedAdded, useTimedHint } from "@/hooks/useTimedAdded"
import { useCurrency } from "@/context/CurrencyContext"
import { font } from "@/lib/fonts"

interface WishlistCardProps {
  item: WishlistItem
  product?: Product
  index: number
  onRemove: (id: string) => void
  onAddToCart: (item: WishlistItem) => void
  onMoveToCart: (id: string) => void
  /** Return true if compare add succeeded (false if list full). */
  onCompare: (id: string) => boolean
  inCompare: boolean
}

export default function WishlistCard({
  item,
  product,
  index,
  onRemove,
  onAddToCart,
  onMoveToCart,
  onCompare,
  inCompare,
}: WishlistCardProps) {
  const { formatPrice } = useCurrency()
  const stock = getStockDisplay(product)
  const addedLabel = formatAddedAgo(item.addedAt)
  const bagAdded = useTimedAdded()
  const moveAdded = useTimedAdded()
  const compareAdded = useTimedAdded()
  const compareHint = useTimedHint()

  const discount =
    item.originalPrice && item.originalPrice > item.price
      ? Math.round((1 - item.price / item.originalPrice) * 100)
      : 0

  const categoryLabel = (item.category || "collection").replace(/-/g, " ")

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (stock.disabled) return
    onAddToCart(item)
    bagAdded.pulse()
  }

  const handleMoveToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (stock.disabled) return
    onMoveToCart(item.id)
    moveAdded.pulse()
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onRemove(item.id)
  }

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const ok = onCompare(item.id)
    if (ok) compareAdded.pulse()
    else compareHint.show("You can compare up to 4 products.")
  }

  return (
    <article
      className="group/wish animate-slideUp flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-card via-card to-cream/30 shadow-[0_2px_24px_-8px_rgba(25,18,14,0.1)] ring-1 ring-black/[0.04] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_28px_56px_-16px_rgba(25,18,14,0.18)] hover:ring-gold/15"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-cream-dark/80 via-cream to-cream-dark/60">
        <Link href={`/product/${item.id}`} className="absolute inset-0 z-0" aria-label={`View ${item.name}`}>
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover object-top transition-transform duration-[650ms] ease-out group-hover/wish:scale-[1.06]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/[0.08] via-transparent to-white/[0.1] opacity-0 transition-opacity duration-500 group-hover/wish:opacity-100"
          aria-hidden
        />

        {/* Badges */}
        <div className="pointer-events-none absolute left-3 top-3 z-10 flex max-w-[calc(100%-5.5rem)] flex-col gap-1.5">
          {product?.isNew && (
            <span className="inline-flex w-fit items-center border border-border/60 bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground shadow-sm backdrop-blur-sm ${font('body')}">
              New
            </span>
          )}
          {product?.isBestseller && (
            <span className="inline-flex w-fit items-center bg-foreground px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-md ${font('body')}">
              Bestseller
            </span>
          )}
          {discount > 0 && (
            <span className="inline-flex w-fit items-center bg-gradient-to-r from-rose-800 to-rose-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white shadow-md ${font('body')}">
              {discount}% off
            </span>
          )}
        </div>

        {/* Remove */}
        <button
          type="button"
          onClick={handleRemove}
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/95 text-foreground shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          aria-label="Remove from wishlist"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>

        {/* Add to bag — hover bar (keeps item on wishlist) */}
        <div
          className={`absolute bottom-0 left-0 right-0 z-20 translate-y-full transition-transform duration-300 ease-out group-hover/wish:translate-y-0 ${stock.disabled ? "pointer-events-none opacity-0" : ""}`}
        >
          <button
            type="button"
            disabled={stock.disabled || bagAdded.added}
            onClick={handleAddToCart}
            className={`flex w-full items-center justify-center gap-2 border-t border-white/10 py-3.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:from-gold-dark hover:to-stone-900 disabled:cursor-not-allowed disabled:opacity-50 ${font('buttons')} ${
              bagAdded.added
                ? "cursor-default border-emerald-800 bg-emerald-700"
                : "bg-gradient-to-r from-stone-900 to-stone-800"
            }`}
          >
            {bagAdded.added ? (
              <>
                <Check className="h-4 w-4" strokeWidth={2.5} />
                Added to cart
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" strokeWidth={2} />
                Add to bag
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 border-t border-border/40 bg-gradient-to-b from-white/90 to-cream/20 px-4 pb-4 pt-3.5 sm:px-5 sm:pb-5 sm:pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] ${font('body')} uppercase tracking-[0.28em] text-gold-dark/90">
            {categoryLabel}
          </p>
          <span
            className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${font('body')} ${
              stock.tone === "out"
                ? "text-red-700/90"
                : stock.tone === "low"
                  ? "text-amber-800"
                  : "text-emerald-800/90"
            }`}
          >
            {stock.label}
          </span>
        </div>

        {addedLabel && (
          <p className="text-[11px] text-muted-foreground ${font('body')}">{addedLabel}</p>
        )}

        <Link
          href={`/product/${item.id}`}
          className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug tracking-tight text-foreground transition-colors hover:text-gold-dark sm:text-[15px] ${font('body')}"
        >
          {item.name}
        </Link>

        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-border/30 pt-3">
          <span className="text-base font-semibold tabular-nums tracking-tight text-foreground sm:text-lg ${font('body')}">
            {formatPrice(item.price)}
          </span>
          {item.originalPrice != null && item.originalPrice > item.price && (
            <>
              <span className="text-sm text-muted-foreground line-through tabular-nums ${font('body')}">
                {formatPrice(item.originalPrice)}
              </span>
              {discount > 0 && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 ${font('body')}">
                  Save {discount}%
                </span>
              )}
            </>
          )}
        </div>

        <button
          type="button"
          disabled={stock.disabled || moveAdded.added}
          onClick={handleMoveToCart}
          className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${font('buttons')} ${
            moveAdded.added
              ? "border-emerald-500/60 bg-emerald-50 text-emerald-900"
              : "border-gold/50 bg-gradient-to-r from-gold/15 to-cream/40 text-stone-900 hover:border-gold hover:from-gold/25"
          }`}
        >
          {moveAdded.added ? (
            <>
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              Moved to bag
            </>
          ) : (
            <>
              <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2} />
              Move to bag
            </>
          )}
        </button>

        {inCompare ? (
          <Link
            href="/compare"
            onClick={(e) => e.stopPropagation()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gold/40 bg-cream/60 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-gold/15 ${font('buttons')}"
          >
            <GitCompare className="h-3.5 w-3.5" strokeWidth={2} />
            In compare
          </Link>
        ) : (
          <div className="flex w-full flex-col gap-1.5">
            <button
              type="button"
              onClick={handleCompare}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] shadow-sm transition-colors ${font('buttons')} ${
                compareAdded.added
                  ? "border-emerald-800 bg-emerald-700 text-white"
                  : "border-border/60 bg-white/80 text-foreground hover:border-gold/45 hover:bg-cream/50 hover:text-gold-dark"
              }`}
            >
              {compareAdded.added ? (
                <>
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Added
                </>
              ) : (
                <>
                  <GitCompare className="h-3.5 w-3.5" strokeWidth={2} />
                  Add to compare
                </>
              )}
            </button>
            {compareHint.hint && (
              <p className="text-center text-[10px] text-amber-800 ${font('body')}">{compareHint.hint}</p>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
