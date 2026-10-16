"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Package, ChevronRight, Truck, CheckCircle, Clock } from "lucide-react"
import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import { useCurrency } from "@/context/CurrencyContext"
import { useStoreSettings } from "@/context/StoreSettingsContext"
import { contactFromSettings } from "@/lib/contactFromSettings"
import { font } from "@/lib/fonts"
import { ecomFetch } from "@/lib/ecom/client"
import { labelForOrderStatus } from "@/lib/orderStatusLabels"

type OrderRow = {
  id: string
  date: string
  status: string
  total: number
  items: Array<{ name: string; image: string; price: number; quantity: number }>
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "delivered":
      return <CheckCircle className="w-5 h-5 text-green-600" />
    case "shipped":
      return <Truck className="w-5 h-5 text-blue-600" />
    case "processing":
    case "confirmed":
      return <Clock className="w-5 h-5 text-gold" />
    case "cancelled":
      return <Package className="w-5 h-5 text-red-600" />
    default:
      return <Package className="w-5 h-5 text-muted-foreground" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "text-green-700 bg-green-50 border-green-200"
    case "shipped":
      return "text-blue-700 bg-blue-50 border-blue-200"
    case "processing":
    case "confirmed":
      return "text-amber-700 bg-amber-50 border-amber-200"
    case "cancelled":
      return "text-red-700 bg-red-50 border-red-200"
    default:
      return "text-muted-foreground bg-muted border-border"
  }
}

export default function OrdersPage() {
  const { formatPrice } = useCurrency()
  const { settings } = useStoreSettings()
  const contact = contactFromSettings(settings)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setLoadError("")
      try {
        const response = await ecomFetch<{
          success: boolean
          data?: Array<{
            _id: string
            createdAt: string
            orderStatus: string
            totalAmount: number
            items: Array<{ name: string; image: string; price: number; quantity: number }>
          }>
        }>("/api/ecom/orders")
        if (!response?.success || !response.data) {
          setLoadError("Could not load orders. Try signing in again.")
          setOrders([])
          return
        }
        setOrders(
          response.data.map((o) => ({
            id: o._id,
            date: new Date(o.createdAt).toLocaleDateString(),
            status: o.orderStatus,
            total: o.totalAmount,
            items: o.items || [],
          }))
        )
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#fbf8f2] via-[#f7f3ea] to-[#f4efe4]">
      <Header />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-10">
          {/* Breadcrumb */}
          <div className={`flex items-center gap-2 text-sm ${font("body")} text-muted-foreground mb-8`}>
            <Link href="/account" className="hover:text-gold-dark transition-colors">Account</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">My Orders</span>
          </div>

          <div className="mb-8 rounded-2xl border border-[#e6ddcc] bg-gradient-to-r from-[#fff9ec] via-[#fffdf7] to-[#fdf7ea] p-6 shadow-[0_16px_40px_rgba(52,36,13,0.08)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className={`text-2xl md:text-3xl font-semibold text-foreground ${font("headings")} tracking-tight`}>
                  My Orders
                </h1>
                <p className={`mt-1 text-sm text-muted-foreground ${font("body")}`}>
                  Track status and details for every order from {contact.brandName}.
                </p>
              </div>
              <div className={`rounded-xl border border-[#e2d7c5] bg-white px-4 py-3 text-sm ${font("body")} shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]`}>
                <p className="text-muted-foreground">Need help?</p>
                <p className="font-semibold text-foreground">{contact.email || "—"}</p>
              </div>
            </div>
          </div>

          {loadError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              {loadError}
            </div>
          ) : null}

          {loading ? (
            <div className="text-center py-16">
              <p className={`text-muted-foreground ${font("body")}`}>Loading your orders…</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="overflow-hidden rounded-2xl border border-[#e3d9c9] bg-white shadow-[0_14px_36px_rgba(55,37,12,0.07)]">
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gradient-to-r from-[#faf3e3] via-[#fffdf9] to-[#faf3e3] border-b border-[#ece3d2]">
                    <div className={`flex flex-wrap items-center gap-4 text-sm ${font("body")}`}>
                      <div>
                        <span className="text-muted-foreground">Order </span>
                        <span className="font-semibold text-foreground">#{order.id}</span>
                      </div>
                      <div className="hidden md:block w-px h-4 bg-[#ddd0bc]" />
                      <span className="text-muted-foreground">{order.date}</span>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border ${font("body")} font-semibold ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {labelForOrderStatus(order.status)}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-5">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-20 h-20 relative bg-cream-dark rounded-xl overflow-hidden flex-shrink-0 border border-[#e9decc]">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-foreground font-semibold ${font('body')}`}>
                            {item.name}
                          </h3>
                          <p className={`text-sm text-muted-foreground mt-1 ${font("body")}`}>
                            Qty: {item.quantity}
                          </p>
                          <p className={`text-sm font-semibold mt-1 ${font("body")}`}>
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="flex items-center justify-between p-4 border-t border-[#ede4d5] bg-[#fffdf9]">
                    <div className={`text-sm ${font("body")}`}>
                      <span className="text-muted-foreground">Total: </span>
                      <span className="font-semibold text-foreground">{formatPrice(order.total)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {(order.status === "shipped" || order.status === "confirmed") && (
                        <Link
                          href={`/account/orders/${order.id}`}
                          className={`text-sm text-gold-dark ${font("body")} hover:text-foreground transition-colors`}
                        >
                          Track order
                        </Link>
                      )}
                      <Link
                        href={`/account/orders/${order.id}`}
                        className={`inline-flex items-center gap-1 rounded-lg border border-[#e4d9c7] px-3 py-1.5 text-sm text-foreground ${font("body")} hover:border-gold-dark hover:text-gold-dark transition-all bg-white`}
                      >
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
              <h1 className={`text-2xl md:text-3xl font-semibold text-foreground ${font("headings")} tracking-tight`}>
                No orders yet
              </h1>
              <p className={`text-muted-foreground ${font("body")} mb-6`}>
                When you place an order, it will appear here.
              </p>
              <Link
                href="/"
                className={`mt-6 block w-full rounded-xl bg-foreground py-3 text-center text-white text-sm font-semibold tracking-wider ${font("buttons")} hover:bg-gold-dark transition-colors`}
              >
                START SHOPPING
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

