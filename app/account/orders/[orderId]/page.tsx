"use client"

import Link from "next/link"
import { use, useEffect, useState } from "react"
import { ChevronRight, Package, Truck, CheckCircle, Clock, RotateCcw, AlertCircle } from "lucide-react"
import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import { useCurrency } from "@/context/CurrencyContext"
import { useStoreSettings } from "@/context/StoreSettingsContext"
import { contactFromSettings } from "@/lib/contactFromSettings"
import { labelForOrderStatus } from "@/lib/orderStatusLabels"
import { font } from "@/lib/fonts"
import { ecomFetch } from "@/lib/ecom/client"

interface OrderDetailsPageProps {
  params: Promise<{ orderId: string }>
}

type OrderStatus = string

type OrderData = {
  _id: string
  orderNumber?: string
  createdAt: string
  orderStatus: OrderStatus
  paymentStatus: string
  paymentMethod: string
  trackingUrl?: string
  totalAmount: number
  subtotalAmount?: number
  discountAmount?: number
  promoCode?: string
  shippingAddress?: {
    name?: string
    email?: string
    phone?: string
    line1?: string
    city?: string
    state?: string
    pincode?: string
  }
  items: Array<{ name: string; price: number; quantity: number; image?: string }>
}

const StatusIcon = ({ status }: { status: OrderStatus }) => {
  switch (status) {
    case "delivered": return <CheckCircle className="w-5 h-5 text-green-600" />
    case "shipped": return <Truck className="w-5 h-5 text-blue-600" />
    case "return_requested": return <RotateCcw className="w-5 h-5 text-amber-600" />
    case "cancelled": return <AlertCircle className="w-5 h-5 text-red-600" />
    default: return <Clock className="w-5 h-5 text-amber-500" />
  }
}

const statusBg: Record<string, string> = {
  delivered: "text-green-700 bg-green-50 border-green-200",
  shipped: "text-blue-700 bg-blue-50 border-blue-200",
  confirmed: "text-amber-700 bg-amber-50 border-amber-200",
  packed: "text-cyan-700 bg-cyan-50 border-cyan-200",
  pending: "text-yellow-700 bg-yellow-50 border-yellow-200",
  processing: "text-yellow-700 bg-yellow-50 border-yellow-200",
  cancelled: "text-red-700 bg-red-50 border-red-200",
  return_requested: "text-orange-700 bg-orange-50 border-orange-200",
  returned: "text-gray-700 bg-gray-50 border-gray-200",
  refunded: "text-emerald-700 bg-emerald-50 border-emerald-200",
}

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { formatPrice } = useCurrency()
  const { settings } = useStoreSettings()
  const contact = contactFromSettings(settings)
  const { orderId } = use(params)
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [returnLoading, setReturnLoading] = useState(false)
  const [returnDone, setReturnDone] = useState(false)
  const [returnError, setReturnError] = useState("")

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const response = await ecomFetch<{ success: boolean; data?: OrderData }>(
          `/api/ecom/orders/${orderId}`
        )
        if (response?.success && response.data) {
          setOrder(response.data)
          if (response.data.orderStatus === "return_requested") setReturnDone(true)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [orderId])

  const requestReturn = async () => {
    if (!order) return
    setReturnLoading(true)
    setReturnError("")
    try {
      const res = await ecomFetch<{ success: boolean; message?: string }>(
        `/api/ecom/orders/${orderId}/return-request`,
        { method: "PATCH", body: JSON.stringify({ returnReason: "Customer requested return" }) }
      )
      if (res?.success) {
        setReturnDone(true)
        setOrder((prev) => prev ? { ...prev, orderStatus: "return_requested" } : prev)
      } else {
        setReturnError(res?.message || "Could not submit return request.")
      }
    } catch {
      setReturnError("Could not submit return request. Please try again.")
    } finally {
      setReturnLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className={`text-muted-foreground ${font("body")}`}>Loading order…</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className={`text-muted-foreground ${font("body")} mb-4`}>Order not found.</p>
            <Link href="/account/orders" className="underline text-sm">Back to orders</Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const ship = order.shippingAddress || {}
  const subtotal = order.subtotalAmount ?? order.items.reduce((s, i) => s + i.price * i.quantity, 0)
  const discount = order.discountAmount ?? 0
  const total = order.totalAmount
  const statusColor = statusBg[order.orderStatus] ?? "text-muted-foreground bg-muted border-border"

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className={`flex items-center gap-2 text-sm ${font("body")} text-muted-foreground mb-8`}>
            <Link href="/account" className="hover:text-gold-dark transition-colors">Account</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/account/orders" className="hover:text-gold-dark transition-colors">My Orders</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">#{order.orderNumber || order._id}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order header */}
              <div className="rounded-2xl border border-border bg-gradient-to-b from-cream to-white p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <p className={`text-xs uppercase tracking-widest text-muted-foreground ${font("body")}`}>Order</p>
                    <h1 className={`text-2xl md:text-3xl font-semibold text-foreground ${font("body")}`}>
                      #{order.orderNumber || order._id}
                    </h1>
                    <p className={`mt-1 text-sm text-muted-foreground ${font("body")}`}>
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border font-semibold ${statusColor}`}>
                    <StatusIcon status={order.orderStatus} />
                    {labelForOrderStatus(order.orderStatus)}
                  </div>
                </div>

                {/* Tracking */}
                <div className="mt-6 rounded-xl border border-border bg-white p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-cream border border-border">
                      <Package className="w-5 h-5 text-gold" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold text-foreground ${font("body")}`}>Tracking</p>
                      {order.trackingUrl ? (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-sm text-blue-600 underline underline-offset-2 ${font("body")}`}
                        >
                          Track shipment →
                        </a>
                      ) : (
                        <p className={`text-sm text-muted-foreground ${font("body")}`}>
                          {order.orderStatus === "shipped"
                            ? "Tracking link will be available soon."
                            : "Tracking information will appear once your order ships."}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <h2 className={`text-lg font-semibold text-foreground ${font("body")}`}>Items</h2>
                <div className="mt-4 divide-y divide-border">
                  {order.items.map((item, i) => (
                    <div key={i} className="py-4 flex items-start justify-between gap-4">
                      <div>
                        <p className={`text-sm font-semibold text-foreground ${font("body")}`}>{item.name}</p>
                        <p className={`text-sm text-muted-foreground ${font("body")}`}>Qty: {item.quantity}</p>
                      </div>
                      <p className={`text-sm font-semibold text-foreground ${font("body")}`}>
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Return request section (only for delivered orders) */}
              {order.orderStatus === "delivered" && !returnDone && (
                <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                  <h2 className={`text-base font-semibold text-foreground ${font("body")} mb-2`}>
                    Need to return?
                  </h2>
                  <p className={`text-sm text-muted-foreground ${font("body")} mb-4`}>
                    Submit a return request within 7 days of delivery. Our team will review and contact you.
                  </p>
                  {returnError && (
                    <p className="text-sm text-red-600 mb-3">{returnError}</p>
                  )}
                  <button
                    onClick={requestReturn}
                    disabled={returnLoading}
                    className={`inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground ${font("body")} hover:border-gold-dark hover:text-gold-dark transition-all bg-white disabled:opacity-50`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    {returnLoading ? "Submitting…" : "Request Return"}
                  </button>
                </div>
              )}

              {returnDone && order.orderStatus === "return_requested" && (
                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
                  <p className={`text-sm font-semibold text-orange-800 ${font("body")}`}>
                    Return request submitted
                  </p>
                  <p className={`text-sm text-orange-700 mt-1 ${font("body")}`}>
                    Our team will review your request and reach out to you within 2–3 business days.
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sticky top-24 space-y-6">
                {/* Order summary */}
                <div>
                  <h3 className={`text-sm font-semibold uppercase tracking-widest text-muted-foreground ${font("body")}`}>
                    Summary
                  </h3>
                  <div className={`mt-4 space-y-3 text-sm ${font("body")}`}>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">{formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Discount{order.promoCode ? ` (${order.promoCode})` : ""}
                        </span>
                        <span className="text-green-600">−{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-green-600 font-semibold">FREE</span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between text-base font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment info */}
                <div className="border-t border-border pt-4">
                  <div className={`space-y-1 text-sm ${font("body")}`}>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment</span>
                      <span className="capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className={`capitalize font-semibold ${order.paymentStatus === "paid" ? "text-green-600" : order.paymentStatus === "failed" ? "text-red-600" : "text-amber-600"}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Support */}
                <div className="rounded-xl border border-border bg-cream p-4">
                  <p className={`text-xs uppercase tracking-widest text-muted-foreground ${font("body")}`}>Support</p>
                  <p className={`mt-1 text-sm font-semibold text-foreground ${font("body")}`}>
                    {contact.email || "—"}
                  </p>
                  {contact.hours && (
                    <p className={`text-sm text-muted-foreground ${font("body")}`}>{contact.hours}</p>
                  )}
                </div>

                <Link
                  href="/"
                  className={`block w-full rounded-xl bg-foreground py-3 text-center text-white text-sm font-semibold tracking-wider ${font("body")} hover:bg-gold-dark transition-colors`}
                >
                  CONTINUE SHOPPING
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
