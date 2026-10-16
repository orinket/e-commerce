import type { Metadata } from "next"
import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import { fetchStoreSettingsServer } from "@/lib/server/fetchStoreSettings"
import { parseStorefrontContentJson } from "@/lib/parseStorefrontContentJson"
import { contactFromSettings } from "@/lib/contactFromSettings"
import { Gem, Heart, Shield, Sparkles } from "lucide-react"
import Link from "next/link"
import { font } from "@/lib/fonts"

export const metadata: Metadata = {
  title: "About us",
  description: "About our store.",
}

const valueIcons = [Gem, Heart, Shield] as const

export default async function AboutPage() {
  const settings = await fetchStoreSettingsServer()
  const brand = contactFromSettings(settings)
  const cms = parseStorefrontContentJson(settings?.storefrontContentJson)
  const raw = cms.aboutPage
  const about =
    raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : null

  const headline = typeof about?.headline === "string" ? about.headline : ""
  const subhead = typeof about?.subhead === "string" ? about.subhead : ""
  const intro = typeof about?.intro === "string" ? about.intro : ""
  const values = Array.isArray(about?.values) ? about.values : []
  const stats = Array.isArray(about?.stats) ? about.stats : []

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
          <div className="rounded-3xl border border-border bg-gradient-to-b from-cream to-white p-6 sm:p-10 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-foreground text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className={`text-xs uppercase tracking-[0.25em] text-muted-foreground ${font("labels")}`}>
                  About {brand.brandName}
                </p>
                <h1 className={`mt-2 text-3xl md:text-4xl font-semibold text-foreground ${font("headings")}`}>
                  {headline || "About us"}
                </h1>
                {subhead.trim() ? (
                  <p className={`mt-3 text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed ${font("body")}`}>
                    {subhead}
                  </p>
                ) : null}
              </div>
            </div>

            {!about ? (
              <p className={`mt-8 text-sm text-muted-foreground ${font("body")}`}>
                Add an <code className="text-xs bg-muted px-1 rounded">aboutPage</code> object to your storefront JSON
                in General Settings.
              </p>
            ) : null}

            {intro.trim() ? (
              <p className={`mt-8 text-sm md:text-base text-muted-foreground leading-relaxed max-w-3xl ${font("body")}`}>
                {intro}
              </p>
            ) : null}

            {stats.length > 0 ? (
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((s, i) => {
                  const row = s && typeof s === "object" && !Array.isArray(s) ? (s as Record<string, unknown>) : null
                  const label = typeof row?.label === "string" ? row.label : ""
                  const value = typeof row?.value === "string" ? row.value : ""
                  if (!label) return null
                  return (
                    <div key={`${label}-${i}`} className="rounded-2xl border border-border bg-white p-5 text-center">
                      <p className={`text-2xl md:text-3xl font-semibold text-foreground ${font("headings")}`}>
                        {value}
                      </p>
                      <p className={`mt-1 text-xs uppercase tracking-wider text-muted-foreground ${font("labels")}`}>
                        {label}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : null}

            {values.length > 0 ? (
              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                {values.map((v, i) => {
                  const row = v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null
                  const title = typeof row?.title === "string" ? row.title : ""
                  const body = typeof row?.body === "string" ? row.body : ""
                  const Icon = valueIcons[i] ?? Sparkles
                  if (!title) return null
                  return (
                    <div key={`${title}-${i}`} className="rounded-2xl border border-border bg-white p-6">
                      <div className="h-10 w-10 rounded-xl bg-cream border border-border flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5 text-gold" />
                      </div>
                      <h2 className={`text-lg font-semibold text-foreground ${font("headings")}`}>{title}</h2>
                      {body.trim() ? (
                        <p className={`mt-2 text-sm text-muted-foreground leading-relaxed ${font("body")}`}>{body}</p>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ) : null}

            <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:items-center justify-between rounded-2xl border border-border bg-cream p-6">
              <p className={`text-sm text-muted-foreground ${font("body")}`}>Read more about how we started.</p>
              <Link
                href="/story"
                className={`inline-flex justify-center px-8 py-3 bg-foreground text-background text-sm tracking-[0.15em] hover:bg-gold-dark transition-colors rounded-lg ${font("buttons")}`}
              >
                OUR STORY
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
