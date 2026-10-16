import Link from "next/link"
import { CheckCircle, Package, Mail, ArrowRight, ShieldCheck } from "lucide-react"
import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import { fetchStoreSettingsServer } from "@/lib/server/fetchStoreSettings"
import { contactFromSettings } from "@/lib/contactFromSettings"
import { fonts } from "@/lib/fonts"

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<{ orderId?: string }>
}) {
  const settings = await fetchStoreSettingsServer()
  const contact = contactFromSettings(settings)
  const params = (await searchParams) || {}
  const orderNumber = params.orderId || `ORN${Date.now().toString().slice(-8)}`

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#fbf8f2] via-[#f8f4eb] to-[#f4efe5]">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="rounded-3xl border border-[#e4dac8] bg-white shadow-[0_22px_60px_rgba(60,38,14,0.1)] overflow-hidden">
            <div className="bg-gradient-to-r from-[#fff8ea] via-[#fffefb] to-[#fff8ea] border-b border-[#eee4d3] px-6 py-7 text-center">
          {/* Success Icon */}
          <div className="mb-5">
            <div className="w-20 h-20 mx-auto bg-green-100/80 rounded-full flex items-center justify-center border border-green-200 shadow-[0_8px_24px_rgba(34,197,94,0.22)]">
              <CheckCircle className="w-11 h-11 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className={`text-3xl md:text-4xl font-semibold ${fonts.headings} text-foreground mb-3 tracking-tight`}>
            Thank You For Your Order!
          </h1>
          <p className={`text-muted-foreground ${fonts.body} max-w-xl mx-auto`}>
            Your order has been placed successfully. We're preparing your jewelry with love and care.
          </p>
            </div>

          {/* Order Number */}
            <div className="px-6 pt-6">
              <div className="rounded-2xl border border-[#e7dcc8] bg-gradient-to-r from-[#faf3e3] via-[#fffef9] to-[#faf3e3] p-6 text-center mb-6">
                <p className={`text-[11px] uppercase tracking-[0.2em] text-muted-foreground ${fonts.labels} mb-2`}>
                  Order Number
                </p>
                <p className={`text-2xl font-semibold ${fonts.headings} text-foreground tracking-wide`}>
                  {orderNumber}
                </p>
              </div>
            </div>

          {/* What's Next */}
            <div className="px-6">
              <div className="space-y-3 mb-6 text-left">
                <div className="flex items-start gap-4 p-4 bg-white border border-[#e7ddcc] rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-cream border border-[#e5d9c4] flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${fonts.headings} text-foreground text-sm`}>
                      Order Confirmation
                    </h3>
                    <p className={`text-sm text-muted-foreground ${fonts.body}`}>
                      We've sent a confirmation email with your order details.
                    </p>
                    <p className={`text-xs text-muted-foreground ${fonts.labels} mt-1`}>
                      Need help? Reach us at {contact.email || "your store email (General Settings)"}.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white border border-[#e7ddcc] rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-cream border border-[#e5d9c4] flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${fonts.headings} text-foreground text-sm`}>
                      Shipping Updates
                    </h3>
                    <p className={`text-sm text-muted-foreground ${fonts.body}`}>
                      You'll receive tracking information once your order ships.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6 rounded-xl border border-[#e7ddcc] bg-gradient-to-r from-[#fffdf8] to-[#fff8ea] px-4 py-3 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-gold flex-shrink-0" />
                <p className={`text-xs text-muted-foreground ${fonts.body}`}>
                  Your payment and personal details are securely encrypted and protected.
                </p>
              </div>
            </div>

          {/* Actions */}
            <div className="px-6 pb-6 border-t border-[#eee5d7] pt-5 bg-gradient-to-b from-white to-[#fffdfa]">
              <div className="space-y-3">
                <Link
                  href="/account/orders"
                  className={`group w-full py-4 bg-gradient-to-r from-[#1b0e09] via-[#2a1710] to-[#1b0e09] text-white rounded-xl ${fonts.buttons} tracking-[0.12em] hover:from-[#2b170f] hover:via-[#3a2217] hover:to-[#2b170f] transition-all flex items-center justify-center gap-2 shadow-[0_12px_28px_rgba(34,17,7,0.25)] border border-[#3c2417]`}
                >
                  VIEW ORDER STATUS
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/"
                  className={`w-full py-4 rounded-xl border border-[#d9c9ad] text-foreground ${fonts.buttons} tracking-[0.12em] hover:bg-[#f9f3e7] hover:border-[#cfbc9b] transition-all block text-center bg-white`}
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

