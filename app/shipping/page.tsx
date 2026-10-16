import type { Metadata } from "next"
import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import { fetchStoreSettingsServer } from "@/lib/server/fetchStoreSettings"
import { fetchCmsShippingServer } from "@/lib/server/fetchCmsSupport"
import { supportPagesBlock } from "@/lib/supportPagesFromCms"
import { contactFromSettings } from "@/lib/contactFromSettings"
import { Truck, Package, Sparkles } from "lucide-react"
import Link from "next/link"
import { fonts } from "@/lib/fonts"

export const metadata: Metadata = {
  title: "Shipping",
  description: "Shipping information.",
}

export default async function ShippingPage() {
  const [cms, settings] = await Promise.all([fetchCmsShippingServer(), fetchStoreSettingsServer()])
  const contact = contactFromSettings(settings)
  const legacy = supportPagesBlock(settings, "shippingPage") as {
    title?: string
    subtitle?: string
    zones?: Array<{ name?: string; eta?: string; note?: string }>
    bullets?: string[]
    packaging?: string
  } | null

  const p = cms
    ? {
        title: cms.title,
        subtitle: cms.subtitle,
        zones: Array.isArray(cms.zones) ? cms.zones : [],
        bullets: Array.isArray(cms.bullets) ? cms.bullets.map(String) : [],
        packaging: cms.packaging,
      }
    : legacy

  const zones = Array.isArray(p?.zones) ? p!.zones : []
  const bullets = Array.isArray(p?.bullets) ? p!.bullets.map(String) : []

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
          <div className="rounded-3xl border border-border bg-gradient-to-b from-cream to-white p-6 sm:p-10 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-foreground text-white flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h1 className={`text-3xl md:text-4xl font-semibold text-foreground ${fonts.headings}`}>
                  {p?.title?.trim() || "Shipping information"}
                </h1>
                {p?.subtitle?.trim() ? (
                  <p className={`mt-2 text-sm md:text-base text-muted-foreground ${fonts.body}`}>{p.subtitle}</p>
                ) : null}
              </div>
              <Sparkles className="w-5 h-5 text-gold mt-3 shrink-0 hidden sm:block" />
            </div>

            {zones.length === 0 ? (
              <p className={`mt-8 text-sm text-muted-foreground ${fonts.body}`}>
                Add shipping zones in Dashboard → <strong>Shipping page</strong>, or{" "}
                <code className="text-xs bg-muted px-1 rounded">supportPages.shippingPage</code> in General Settings
                storefront JSON.
              </p>
            ) : (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {zones.map((z, i) => (
                  <div key={`${z.name}-${i}`} className="rounded-2xl border border-border bg-white p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-gold" />
                      <p className={`text-sm font-semibold text-foreground ${fonts.headings}`}>{z.name}</p>
                    </div>
                    {z.eta ? <p className={`text-sm text-foreground ${fonts.body}`}>{z.eta}</p> : null}
                    {z.note ? (
                      <p className={`mt-2 text-xs text-muted-foreground ${fonts.labels} leading-relaxed`}>{z.note}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}

            {bullets.length > 0 ? (
              <div className="mt-6 rounded-2xl border border-border bg-white p-6">
                <p className={`text-xs uppercase tracking-widest text-muted-foreground ${fonts.labels}`}>
                  Good to know
                </p>
                <ul className={`mt-4 space-y-3 text-sm text-muted-foreground ${fonts.body}`}>
                  {bullets.map((line) => (
                    <li key={line} className="flex gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold flex-shrink-0" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-6 rounded-2xl border border-border bg-cream p-6">
              {p?.packaging?.trim() ? (
                <p className={`text-sm text-muted-foreground ${fonts.body} leading-relaxed`}>{p.packaging}</p>
              ) : null}
              <p className={`mt-4 text-sm text-muted-foreground ${fonts.body}`}>
                <Link href="/track" className="text-foreground font-medium underline-offset-2 hover:underline">
                  Track order
                </Link>
                {contact.email ? (
                  <>
                    {" "}
                    · email{" "}
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-foreground font-medium underline-offset-2 hover:underline"
                    >
                      {contact.email}
                    </a>
                  </>
                ) : null}
                .
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
