"use client"

import { useState } from "react"
import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import { useStoreSettings } from "@/context/StoreSettingsContext"
import { contactFromSettings } from "@/lib/contactFromSettings"
import { labelForOrderStatus } from "@/lib/orderStatusLabels"
import { MapPin, PackageSearch, Truck, CheckCircle, Clock, AlertCircle, RotateCcw } from "lucide-react"
import Link from "next/link"
import { font } from "@/lib/fonts"

type TrackResult = {
  orderNumber: string
  orderStatus: string
  paymentStatus: string
  paymentMethod: string
  trackingUrl: string
  customerName: string
  createdAt: string
  updatedAt: string
  itemCount: number
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

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "delivered": return <CheckCircle className="w-5 h-5 text-green-600" />
    case "shipped": return <Truck className="w-5 h-5 text-blue-600" />
    case "cancelled": return <AlertCircle className="w-5 h-5 text-red-600" />
    case "return_requested":
    case "returned":
    case "refunded": return <RotateCcw className="w-5 h-5 text-orange-600" />
    default: return <Clock className="w-5 h-5 text-amber-500" />
  }
}

const STATUS_STEPS = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
]

export default function TrackPage() {
  const { settings } = useStoreSettings()
  const contact = contactFromSettings(settings)

  const [orderNumber, setOrderNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TrackResult | null>(null)
  const [error, setError] = useState("")

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    const num = orderNumber.trim().toUpperCase()
    if (!num) return
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const res = await fetch(`/api/ecom/orders/track?orderNumber=${encodeURIComponent(num)}`)
      const json = await res.json()
      if (json?.success && json.data) {
        setResult(json.data)
      } else {
        setError(json?.message || "Order not found. Please check your order number.")
      }
    } catch {
      setError("Could not connect. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const currentStepIndex = result
    ? STATUS_STEPS.indexOf(result.orderStatus)
    : -1

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
          <div className="rounded-3xl border border-border bg-gradient-to-b from-cream to-white p-6 sm:p-10 shadow-sm">
            <div className="flex items-start gap-4 mb-8">
              <div className="h-12 w-12 rounded-2xl bg-foreground text-white flex items-center justify-center shrink-0">
                <PackageSearch className="w-6 h-6" />
              </div>
              <div>
                <h1 className={`text-3xl md:text-4xl font-semibold text-foreground ${font("body")}`}>
                  Track your order
                </h1>
                <p className={`mt-1 text-sm md:text-base text-muted-foreground ${font("body")}`}>
                  Enter your order number to see live status.
                </p>
              </div>
            </div>

            {/* Search form */}
            <form
              className="rounded-2xl border border-border bg-white p-6"
              onSubmit={handleTrack}
            >
              <label className={`block text-xs uppercase tracking-widest text-muted-foreground ${font("body")} mb-2`}>
                Order Number
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. ORN000012"
                  className={`flex-1 rounded-xl border border-border bg-cream/50 px-4 py-3 text-sm text-foreground ${font("body")} placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40`}
                />
                <button
                  type="submit"
                  disabled={loading || !orderNumber.trim()}
                  className={`px-6 py-3 bg-foreground text-background text-sm tracking-[0.12em] hover:bg-gold-dark transition-colors ${font("body")} rounded-xl disabled:opacity-50`}
                >
                  {loading ? "Tracking…" : "Track"}
                </button>
              </div>
              <p className={`mt-2 text-xs text-muted-foreground ${font("body")}`}>
                Find your order number in the confirmation email or your account orders page.
              </p>
            </form>

            {/* Error */}
            {error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className={`text-sm text-red-700 ${font("body")}`}>{error}</p>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="mt-6 space-y-4">
                {/* Status card */}
                <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                      <p className={`text-xs uppercase tracking-widest text-muted-foreground ${font("body")}`}>Order</p>
                      <p className={`text-xl font-semibold text-foreground ${font("body")}`}>{result.orderNumber}</p>
                      <p className={`text-sm text-muted-foreground mt-0.5 ${font("body")}`}>
                        Placed {new Date(result.createdAt).toLocaleDateString()} · {result.itemCount} item{result.itemCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${statusBg[result.orderStatus] ?? "text-muted-foreground bg-muted border-border"}`}>
                      <StatusIcon status={result.orderStatus} />
                      {labelForOrderStatus(result.orderStatus)}
                    </div>
                  </div>

                  {/* Progress bar (for normal flow) */}
                  {currentStepIndex >= 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between gap-1">
                        {STATUS_STEPS.map((step, i) => (
                          <div key={step} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className={`w-full h-1.5 rounded-full transition-colors ${
                                i <= currentStepIndex ? "bg-foreground" : "bg-border"
                              }`}
                            />
                            <span className={`text-[10px] capitalize ${font("body")} ${i <= currentStepIndex ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                              {step}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tracking link */}
                  {result.trackingUrl ? (
                    <div className="rounded-xl border border-border bg-cream p-4 flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                      <div>
                        <p className={`text-sm font-semibold text-foreground ${font("body")}`}>Shipment tracking</p>
                        <a
                          href={result.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-sm text-blue-600 underline underline-offset-2 ${font("body")}`}
                        >
                          Track with courier →
                        </a>
                      </div>
                    </div>
                  ) : result.orderStatus === "shipped" ? (
                    <div className="rounded-xl border border-border bg-cream p-4">
                      <p className={`text-sm text-muted-foreground ${font("body")}`}>
                        Your order has shipped. Tracking details will be updated shortly.
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Payment info */}
                <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                  <div className={`flex justify-between text-sm ${font("body")}`}>
                    <span className="text-muted-foreground">Payment method</span>
                    <span className="font-semibold capitalize">
                      {result.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
                    </span>
                  </div>
                  <div className={`flex justify-between text-sm mt-2 ${font("body")}`}>
                    <span className="text-muted-foreground">Payment status</span>
                    <span className={`font-semibold capitalize ${result.paymentStatus === "paid" ? "text-green-600" : result.paymentStatus === "failed" ? "text-red-600" : "text-amber-600"}`}>
                      {result.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Support footer */}
            <div className="mt-8 rounded-2xl border border-border bg-cream p-6">
              <p className={`text-sm text-muted-foreground ${font("body")}`}>
                Need more help? Contact us
                {contact.email ? (
                  <>
                    {" "}at{" "}
                    <a href={`mailto:${contact.email}`} className="font-medium text-foreground underline-offset-2 hover:underline">
                      {contact.email}
                    </a>
                  </>
                ) : " (add store email in General Settings)"}
                {" "}with your order number.
              </p>
              <Link
                href="/shipping"
                className={`mt-3 inline-block text-sm font-medium text-foreground ${font("body")} underline-offset-2 hover:underline`}
              >
                Shipping policy →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
