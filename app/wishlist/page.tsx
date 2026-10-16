"use client"

import Link from "next/link"
import { Check, Heart, ArrowLeft } from "lucide-react"
import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import ProductCard from "@/components/orinket/ProductCard"
import WishlistCard from "@/components/orinket/WishlistCard"
import { useCart } from "@/store/useCart"
import { useCompare } from "@/context/CompareContext"
import { useAppSelector } from "@/store/hooks"
import { selectProducts } from "@/store/selectors"
import { getProductById } from "@/lib/catalogQueries"
import { getStockDisplay } from "@/lib/wishlistDisplay"
import { useTimedAdded, useTimedHint } from "@/hooks/useTimedAdded"
import { fonts } from "@/lib/fonts"

export default function WishlistPage() {
  const catalog = useAppSelector(selectProducts)
  const { wishlistItems, removeFromWishlist, addToCart, moveWishlistToCart } = useCart()
  const { addToCompare, isInCompare, compareCount } = useCompare()
  const addAllAdded = useTimedAdded()
  const addAllHint = useTimedHint()

  const handleCompare = (productId: string): boolean => {
    if (isInCompare(productId)) return false
    return addToCompare(productId)
  }

  const handleAddToCart = (item: (typeof wishlistItems)[0]) => {
    const p = getProductById(catalog, item.id)
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      stockLeft: p?.stockLeft ?? item.stockLeft,
    })
  }

  const recommendedProducts = catalog
    .filter((p) => !wishlistItems.find((w) => w.id === p.id))
    .slice(0, 4)

  if (wishlistItems.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="px-4 py-16 text-center">
            <Heart className="text-muted-foreground mx-auto mb-6 h-16 w-16" />
            <h1 className="text-foreground mb-4 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
              Your wishlist is empty
            </h1>
            <p className="text-muted-foreground mb-8 ${fonts.body}">
              Save your favorite pieces to shop them later.
            </p>
            <Link
              href="/"
              className="bg-foreground text-background hover:bg-gold-dark inline-flex items-center gap-2 px-8 py-4 ${fonts.body} tracking-wider transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Explore collection
            </Link>
          </div>
        </main>

        {recommendedProducts.length > 0 && (
          <div className="mx-auto max-w-7xl px-4 py-12">
            <h2 className="text-foreground mb-8 text-center font-serif text-2xl font-semibold tracking-tight">
              You may like
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {recommendedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="relative overflow-hidden bg-gradient-to-b from-cream via-background to-cream-dark/40">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, color-mix(in oklab, var(--gold) 16%, transparent), transparent 55%)`,
            }}
          />
          <div className="relative mx-auto max-w-7xl px-4 py-10 md:py-12">
            <div className="mb-10 flex flex-col gap-6 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-dark/80 ${fonts.body}">
                  Saved for later
                </p>
                <h1 className="font-serif text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
                  My wishlist
                  <span className="text-muted-foreground ml-2 ${fonts.body} text-lg font-normal tabular-nums md:text-xl">
                    ({wishlistItems.length})
                  </span>
                </h1>
                <Link
                  href="/category/all"
                  className="text-stone-600 underline-offset-4 transition-colors hover:text-gold-dark hover:underline ${fonts.body} text-sm"
                >
                  Continue shopping
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/compare"
                  className={`inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${fonts.body} ${
                    compareCount > 0
                      ? "border-stone-900 bg-stone-900 text-white shadow-md hover:bg-gold-dark"
                      : "border-border/60 bg-white/95 text-stone-700 shadow-sm hover:border-gold/40 hover:text-stone-900"
                  }`}
                >
                  Compare
                  {compareCount > 0 ? ` (${compareCount})` : ""}
                </Link>
                <p className="max-w-[220px] text-xs leading-relaxed text-stone-600 ${fonts.body}">
                  Add items below to compare, then open Compare.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {wishlistItems.map((item, index) => (
                <WishlistCard
                  key={item.id}
                  item={item}
                  product={getProductById(catalog, item.id)}
                  index={index}
                  onRemove={removeFromWishlist}
                  onAddToCart={handleAddToCart}
                  onMoveToCart={moveWishlistToCart}
                  onCompare={handleCompare}
                  inCompare={isInCompare(item.id)}
                />
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center gap-2 border-t border-stone-200/80 pt-10">
              <button
                type="button"
                disabled={addAllAdded.added}
                onClick={() => {
                  const eligible = wishlistItems.filter((item) => {
                    const p = getProductById(catalog, item.id)
                    return !getStockDisplay(p).disabled
                  })
                  if (eligible.length === 0) {
                    addAllHint.show("No in-stock items to add.")
                    return
                  }
                  eligible.forEach((item) => {
                    const p = getProductById(catalog, item.id)
                    addToCart(
                      {
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        originalPrice: item.originalPrice,
                        image: item.image,
                        stockLeft: p?.stockLeft ?? item.stockLeft,
                      },
                      1,
                      { silent: true }
                    )
                  })
                  addAllAdded.pulse()
                }}
                className={`inline-flex min-w-[min(100%,280px)] items-center justify-center gap-2 rounded-xl px-10 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-lg transition-all hover:shadow-xl hover:brightness-[1.03] ${fonts.body} ${
                  addAllAdded.added ? "cursor-default bg-emerald-700" : "bg-gradient-to-r from-gold to-gold-dark"
                }`}
              >
                {addAllAdded.added ? (
                  <>
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                    Added to bag
                  </>
                ) : (
                  "Add all to bag"
                )}
              </button>
              {addAllHint.hint && (
                <p className="max-w-md text-center text-xs text-amber-800 ${fonts.body}">{addAllHint.hint}</p>
              )}
              <p className="max-w-md text-center text-xs text-stone-500 ${fonts.body}">
                In-stock items only. Out-of-stock pieces are skipped. Items stay on your wishlist unless you use{" "}
                <span className="font-medium text-stone-700">Move to bag</span> on a card.
              </p>
            </div>
          </div>
        </div>

        {recommendedProducts.length > 0 && (
          <div className="mx-auto max-w-7xl border-t border-border px-4 py-14">
            <h2 className="text-foreground mb-10 text-center font-serif text-2xl font-semibold tracking-tight md:text-3xl">
              You may also like
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {recommendedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
