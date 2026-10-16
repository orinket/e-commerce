"use client"

import { useState, Suspense, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, Lock, Truck, Shield, RotateCcw, Sparkles } from "lucide-react"
import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import { useCart } from "@/store/useCart"
import { useAppSelector } from "@/store/hooks"
import { getProductById } from "@/lib/catalogQueries"
import { validatePromoCode } from "@/lib/ecom/validatePromo"
import { useCurrency } from "@/context/CurrencyContext"
import { font } from "@/lib/fonts"
import { ecomFetch } from "@/lib/ecom/client"

type CheckoutStep = "shipping" | "payment" | "confirm"

function CheckoutContent() {
  const { formatPrice } = useCurrency()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { cartItems, cartTotal, clearCart } = useCart()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping")
  const [selectedPayment, setSelectedPayment] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  })

  // Check for direct buy now
  const productId = searchParams.get("product")
  const quantity = parseInt(searchParams.get("quantity") || "1")
  const directProduct = useAppSelector((state) =>
    productId ? getProductById(state.catalog.products, productId) : null
  )

  const items = directProduct 
    ? [{ ...directProduct, quantity }] 
    : cartItems

  const subtotal = directProduct 
    ? directProduct.price * quantity 
    : cartTotal

  const totalQty = items.reduce((s, i) => s + i.quantity, 0)
  /** Stable id for recommendation fetches — do not depend on `items` array (new reference every render for buy-now). */
  const checkoutRecommendationProductId = directProduct?.id ?? cartItems[0]?.id ?? null

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
  const [checkoutSuggestions, setCheckoutSuggestions] = useState<
    Array<{ id: string; name: string; image?: string; price: number }>
  >([])

  const discountAmount = appliedPromo?.discount ?? 0
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount)
  const shipping = 0
  const tax = Math.round(subtotalAfterDiscount * 0.18)
  const total = subtotalAfterDiscount + shipping + tax

  useEffect(() => {
    if (!checkoutRecommendationProductId) {
      setCheckoutSuggestions([])
      return
    }
    const baseId = checkoutRecommendationProductId
    let cancelled = false
    const load = async () => {
      const [similar, complete] = await Promise.all([
        ecomFetch<{ success: boolean; data?: Array<{ id: string; name: string; image?: string; price: number }> }>(
          `/api/ecom/recommendations/similar-products?productId=${baseId}`
        ),
        ecomFetch<{ success: boolean; data?: Array<{ id: string; name: string; image?: string; price: number }> }>(
          `/api/ecom/recommendations/complete-the-look?productId=${baseId}`
        ),
      ])
      if (cancelled) return
      const merged = [...(similar.data || []), ...(complete.data || [])]
      const uniq = new Map<string, { id: string; name: string; image?: string; price: number }>()
      for (const p of merged) {
        if (!uniq.has(p.id)) uniq.set(p.id, p)
      }
      setCheckoutSuggestions([...uniq.values()].slice(0, 4))
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [checkoutRecommendationProductId])

  const handleApplyPromo = async () => {
    const trimmed = promoInput.trim()
    if (!trimmed) {
      setAppliedPromo(null)
      setPromoFeedback({ type: "error", text: "Enter a promo code" })
      return
    }
    setPromoBusy(true)
    try {
      const result = await validatePromoCode(trimmed, subtotal, totalQty)
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
        text: `${label} · You save ${formatPrice(result.discount)}`,
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

  // Recompute discount when subtotal or cart quantity changes
  useEffect(() => {
    const applied = appliedPromoRef.current
    if (!applied) return
    let cancelled = false
    ;(async () => {
      const result = await validatePromoCode(applied.code, subtotal, totalQty)
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
          text: `${label} · You save ${formatPrice(result.discount)}`,
        })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [subtotal, totalQty, formatPrice])

  const inputClassName =
    `w-full rounded-xl border border-[#d8d0be] bg-[#f9f5ec] px-4 py-3 text-sm text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-all focus:outline-none focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20 ${font('body')}`

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePlaceOrder = async () => {
    try {
      setIsProcessing(true)
      for (const item of items) {
        await ecomFetch<{ success: boolean }>("/api/ecom/cart/add", {
          method: "POST",
          body: JSON.stringify({ productId: item.id, quantity: item.quantity }),
        })
      }

      await ecomFetch<{ success: boolean }>("/api/ecom/payments/create-order", {
        method: "POST",
        body: JSON.stringify({ amount: total, currency: "INR" }),
      })

      const orderResponse = await ecomFetch<{
        success: boolean
        data?: { _id: string }
      }>("/api/ecom/orders", {
        method: "POST",
        body: JSON.stringify({
          paymentMethod: selectedPayment,
          ...(appliedPromo?.code ? { promoCode: appliedPromo.code } : {}),
          items: items.map((item) => ({
            productId: item.id,
            name: item.name,
            image: item.image,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingAddress: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            line1: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
        }),
      })

      if (!directProduct) {
        clearCart({ silent: true })
      }
      const orderId = orderResponse?.data?._id
      if (orderId) {
        await ecomFetch<{ success: boolean }>("/api/ecom/payments/verify", {
          method: "POST",
          body: JSON.stringify({
            orderId,
            status: "success",
            paymentReference: `SIMULATED_${selectedPayment}_${Date.now()}`,
          }),
        })
      }
      router.push(orderId ? `/order-success?orderId=${orderId}` : "/order-success")
    } finally {
      setIsProcessing(false)
    }
  }

  const stepsConfig = [
    { key: "shipping", label: "Shipping", number: 1 },
    { key: "payment", label: "Payment", number: 2 },
    { key: "confirm", label: "Confirm", number: 3 },
  ]

  const paymentMethodInfo: Record<string, { label: string; description: string }> = {
    card: { label: "Credit/Debit Card", description: "Secure payment via major banks" },
    netbanking: { label: "Net Banking", description: "Pay directly using your bank account" },
    upi: { label: "UPI", description: "Instant payment using any UPI app" },
    wallet: { label: "Wallets", description: "Use Paytm, Amazon Pay, or Mobikwik wallet balance" },
    emi: { label: "Pay Later / EMI", description: "Split your payment into easy installments" },
    cod: { label: "Cash on Delivery", description: "Pay with cash when your order is delivered" },
  }

  const getStepStatus = (step: CheckoutStep) => {
    const order = { shipping: 0, payment: 1, confirm: 2 }
    const current = order[currentStep]
    const target = order[step]
    if (target < current) return "done"
    if (target === current) return "active"
    return "pending"
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4 py-16">
            <h1 className={`text-2xl font-semibold text-foreground mb-4 ${font('headings')}`}>
              No items to checkout
            </h1>
            <Link
              href="/"
              className={`inline-flex items-center gap-2 px-8 py-4 bg-foreground text-white tracking-wider hover:bg-gold-dark transition-colors ${font('buttons')}`}
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#fbf8f2] via-[#f8f4eb] to-[#f5f0e5]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-[#3d2814] bg-[radial-gradient(circle_at_center,rgba(152,100,37,0.18),transparent_52%),linear-gradient(90deg,#1a0d08_0%,#27150f_50%,#1a0d08_100%)] text-white shadow-[0_14px_36px_rgba(20,10,5,0.45)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#d4aa67] to-transparent" />
        <div className="max-w-7xl mx-auto flex min-w-0 items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4">
          <Link href="/cart" className="group flex min-w-0 max-w-[38%] shrink items-center gap-1.5 text-gold-light/90 transition-colors hover:text-[#f6d591] sm:max-w-none sm:gap-2">
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <span className={`truncate text-[10px] uppercase tracking-[0.12em] sm:text-xs sm:tracking-[0.18em] ${font('navigation')}`}>
              BACK TO CART
            </span>
          </Link>
          <div className="flex min-w-0 flex-col items-center px-1 text-center">
            <h1 className={`text-base tracking-[0.22em] text-[#f9ecd4] sm:text-xl sm:tracking-[0.28em] md:text-2xl ${font('headings')}`}>
              ORINKET
            </h1>
            <div className="mt-1 h-px w-16 bg-gradient-to-r from-transparent via-[#cda05d] to-transparent sm:w-24" />
            <span className={`mt-1 hidden text-[10px] uppercase tracking-[0.35em] text-gold-light/70 sm:block ${font('labels')}`}>
              Secure Checkout
            </span>
          </div>
          <div className={`flex max-w-[38%] shrink-0 items-center justify-end gap-1 rounded-lg border border-[#7a5a38] bg-[#2c1b12]/85 px-2 py-1.5 text-[10px] tracking-[0.08em] text-gold-light shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:max-w-none sm:gap-1.5 sm:px-3 sm:text-[11px] ${font('labels')}`}>
            <Lock className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
            <span className="leading-none">SECURE</span>
          </div>
        </div>
      </nav>

      {/* Steps Bar */}
      <div className="border-b border-[#e6ddcc] bg-gradient-to-b from-[#faf6ee] via-[#f7f2e7] to-[#f9f5ec]">
        <div className="mx-auto max-w-7xl px-2 py-3 sm:px-4 sm:py-4">
          <div className="flex justify-center overflow-x-auto [-webkit-overflow-scrolling:touch] pb-1 sm:overflow-visible sm:pb-0">
            <div className="inline-flex min-w-max items-center gap-1.5 rounded-2xl border border-[#d6c6ac] bg-white/85 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_24px_rgba(70,45,18,0.08)] sm:min-w-0 sm:flex-wrap sm:justify-center sm:gap-2 sm:px-4 sm:py-2.5">
              {stepsConfig.map((step, idx) => {
                const status = getStepStatus(step.key as CheckoutStep)
                return (
                  <div key={step.key} className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(step.key as CheckoutStep)}
                      className={`flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-[10px] font-semibold tracking-[0.12em] transition-all sm:gap-2 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.18em] ${font('buttons')} ${
                        status === "active"
                          ? "bg-[#f8efdd] text-foreground shadow-[0_6px_14px_rgba(98,68,31,0.14)]"
                          : status === "done"
                            ? "bg-[#fff8ea] text-gold-dark"
                            : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                          status === "done"
                            ? "border-gold bg-gold text-white shadow-[0_4px_10px_rgba(201,154,74,0.45)]"
                            : status === "active"
                              ? "border-foreground bg-foreground text-white shadow-[0_5px_12px_rgba(25,12,6,0.35)]"
                              : "border-[#d0c2ad] bg-white text-muted-foreground"
                        }`}
                      >
                        {status === "done" ? "✓" : step.number}
                      </span>
                      <span className="whitespace-nowrap">{step.label.toUpperCase()}</span>
                    </button>
                    {idx < stepsConfig.length - 1 && (
                      <span className="hidden h-px w-5 bg-gradient-to-r from-[#d8c6a8] via-[#cdb18b] to-[#d8c6a8] sm:inline-block sm:w-7" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-6 sm:px-4 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Step */}
            {currentStep === "shipping" && (
              <div className="overflow-hidden rounded-2xl border border-[#e6ddcc] bg-white shadow-[0_20px_60px_rgba(51,34,13,0.08)] animate-slideUp">
                <div className="flex items-center gap-3 border-b border-[#ebe3d4] bg-gradient-to-r from-[#fff8ea] via-[#fffdf8] to-transparent px-4 py-4 sm:px-6">
                  <div className="w-8 h-8 rounded-full bg-cream border border-[#dfd4bf] flex items-center justify-center text-sm">
                    📍
                  </div>
                  <h2 className={`text-lg font-semibold ${font('headings')}`}>
                    Shipping Address
                  </h2>
                </div>

                <div className="space-y-4 p-4 sm:p-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={`block text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2 ${font('labels')}`}>
                        First Name <span className="text-gold">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                        className={inputClassName}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2 ${font('labels')}`}>
                        Last Name <span className="text-gold">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                        className={inputClassName}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2 ${font('labels')}`}>
                      Email <span className="text-gold">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2 ${font('labels')}`}>
                      Phone <span className="text-gold">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2 ${font('labels')}`}>
                      Address <span className="text-gold">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter street address"
                      className={inputClassName}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={`block text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2 ${font('labels')}`}>
                        City <span className="text-gold">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Enter city"
                        className={inputClassName}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2 ${font('labels')}`}>
                        State <span className="text-gold">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Enter state"
                        className={inputClassName}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2 ${font('labels')}`}>
                      Pincode <span className="text-gold">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="Enter pincode"
                      className={inputClassName}
                    />
                  </div>
                </div>

                <div className="border-t border-[#e9e0cf] bg-gradient-to-r from-[#fbf5e7] to-[#fffdfa] px-4 py-5 sm:px-6">
                  <button
                    type="button"
                    onClick={() => setCurrentStep("payment")}
                    className={`w-full rounded-xl bg-foreground px-6 py-3.5 text-sm font-semibold tracking-wider text-white shadow-[0_10px_25px_rgba(32,20,8,0.25)] transition-all hover:bg-foreground/90 ${font('buttons')}`}
                  >
                    CONTINUE TO PAYMENT
                  </button>
                </div>
              </div>
            )}

            {/* Payment Step */}
            {currentStep === "payment" && (
              <div className="space-y-4 animate-slideUp">
                {/* Credit/Debit Card */}
                <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                  <button
                    onClick={() => {
                      setSelectedPayment("card")
                    }}
                    className="w-full px-6 py-4 bg-gradient-to-r from-gold/5 to-transparent border-b border-border flex items-center gap-3 hover:bg-cream transition-all cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={selectedPayment === "card"}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="accent-gold"
                    />
                    <span className="text-lg">💳</span>
                    <div className="flex-1 text-left">
                      <p className={`font-semibold ${font('body')}`}>Credit/Debit Card</p>
                      <p className={`text-xs text-muted-foreground ${font('body')}`}>Visa, Mastercard, RuPay</p>
                    </div>
                  </button>
                  {selectedPayment === "card" && (
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2 ${font('labels')}">
                          Card Number
                        </label>
                        <input
                          type="text"
                          placeholder="Enter card number"
                          maxLength={19}
                          className={`w-full border border-border bg-cream rounded px-3 py-2 text-sm ${font('body')} focus:outline-none focus:border-gold focus:bg-white transition-all`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2 ${font('labels')}">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          placeholder="Enter name on card"
                          className={`w-full border border-border bg-cream rounded px-3 py-2 text-sm ${font('body')} focus:outline-none focus:border-gold focus:bg-white transition-all`}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2 ${font('labels')}">
                            Expiry (MM/YY)
                          </label>
                          <input
                            type="text"
                            placeholder="Enter expiry (MM/YY)"
                            maxLength={5}
                            className={`w-full border border-border bg-cream rounded px-3 py-2 text-sm ${font('body')} focus:outline-none focus:border-gold focus:bg-white transition-all`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2 ${font('labels')}">
                            CVV
                          </label>
                          <input
                            type="text"
                            placeholder="Enter CVV"
                            maxLength={3}
                            className={`w-full border border-border bg-cream rounded px-3 py-2 text-sm ${font('body')} focus:outline-none focus:border-gold focus:bg-white transition-all`}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Net Banking */}
                <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                  <button
                    onClick={() => {
                      setSelectedPayment("netbanking")
                    }}
                    className="w-full px-6 py-4 bg-gradient-to-r from-gold/5 to-transparent border-b border-border flex items-center gap-3 hover:bg-cream transition-all cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="netbanking"
                      checked={selectedPayment === "netbanking"}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="accent-gold"
                    />
                    <span className="text-lg">🏦</span>
                    <div className="flex-1 text-left">
                      <p className={`font-semibold ${font('body')}`}>Net Banking</p>
                      <p className={`text-xs text-muted-foreground ${font('body')}`}>All major banks</p>
                    </div>
                  </button>
                  {selectedPayment === "netbanking" && (
                    <div className="p-6">
                      <p className={`text-sm text-muted-foreground mb-4 ${font('body')}`}>Select your bank</p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {["HDFC", "ICICI", "AXIS", "SBI", "KOTAK", "YES", "IDBI", "BOB"].map((bank) => (
                          <button key={bank} className={`p-3 border border-border rounded hover:border-gold hover:bg-cream transition-all text-sm font-semibold text-center ${font('buttons')}`}>
                            {bank}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* UPI */}
                <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                  <button
                    onClick={() => {
                      setSelectedPayment("upi")
                    }}
                    className="w-full px-6 py-4 bg-gradient-to-r from-gold/5 to-transparent border-b border-border flex items-center gap-3 hover:bg-cream transition-all cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="upi"
                      checked={selectedPayment === "upi"}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="accent-gold"
                    />
                    <span className="text-lg">📱</span>
                    <div className="flex-1 text-left">
                      <p className={`font-semibold ${font('body')}`}>UPI</p>
                      <p className={`text-xs text-muted-foreground ${font('body')}`}>Google Pay, PhonePe, Paytm</p>
                    </div>
                  </button>
                  {selectedPayment === "upi" && (
                    <div className="p-6">
                      <label className="block text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2 ${font('labels')}">
                        UPI ID
                      </label>
                      <input
                        type="text"
                        placeholder="Enter UPI ID"
                        className={`w-full border border-border bg-cream rounded px-3 py-2 text-sm ${font('body')} focus:outline-none focus:border-gold focus:bg-white transition-all`}
                      />
                    </div>
                  )}
                </div>

                {/* Wallets */}
                <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                  <button
                    onClick={() => {
                      setSelectedPayment("wallet")
                    }}
                    className="w-full px-6 py-4 bg-gradient-to-r from-gold/5 to-transparent border-b border-border flex items-center gap-3 hover:bg-cream transition-all cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="wallet"
                      checked={selectedPayment === "wallet"}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="accent-gold"
                    />
                    <span className="text-lg">👛</span>
                    <div className="flex-1 text-left">
                      <p className={`font-semibold ${font('body')}`}>Wallets</p>
                      <p className={`text-xs text-muted-foreground ${font('body')}`}>Paytm, Amazon Pay, Mobikwik</p>
                    </div>
                  </button>
                  {selectedPayment === "wallet" && (
                    <div className="p-6">
                      <p className={`text-sm text-muted-foreground mb-4 ${font('body')}`}>Choose wallet</p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {["Paytm", "Amazon Pay", "Mobikwik"].map((wallet) => (
                          <button key={wallet} className={`p-3 border border-border rounded hover:border-gold hover:bg-cream transition-all text-sm font-semibold text-center ${font('buttons')}`}>
                            {wallet}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Pay Later / EMI */}
                <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                  <button
                    onClick={() => {
                      setSelectedPayment("emi")
                    }}
                    className="w-full px-6 py-4 bg-gradient-to-r from-gold/5 to-transparent border-b border-border flex items-center gap-3 hover:bg-cream transition-all cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="emi"
                      checked={selectedPayment === "emi"}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="accent-gold"
                    />
                    <span className="text-lg">🧾</span>
                    <div className="flex-1 text-left">
                      <p className={`font-semibold ${font('body')}`}>Pay Later / EMI</p>
                      <p className={`text-xs text-muted-foreground ${font('body')}`}>3, 6, 9 months options</p>
                    </div>
                  </button>
                  {selectedPayment === "emi" && (
                    <div className="p-6">
                      <p className={`text-sm text-muted-foreground mb-4 ${font('body')}`}>Select installment plan</p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {["3 Months", "6 Months", "9 Months"].map((plan) => (
                          <button key={plan} className={`p-3 border border-border rounded hover:border-gold hover:bg-cream transition-all text-sm font-semibold text-center ${font('buttons')}`}>
                            {plan}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Cash On Delivery */}
                <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                  <button
                    onClick={() => {
                      setSelectedPayment("cod")
                    }}
                    className="w-full px-6 py-4 bg-gradient-to-r from-gold/5 to-transparent border-b border-border flex items-center gap-3 hover:bg-cream transition-all cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={selectedPayment === "cod"}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="accent-gold"
                    />
                    <span className="text-lg">💵</span>
                    <div className="flex-1 text-left">
                      <p className={`font-semibold ${font('body')}`}>Cash on Delivery</p>
                      <p className={`text-xs text-muted-foreground ${font('body')}`}>Pay at doorstep</p>
                    </div>
                  </button>
                  {selectedPayment === "cod" && (
                    <div className="p-6">
                      <p className={`text-sm text-muted-foreground ${font('body')}`}>
                        Cash on Delivery available for eligible pincodes. A nominal handling fee may apply.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setCurrentStep("shipping")}
                    className={`flex-1 rounded border border-border py-3 text-sm font-semibold tracking-wider text-foreground transition-all hover:bg-cream ${font('buttons')}`}
                  >
                    BACK
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep("confirm")}
                    className={`flex-1 rounded bg-foreground py-3 text-sm font-semibold tracking-wider text-white transition-all hover:bg-foreground/90 ${font('buttons')}`}
                  >
                    CONTINUE TO CONFIRM
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Step */}
            {currentStep === "confirm" && (
              <div className="space-y-4 animate-slideUp">
                {/* Confirm Shipping */}
                <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-gold/5 to-transparent border-b border-border px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📍</span>
                      <h3 className={`font-semibold ${font('body')}`}>Delivery Address</h3>
                    </div>
                    <button
                      onClick={() => setCurrentStep("shipping")}
                      className="text-xs text-gold-dark underline hover:text-gold ${font('labels')}"
                    >
                      EDIT
                    </button>
                  </div>
                  <div className={`p-6 text-sm space-y-1 ${font('body')}`}>
                    <p>{formData.firstName} {formData.lastName}</p>
                    <p>{formData.address}</p>
                    <p>{formData.city}, {formData.state} {formData.pincode}</p>
                    <p className="text-muted-foreground">{formData.email}</p>
                    <p className="text-muted-foreground">{formData.phone}</p>
                  </div>
                </div>

                {/* Confirm Payment */}
                <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-gold/5 to-transparent border-b border-border px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">💳</span>
                      <h3 className="font-semibold ${font('labels')}">Payment Method</h3>
                    </div>
                    <button
                      onClick={() => setCurrentStep("payment")}
                      className="text-xs text-gold-dark underline hover:text-gold ${font('labels')}"
                    >
                      EDIT
                    </button>
                  </div>
                  <div className={`p-6 text-sm ${font('body')}`}>
                    <p className="font-semibold">{paymentMethodInfo[selectedPayment]?.label || "Payment Method"}</p>
                    <p className="text-muted-foreground text-xs mt-1">{paymentMethodInfo[selectedPayment]?.description}</p>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <label className="flex items-start gap-3 p-4 bg-cream border border-border rounded cursor-pointer hover:border-gold transition-all">
                  <input
                    type="checkbox"
                    className="accent-gold mt-1"
                  />
                  <span className={`text-xs text-muted-foreground leading-relaxed ${font('body')}`}>
                    I agree to the <button className="text-gold-dark underline">Terms & Conditions</button> and <button className="text-gold-dark underline">Privacy Policy</button>. I also authorize Orinket to charge my payment method as per the billing cycle.
                  </span>
                </label>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setCurrentStep("payment")}
                    className={`flex-1 rounded border border-border py-4 text-sm font-semibold tracking-wider text-foreground transition-all hover:bg-cream ${font('body')}`}
                  >
                    BACK
                  </button>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className={`flex-1 rounded bg-foreground py-4 text-sm font-semibold tracking-wider text-white transition-all hover:bg-foreground/90 disabled:opacity-50 ${font('body')}`}
                  >
                    {isProcessing ? "PROCESSING..." : `PLACE ORDER • ${formatPrice(total)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-2xl border border-[#e6ddcc] bg-white shadow-[0_24px_65px_rgba(51,34,13,0.12)] lg:sticky lg:top-28 xl:top-32">
              <div className="bg-gradient-to-r from-[#fff7e9] via-[#fffdf7] to-transparent border-b border-[#ece4d5] px-6 py-4 flex items-center justify-between">
                <h3 className={`font-semibold text-sm ${font('body')}`}>
                  ORDER SUMMARY ({items.length})
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.22em] uppercase text-gold-dark font-semibold">
                  <Sparkles className="w-3 h-3" />
                  Premium
                </span>
              </div>

              {/* Items */}
              <div className="max-h-64 overflow-y-auto border-b border-border">
                {items.map((item) => (
                  <div key={item.id} className="px-6 py-4 border-b border-border last:border-b-0 flex gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-cream flex-shrink-0 border border-[#ece4d5]">
                      <Image
                        src={item.image || "/images/product-necklace-1.jpg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className={`flex-1 ${font('body')}`}>
                      <p className="text-xs font-semibold line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-xs font-semibold mt-1">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="px-6 py-3 border-b border-border space-y-2">
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
                    placeholder="Enter promo code"
                    disabled={!!appliedPromo || promoBusy}
                    className={`flex-1 border border-border bg-cream rounded px-2 py-2 text-xs ${font('body')} focus:outline-none focus:border-gold disabled:opacity-60`}
                  />
                  {appliedPromo ? (
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className={`px-3 py-2 border border-border text-foreground text-xs font-semibold rounded hover:bg-cream transition-all ${font('body')} whitespace-nowrap`}
                    >
                      REMOVE
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleApplyPromo()}
                      disabled={promoBusy}
                      className={`px-3 py-2 border border-gold text-gold text-xs font-semibold rounded hover:bg-gold hover:text-white transition-all ${font('body')} disabled:opacity-50`}
                    >
                      {promoBusy ? "…" : "APPLY"}
                    </button>
                  )}
                </div>
                {promoFeedback && (
                  <p
                    className={`text-[11px] ${font('body')} leading-snug ${
                      promoFeedback.type === "success" ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {promoFeedback.text}
                  </p>
                )}
                {!appliedPromo && (
                  <p className={`text-[10px] text-muted-foreground ${font('body')} leading-relaxed`}>
                    Promo codes are validated on the server. Use a code from your offer or spin wheel; minimum order
                    rules apply when configured.
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className={`px-6 py-4 space-y-2 text-sm ${font('body')}`}>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (18%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>
                <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {checkoutSuggestions.length > 0 && (
                <div className="px-6 py-4 border-t border-border">
                  <p className={`text-[10px] uppercase tracking-[0.2em] text-muted-foreground ${font('labels')}`}>
                    You may also like
                  </p>
                  <div className="mt-3 space-y-2">
                    {checkoutSuggestions.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          window.location.assign(`/checkout?product=${p.id}&quantity=1`)
                        }
                        className={`flex w-full items-center justify-between rounded-lg border border-[#ece4d5] px-2 py-2 text-left hover:bg-[#faf6ee] ${font('body')}`}
                      >
                        <span className="line-clamp-1 text-xs">{p.name}</span>
                        <span className="ml-2 shrink-0 text-xs font-semibold">{formatPrice(p.price)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className={`px-6 py-4 bg-cream border-t border-border grid grid-cols-3 gap-3 ${font('body')}`}>
                <div className="text-center">
                  <Truck className="w-4 h-4 mx-auto mb-1 text-gold" />
                  <p className="text-xs text-muted-foreground">Free Ship</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-4 h-4 mx-auto mb-1 text-gold" />
                  <p className="text-xs text-muted-foreground">Easy Return</p>
                </div>
                <div className="text-center">
                  <Shield className="w-4 h-4 mx-auto mb-1 text-gold" />
                  <p className="text-xs text-muted-foreground">Secure</p>
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}

