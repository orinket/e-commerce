import type { Metadata } from "next"
import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import AnimatedSection from "@/components/orinket/AnimatedSection"
import SaleProductGridClient from "./SaleProductGridClient"
import { fonts } from "@/lib/fonts"

export const metadata: Metadata = {
  title: "Sale | ORINKET",
  description: "Up to 50% off selected demi-fine jewellery — limited time.",
}

export default function SalePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <AnimatedSection animation="fadeIn" delay={80}>
          <div className="mb-12 text-center">
            <p className={`text-gold mb-3 text-xs uppercase tracking-[0.3em] ${fonts.labels}`}>
              Limited time
            </p>
            <h1 className={`mb-4 text-4xl font-light tracking-[0.08em] md:text-5xl ${fonts.headings}`}>
              UP TO 50% OFF
            </h1>
            <p className={`text-muted-foreground mx-auto max-w-xl ${fonts.body}`}>
              On selected demi-fine pieces — same quality, a little more sparkle for your budget.
            </p>
          </div>
        </AnimatedSection>

        <SaleProductGridClient />
      </div>
      <Footer />
    </main>
  )
}
