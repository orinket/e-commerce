"use client"

import Image from "next/image"
import Link from "next/link"
import { Check, GitCompare, Heart, Plus, Trash2, X } from "lucide-react"
import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import { useCart } from "@/store/useCart"
import { useCompare } from "@/context/CompareContext"
import { useAppSelector } from "@/store/hooks"
import { selectProducts } from "@/store/selectors"
import { useTimedAdded, useTimedHint } from "@/hooks/useTimedAdded"
import { useCurrency } from "@/context/CurrencyContext"
import { font } from "@/lib/fonts"

function CompareRemoveButton({ productId, name }: { productId: string; name: string }) {
  const { removeFromCompare } = useCompare()
  return (
    <button
      type="button"
      onClick={() => removeFromCompare(productId)}
      className="absolute right-2 top-2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-cream hover:text-foreground"
      aria-label={`Remove ${name}`}
    >
      <X className="h-4 w-4" />
    </button>
  )
}

function CompareWishlistAddButton({
  id,
  className,
  children,
}: {
  id: string
  className: string
  children: React.ReactNode
}) {
  const { addToCompare } = useCompare()
  const added = useTimedAdded()
  const hint = useTimedHint()
  return (
    <>
      <button
        type="button"
        onClick={() => {
          const ok = addToCompare(id)
          if (ok) added.pulse()
          else hint.show("Compare list full (max 4).")
        }}
        className={`${className} ${added.added ? "border-emerald-700 bg-emerald-600 text-white" : ""}`}
      >
        {added.added ? (
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            Added
          </span>
        ) : (
          children
        )}
      </button>
      {hint.hint && (
        <p className={`text-[10px] leading-tight text-amber-800 ${font("body")}`}>{hint.hint}</p>
      )}
    </>
  )
}

export default function ComparePage() {
  const { formatPrice } = useCurrency()
  const catalog = useAppSelector(selectProducts)
  const { wishlistItems } = useCart()
  const { compareIds, clearCompare, isInCompare } = useCompare()
  const products = compareIds
    .map((id) => catalog.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))

  const wishlistNotInCompare = wishlistItems.filter((w) => !isInCompare(w.id))
  const slotsLeft = Math.max(0, 4 - compareIds.length)
  const showWishlistPicker = wishlistNotInCompare.length > 0 && slotsLeft > 0

  const rows: { label: string; get: (p: (typeof products)[0]) => string }[] = [
    { label: "Price", get: (p) => formatPrice(p.price) },
    {
      label: "Original",
      get: (p) => (p.originalPrice ? formatPrice(p.originalPrice) : "—"),
    },
    { label: "Material", get: (p) => p.material ?? "—" },
    { label: "Plating", get: (p) => p.plating ?? "—" },
    { label: "Dimensions", get: (p) => p.dimensions ?? "—" },
    { label: "Weight", get: (p) => p.weight ?? "—" },
    { label: "Category", get: (p) => p.category.replace(/-/g, " ") },
    {
      label: "Rating",
      get: (p) => (p.rating != null ? `${p.rating} (${p.reviews ?? 0})` : "—"),
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-cream/60 to-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-[0.35em] text-gold-dark ${font('body')}">
                Shopping tools
              </p>
              <h1 className="text-2xl font-light ${font('headings')} text-foreground md:text-3xl">
                Compare products
              </h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground ${font('body')}">
                Up to 4 items. Add from your wishlist (recommended) or use Compare on any product page.
              </p>
            </div>
            {products.length > 0 && (
              <button
                type="button"
                onClick={() => clearCompare()}
                className="inline-flex items-center gap-2 self-start rounded-sm border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-foreground hover:text-foreground ${font('buttons')}"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear all
              </button>
            )}
          </div>

          {products.length === 0 ? (
            <div className="space-y-10">
              <div className="rounded-2xl border border-border/50 bg-card px-6 py-14 text-center shadow-sm">
                <GitCompare className="mx-auto mb-4 h-12 w-12 text-gold-dark/50" strokeWidth={1.25} />
                <p className="mb-2 text-lg font-medium text-foreground ${font('body')}">
                  No products in compare yet
                </p>
                <p className="mx-auto mb-8 max-w-md text-sm text-muted-foreground ${font('body')} leading-relaxed">
                  Save pieces to your wishlist, then tap <span className="font-semibold text-foreground">Add to compare</span> on each card — or pick from your wishlist below.
                </p>
                <Link
                  href="/wishlist"
                  className="inline-flex items-center gap-2 rounded-sm bg-foreground px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-gold-dark ${font('buttons')}"
                >
                  <Heart className="h-4 w-4" strokeWidth={2} />
                  Open wishlist
                </Link>
              </div>

              {showWishlistPicker && (
                <section className="rounded-2xl border border-gold/20 bg-gradient-to-b from-cream/50 to-card px-4 py-8 sm:px-8">
                  <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-[0.2em] text-gold-dark ${font('labels')}">
                    From your wishlist
                  </h2>
                  <p className="mb-6 text-center text-sm text-muted-foreground ${font('body')}">
                    Tap to add up to {slotsLeft} more {slotsLeft === 1 ? "item" : "items"} — no need to browse the catalogue.
                  </p>
                  <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {wishlistNotInCompare.map((w) => (
                      <div
                        key={w.id}
                        className="flex flex-col overflow-hidden rounded-xl border border-border/40 bg-background/80 shadow-sm"
                      >
                        <Link href={`/product/${w.id}`} className="relative aspect-square bg-cream">
                          <Image
                            src={w.image}
                            alt=""
                            fill
                            className="object-cover object-top"
                            sizes="(max-width: 640px) 50vw, 200px"
                          />
                        </Link>
                        <div className="flex flex-1 flex-col gap-2 p-3">
                          <p className="line-clamp-2 text-left text-xs font-medium text-foreground ${font('body')}">
                            {w.name}
                          </p>
                        <CompareWishlistAddButton
                          id={w.id}
                          className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-sm border border-foreground bg-foreground py-2 text-[10px] font-semibold uppercase tracking-wider text-white transition-colors hover:bg-gold-dark ${font('buttons')}"
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                          Add to compare
                        </CompareWishlistAddButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {wishlistItems.length === 0 && (
                <p className="text-center text-sm text-muted-foreground ${font('body')}">
                  Your wishlist is empty.{" "}
                  <Link href="/" className="font-medium text-gold-dark underline-offset-4 hover:underline">
                    Continue shopping
                  </Link>{" "}
                  and heart items you like — then compare them here.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border/50 bg-card shadow-[0_18px_40px_-24px_rgba(25,18,14,0.12)]">
              <table className="w-full min-w-[640px] border-collapse text-left ${font('body')} text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="sticky left-0 z-[1] min-w-[140px] bg-card px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      &nbsp;
                    </th>
                    {products.map((p) => (
                      <th key={p.id} className="relative min-w-[180px] px-4 py-4 align-bottom">
                        <CompareRemoveButton productId={p.id} name={p.name} />
                        <Link href={`/product/${p.id}`} className="group block">
                          <div className="relative mx-auto mb-3 aspect-square w-full max-w-[160px] overflow-hidden rounded-xl bg-cream">
                            <Image
                              src={p.image}
                              alt=""
                              fill
                              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                              sizes="160px"
                            />
                          </div>
                          <span className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-gold-dark">
                            {p.name}
                          </span>
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.label} className="border-b border-border/40">
                      <th className="sticky left-0 bg-cream/40 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {row.label}
                      </th>
                      {products.map((p) => (
                        <td key={p.id} className="px-4 py-3 text-foreground/90">
                          {row.get(p)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {products.length > 0 && showWishlistPicker && (
            <section className="mt-10 rounded-2xl border border-border/50 bg-cream/30 px-4 py-8 sm:px-8">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-gold-dark ${font('labels')}">
                Add more from your wishlist
              </h2>
              <p className="mb-6 text-sm text-muted-foreground ${font('body')}">
                {slotsLeft} slot{slotsLeft === 1 ? "" : "s"} left — add saved items without leaving this page.
              </p>
              <div className="flex flex-wrap gap-3">
                {wishlistNotInCompare.map((w) => (
                  <div
                    key={w.id}
                    className="flex max-w-[220px] flex-1 flex-col gap-2 rounded-xl border border-border/40 bg-card p-3 sm:flex-row sm:items-center"
                  >
                    <Link href={`/product/${w.id}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-cream">
                      <Image src={w.image} alt="" fill className="object-cover object-top" sizes="80px" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-xs font-medium text-foreground ${font('body')}">
                        {w.name}
                      </p>
                      <CompareWishlistAddButton
                        id={w.id}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-gold-dark underline-offset-4 hover:underline ${font('buttons')}"
                      >
                        <Plus className="h-3 w-3" />
                        Add
                      </CompareWishlistAddButton>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
