import type { Metadata } from "next"
import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import { fetchStoreSettingsServer } from "@/lib/server/fetchStoreSettings"
import { fetchCmsReturnsServer } from "@/lib/server/fetchCmsSupport"
import { supportPagesBlock } from "@/lib/supportPagesFromCms"
import { contactFromSettings } from "@/lib/contactFromSettings"
import { RefreshCw, Sparkles, XCircle } from "lucide-react"
import Link from "next/link"
import { fonts } from "@/lib/fonts"

export const metadata: Metadata = {
  title: "Returns & exchanges",
  description: "Returns and exchanges policy.",
}

export default async function ReturnsPage() {
  const [cms, settings] = await Promise.all([fetchCmsReturnsServer(), fetchStoreSettingsServer()])
  const contact = contactFromSettings(settings)
  const legacy = supportPagesBlock(settings, "returnsPage") as {
    title?: string
    subtitle?: string
    eligible?: string[]
    notEligible?: string[]
    howTo?: string[]
  } | null

  const p = cms
    ? {
        title: cms.title,
        subtitle: cms.subtitle,
        eligible: Array.isArray(cms.eligible) ? cms.eligible.map(String) : [],
        notEligible: Array.isArray(cms.notEligible) ? cms.notEligible.map(String) : [],
        howTo: Array.isArray(cms.howTo) ? cms.howTo.map(String) : [],
        supportNote: cms.supportNote,
        refundPolicyUrl: cms.refundPolicyUrl,
      }
    : { ...legacy, supportNote: undefined as string | undefined, refundPolicyUrl: undefined as string | undefined }

  const eligible = Array.isArray(p?.eligible) ? p!.eligible.map(String) : []
  const notEligible = Array.isArray(p?.notEligible) ? p!.notEligible.map(String) : []
  const howTo = Array.isArray(p?.howTo) ? p!.howTo.map(String) : []
  const refundHref = (p as { refundPolicyUrl?: string }).refundPolicyUrl?.trim() || "/refund"
  const supportNote = (p as { supportNote?: string }).supportNote?.trim()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
          <div className="rounded-3xl border border-border bg-gradient-to-b from-cream to-white p-6 sm:p-10 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-foreground text-white flex items-center justify-center shrink-0">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h1 className={`text-3xl md:text-4xl font-semibold text-foreground ${fonts.headings}`}>
                  {p?.title?.trim() || "Returns & exchanges"}
                </h1>
                {p?.subtitle?.trim() ? (
                  <p className={`mt-2 text-sm md:text-base text-muted-foreground ${fonts.body}`}>{p.subtitle}</p>
                ) : null}
              </div>
              <Sparkles className="w-5 h-5 text-gold mt-3 shrink-0 hidden sm:block" />
            </div>

            {!eligible.length && !notEligible.length ? (
              <p className={`mt-8 text-sm text-muted-foreground ${fonts.body}`}>
                Add content in Dashboard → <strong>Returns & exchanges</strong>, or{" "}
                <code className="text-xs bg-muted px-1 rounded">supportPages.returnsPage</code> in storefront JSON.
              </p>
            ) : (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-border bg-white p-6">
                  <p className={`text-xs uppercase tracking-widest text-muted-foreground ${fonts.labels} mb-4`}>
                    Eligible
                  </p>
                  <ul className={`space-y-3 text-sm text-muted-foreground ${fonts.body}`}>
                    {eligible.map((line) => (
                      <li key={line} className="flex gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold flex-shrink-0" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-border bg-white p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                    <p className={`text-xs uppercase tracking-widest text-muted-foreground ${fonts.labels}`}>
                      Not eligible
                    </p>
                  </div>
                  <ul className={`space-y-3 text-sm text-muted-foreground ${fonts.body}`}>
                    {notEligible.map((line) => (
                      <li key={line} className="flex gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-border flex-shrink-0" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {howTo.length > 0 ? (
              <div className="mt-6 rounded-2xl border border-border bg-cream p-6">
                <p className={`text-xs uppercase tracking-widest text-muted-foreground ${fonts.labels} mb-4`}>
                  How to start
                </p>
                <ol className={`space-y-3 text-sm text-muted-foreground ${fonts.labels} list-decimal list-inside`}>
                  {howTo.map((line) => (
                    <li key={line} className="pl-1">
                      {line}
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            <p className={`mt-4 text-sm text-muted-foreground ${fonts.body}`}>
              {supportNote ? (
                <span>{supportNote}</span>
              ) : contact.email ? (
                <>
                  Questions?{" "}
                  <a href={`mailto:${contact.email}`} className="text-foreground font-medium underline-offset-2 hover:underline">
                    {contact.email}
                  </a>
                </>
              ) : null}{" "}
              {supportNote || contact.email ? " · " : null}
              <Link href={refundHref} className="text-foreground font-medium underline-offset-2 hover:underline">
                Refund policy
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
