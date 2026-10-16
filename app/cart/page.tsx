"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  Minus,
  Plus,
  X,
  ShoppingBag,
  ArrowLeft,
  Truck,
  Shield,
  RotateCcw,
  Sparkles,
  Lock,
} from "lucide-react"
import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import { useCart } from "@/store/useCart"
import type { CartItem } from "@/types/cart"
import { validatePromoCode } from "@/lib/ecom/validatePromo"
import { useCurrency } from "@/context/CurrencyContext"
import { fonts } from "@/lib/fonts"
import { ecomFetch } from "@/lib/ecom/client"

function CartLineRow({ item }: { item: CartItem }) {
  const { formatPrice } = useCurrency()
  const { removeFromCart, updateQuantity } = useCart()

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#e6ddcc] bg-white/95 shadow-[0_12px_48px_rgba(51,34,13,0.07)] transition-all duration-300 hover:shadow-[0_20px_56px_rgba(51,34,13,0.1)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4aa67]/40 to-transparent" />
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:gap-6 sm:p-6 md:p-7">
        <Link
          href={`/product/${item.id}`}
          className="relative mx-auto aspect-square w-full max-w-[200px] shrink-0 overflow-hidden rounded-2xl border border-[#ece4d5] bg-[#faf6ee] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:mx-0 sm:h-36 sm:w-36 md:h-40 md:w-40"
        >
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 200px, 160px"
          />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Link href={`/product/${item.id}`}>
                <h3 className={`text-base font-semibold leading-snug text-foreground transition-colors hover:text-gold-dark sm:text-lg ${fonts.headings}`}>
                  {item.name}
                </h3>
              </Link>
              {item.variant && (
                <p className={`mt-1.5 text-xs tracking-wide text-muted-foreground sm:text-sm ${fonts.body}`}>
                  {item.variant}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeFromCart(item.id)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-transparent text-muted-foreground transition-colors hover:border-[#e6ddcc] hover:bg-[#faf6ee] hover:text-foreground touch-target"
              aria-label="Remove item"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-baseline gap-2">
            <span className={`text-lg font-semibold tracking-tight text-foreground sm:text-xl ${fonts.headings}`}>
              {formatPrice(item.price)}
            </span>
            {item.originalPrice && (
              <span className={`text-sm text-muted-foreground line-through ${fonts.body}`}>
                {formatPrice(item.originalPrice)}
              </span>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-4 border-t border-[#efe6d6] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center overflow-hidden rounded-xl border border-[#d6c6ac] bg-[#faf6ee] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
              <button
                type="button"
                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-[#f0e8d8] touch-target"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className={`min-w-[2.75rem] text-center text-sm font-semibold tabular-nums ${fonts.body}`}>
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-[#f0e8d8] touch-target"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="text-left sm:text-right">
              <p className={`text-[10px] uppercase tracking-[0.2em] text-muted-foreground ${fonts.labels}`}>
                Line total
              </p>
              <p className={`text-lg font-semibold text-foreground ${fonts.headings}`}>
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CartPage() {
  const { formatPrice } = useCurrency()
  const { cartItems, cartTotal, clearCart, addToCart } = useCart()

  const totalQty = cartItems.reduce((s, i) => s + i.quantity, 0)

  const [promoInput, setPromoInput] = useState("")
  const [promoBusy, setPromoBusy] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string
    discount: number
    description?: string
  } | null>(null)
  const [promoFeedback, setPromoFeedback] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)
  const [upsell, setUpsell] = useState<{
    threshold: number
    missingAmount: number
    products: Array<{ id: string; name: string; image: string; price: number }>
  } | null>(null)
  const [fbtProducts, setFbtProducts] = useState<
    Array<{ id: string; name: string; image?: string; price: number }>
  >([])

  const discountAmount = appliedPromo?.discount ?? 0
  const subtotalAfterDiscount = Math.max(0, cartTotal - discountAmount)
  const shipping = cartTotal >= 2999 ? 0 : 99
  const total = subtotalAfterDiscount + shipping

  const handleApplyPromo = async () => {
    const trimmed = promoInput.trim()
    if (!trimmed) {
      setAppliedPromo(null)
      setPromoFeedback({ type: "error", text: "Enter a promo code" })
      return
    }
    setPromoBusy(true)
    try {
      const result = await validatePromoCode(trimmed, cartTotal, totalQty)
      if (!result.ok) {
        setAppliedPromo(null)
        setPromoFeedback({ type: "error", text: result.message })
        return
      }
      setAppliedPromo({
        code: result.code,
        discount: result.discount,
        description: result.description,
      })
      setPromoInput(result.code)
      const label = result.description || result.code
      setPromoFeedback({
        type: "success",
        text: `${label} · Save ${formatPrice(result.discount)}`,
      })
    } finally {
      setPromoBusy(false)
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoInput("")
    setPromoFeedback(null)
  }

  const appliedPromoRef = useRef(appliedPromo)
  appliedPromoRef.current = appliedPromo

  useEffect(() => {
    const applied = appliedPromoRef.current
    if (!applied) return
    if (cartTotal <= 0) {
      setAppliedPromo(null)
      setPromoInput("")
      setPromoFeedback(null)
      return
    }
    let cancelled = false
    ;(async () => {
      const result = await validatePromoCode(applied.code, cartTotal, totalQty)
      if (cancelled) return
      if (!result.ok) {
        setAppliedPromo(null)
        setPromoInput("")
        setPromoFeedback({
          type: "error",
          text: `${result.message} Coupon removed.`,
        })
        return
      }
      if (
        result.discount !== applied.discount ||
        result.code !== applied.code ||
        result.description !== applied.description
      ) {
        setAppliedPromo({
          code: result.code,
          discount: result.discount,
          description: result.description,
        })
        const label = result.description || result.code
        setPromoFeedback({
          type: "success",
          text: `${label} · Save ${formatPrice(result.discount)}`,
        })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [cartTotal, totalQty, formatPrice])

  useEffect(() => {
    const loadUpsell = async () => {
      const response = await ecomFetch<{
        success: boolean
        data?: {
          threshold: number
          missingAmount: number
          products: Array<{ id: string; name: string; image: string; price: number }>
        }
      }>(`/api/ecom/recommendations/cart-upsell?cartTotal=${cartTotal}`)
      if (response?.success && response.data) {
        setUpsell(response.data)
      }
    }
    loadUpsell()
  }, [cartTotal])

  useEffect(() => {
    const mainProduct = cartItems[0]
    if (!mainProduct) {
      setFbtProducts([])
      return
    }
    const load = async () => {
      const response = await ecomFetch<{
        success: boolean
        data?: Array<{ id: string; name: string; image?: string; price: number }>
      }>(`/api/ecom/recommendations/frequently-bought-together?productId=${mainProduct.id}`)
      if (response?.success && Array.isArray(response.data)) {
        setFbtProducts(response.data.slice(0, 3))
      }
    }
    load()
  }, [cartItems])

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#fbf8f2] via-[#f8f4eb] to-[#f5f0e5]">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-20">
          <div className="relative w-full max-w-md text-center">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-b from-[#fff8ea]/80 to-transparent blur-2xl" />
            <div className="relative rounded-3xl border border-[#e6ddcc] bg-white/90 p-10 shadow-[0_24px_80px_rgba(51,34,13,0.1)] backdrop-blur-sm">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#e6ddcc] bg-gradient-to-br from-[#fff8ea] to-white shadow-inner">
                <ShoppingBag className="h-9 w-9 text-gold-dark" strokeWidth={1.25} />
              </div>
              <p className={`mb-2 text-[10px] uppercase tracking-[0.35em] text-gold-dark ${fonts.labels}`}>
                Your collection
              </p>
              <h1 className={`mb-3 text-2xl font-semibold tracking-wide text-foreground md:text-3xl ${fonts.headings}`}>
                Your bag is empty
              </h1>
              <p className={`mb-8 text-sm leading-relaxed text-muted-foreground ${fonts.body}`}>
                Curate pieces you will wear on repeat — start with demi-fine favourites crafted for everyday shine.
              </p>
              <Link
                href="/category/all"
                className={`inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-10 py-4 text-sm font-semibold tracking-[0.2em] text-white shadow-[0_12px_32px_rgba(25,12,6,0.25)] transition-all hover:bg-gold-dark touch-target ${fonts.buttons}`}
              >
                <ArrowLeft className="h-4 w-4" />
                SHOP COLLECTION
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#fbf8f2] via-[#f8f4eb] to-[#f5f0e5]">
      <Header />

      <div className="border-b border-[#e6ddcc] bg-gradient-to-b from-[#faf6ee] to-[#f8f2e8]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className={`group flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground ${fonts.navigation}`}
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Continue shopping
          </Link>
          <div className={`flex items-center gap-1.5 rounded-full border border-[#d6c6ac] bg-white/80 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-gold-dark shadow-sm ${fonts.labels}`}>
            <Lock className="h-3 w-3" />
            Secure checkout
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <div className="mb-8 sm:mb-10">
            <p className={`mb-2 text-[10px] uppercase tracking-[0.35em] text-gold-dark ${fonts.labels}`}>
              Shopping bag
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <h1 className={`text-3xl font-light tracking-[0.08em] text-foreground md:text-4xl ${fonts.headings}`}>
                Your selection
              </h1>
              <span className={`mb-1 inline-flex items-center rounded-full border border-[#dfd4bf] bg-white/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm ${fonts.labels}`}>
                {cartItems.length} {cartItems.length === 1 ? "piece" : "pieces"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 pb-16 lg:grid-cols-3 lg:gap-10 lg:pb-0">
            <div className="space-y-5 lg:col-span-2">
              {cartItems.map((item) => (
                <CartLineRow key={item.id} item={item} />
              ))}

              <button
                type="button"
                onClick={() => {
                  clearCart()
                  setAppliedPromo(null)
                  setPromoInput("")
                  setPromoFeedback(null)
                }}
                className={`text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline ${fonts.body}`}
              >
                Clear all items
              </button>
            </div>

            <div className="lg:col-span-1">
              <div className="overflow-hidden rounded-2xl border border-[#e6ddcc] bg-white shadow-[0_24px_65px_rgba(51,34,13,0.12)] lg:sticky lg:top-28 xl:top-32">
                <div className="flex items-center justify-between border-b border-[#ece4d5] bg-gradient-to-r from-[#fff7e9] via-[#fffdf7] to-transparent px-6 py-4">
                  <h2 className={`text-sm font-semibold tracking-wide ${fonts.headings}`}>
                    Order summary
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-dark">
                    <Sparkles className="h-3 w-3" />
                    Orinket
                  </span>
                </div>

                <div className="space-y-4 p-6">
                  <div>
                    <label className={`mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground ${fonts.labels}`}>
                      Promo code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value)
                          if (promoFeedback?.type === "error") setPromoFeedback(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleApplyPromo()
                          }
                        }}
                        placeholder="Enter code"
                        disabled={!!appliedPromo || promoBusy}
                        className={`min-w-0 flex-1 rounded-xl border border-[#dfd4bf] bg-[#faf6ee] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 disabled:opacity-60 ${fonts.body}`}
                      />
                      {appliedPromo ? (
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          className={`shrink-0 rounded-xl border border-[#dfd4bf] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-[#faf6ee] ${fonts.buttons}`}
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleApplyPromo()}
                          disabled={promoBusy}
                          className={`shrink-0 rounded-xl border border-gold bg-transparent px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gold-dark transition-colors hover:bg-gold hover:text-white disabled:opacity-50 ${fonts.buttons}`}
                        >
                          {promoBusy ? "…" : "Apply"}
                        </button>
                      )}
                    </div>
                    {promoFeedback && (
                      <p
                        className={`mt-2 text-[11px] leading-snug ${
                          promoFeedback.type === "success" ? "text-green-700" : "text-red-600"
                        } ${fonts.body}`}
                      >
                        {promoFeedback.text}
                      </p>
                    )}
                    {!appliedPromo && (
                      <p className={`mt-2 text-[10px] leading-relaxed text-muted-foreground ${fonts.body}`}>
                        Enter a code from your offer email, campaign, or spin wheel. Codes are checked live against
                        the store.
                      </p>
                    )}
                  </div>

                  <div className={`space-y-2.5 border-t border-[#efe6d6] pt-4 text-sm ${fonts.body}`}>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="text-foreground">{formatPrice(cartTotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span className="text-muted-foreground">
                          Discount{" "}
                          <span className="text-[10px] text-gold-dark">({appliedPromo?.code})</span>
                        </span>
                        <span>−{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span
                        className={
                          shipping === 0
                            ? "font-semibold text-green-700"
                            : "text-foreground"
                        }
                      >
                        {shipping === 0 ? "FREE" : formatPrice(shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-[#efe6d6] pt-3 text-base font-semibold text-foreground">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Inclusive of applicable taxes at checkout.
                    </p>
                  </div>

                  {shipping > 0 && (
                    <div className="rounded-xl border border-[#e6ddcc] bg-gradient-to-br from-[#fff8ea] to-[#faf6ee] px-4 py-3 text-center">
                      <p className={`text-xs leading-relaxed text-foreground/90 ${fonts.body}`}>
                        Add{" "}
                        <span className="font-semibold text-gold-dark">
                          {formatPrice(2999 - cartTotal)}
                        </span>{" "}
                        more for complimentary shipping
                      </p>
                    </div>
                  )}

                  {upsell && upsell.products.length > 0 && (
                    <div className="rounded-xl border border-[#e6ddcc] bg-white p-3">
                      <p className={`text-[10px] uppercase tracking-[0.2em] text-muted-foreground ${fonts.labels}`}>
                        Smart suggestions
                      </p>
                      <p className={`mt-1 text-xs text-foreground ${fonts.body}`}>
                        Add {formatPrice(upsell.missingAmount)} more to unlock free shipping
                      </p>
                      <div className="mt-3 space-y-2">
                        {upsell.products.slice(0, 3).map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() =>
                              addToCart({
                                id: p.id,
                                name: p.name,
                                price: p.price,
                                image: p.image || "/images/product-necklace-1.jpg",
                              })
                            }
                            className={`flex w-full items-center justify-between rounded-lg border border-[#efe6d6] px-2 py-2 text-left hover:bg-[#faf6ee] ${fonts.body}`}
                          >
                            <span className="line-clamp-1 text-xs">{p.name}</span>
                            <span className="ml-2 shrink-0 text-xs font-semibold">{formatPrice(p.price)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {fbtProducts.length > 0 && (
                    <div className="rounded-xl border border-[#e6ddcc] bg-white p-3">
                      <p className={`text-[10px] uppercase tracking-[0.2em] text-muted-foreground ${fonts.labels}`}>
                        Often bought together
                      </p>
                      <div className="mt-3 space-y-2">
                        {fbtProducts.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() =>
                              addToCart({
                                id: p.id,
                                name: p.name,
                                price: p.price,
                                image: p.image || "/images/product-necklace-1.jpg",
                              })
                            }
                            className={`flex w-full items-center justify-between rounded-lg border border-[#efe6d6] px-2 py-2 text-left hover:bg-[#faf6ee] ${fonts.body}`}
                          >
                            <span className="line-clamp-1 text-xs">{p.name}</span>
                            <span className="ml-2 shrink-0 text-xs font-semibold">{formatPrice(p.price)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link
                    href="/checkout"
                    className={`block w-full rounded-xl bg-foreground py-4 text-center text-sm font-semibold tracking-[0.18em] text-white shadow-[0_14px_36px_rgba(25,12,6,0.28)] transition-all ${fonts.buttons} hover:bg-gold-dark hover:shadow-[0_18px_40px_rgba(98,68,31,0.35)] touch-target`}
                  >
                    Proceed to checkout
                  </Link>

                  <Link
                    href="/category/all"
                    className={`block w-full rounded-xl border-2 border-[#3d2814]/20 py-3 text-center text-sm font-semibold tracking-[0.12em] text-foreground transition-colors ${fonts.buttons} hover:border-foreground hover:bg-[#faf6ee]`}
                  >
                    Browse more styles
                  </Link>

                  <div className="grid grid-cols-3 gap-2 border-t border-[#efe6d6] pt-5">
                    <div className="text-center">
                      <Truck className="mx-auto mb-1.5 h-4 w-4 text-gold" />
                      <p className={`text-[10px] leading-tight text-muted-foreground ${fonts.labels}`}>
                        Insured delivery
                      </p>
                    </div>
                    <div className="text-center">
                      <RotateCcw className="mx-auto mb-1.5 h-4 w-4 text-gold" />
                      <p className={`text-[10px] leading-tight text-muted-foreground ${fonts.labels}`}>
                        Easy returns
                      </p>
                    </div>
                    <div className="text-center">
                      <Shield className="mx-auto mb-1.5 h-4 w-4 text-gold" />
                      <p className={`text-[10px] leading-tight text-muted-foreground ${fonts.labels}`}>
                        Secure pay
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
