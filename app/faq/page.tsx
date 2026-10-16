import type { Metadata } from "next"
import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import { fetchStoreSettingsServer } from "@/lib/server/fetchStoreSettings"
import { fetchCmsFaqServer } from "@/lib/server/fetchCmsSupport"
import { supportPagesBlock } from "@/lib/supportPagesFromCms"
import { contactFromSettings } from "@/lib/contactFromSettings"
import { HelpCircle, Sparkles } from "lucide-react"
import Link from "next/link"
import { fonts } from "@/lib/fonts"

export const metadata: Metadata = {
  title: "FAQs",
  description: "Frequently asked questions.",
}

type FaqItem = { q?: string; a?: string }
type FaqGroup = { title?: string; items?: FaqItem[] }

function faqGroupsFromCms(
  rows: Array<{ groupTitle?: string; question?: string; answer?: string }>
): FaqGroup[] {
  const map = new Map<string, FaqItem[]>()
  for (const row of rows) {
    const q = row.question?.trim()
    if (!q) continue
    const key = (row.groupTitle || "").trim() || "__default"
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push({ q, a: row.answer || "" })
  }
  return [...map.entries()].map(([key, items]) => ({
    title: key === "__default" ? "" : key,
    items,
  }))
}

export default async function FaqPage() {
  const [cmsRows, settings] = await Promise.all([fetchCmsFaqServer(), fetchStoreSettingsServer()])
  const contact = contactFromSettings(settings)
  const faq = supportPagesBlock(settings, "faqPage") as {
    title?: string
    subtitle?: string
    groups?: FaqGroup[]
  } | null

  const groupsFromDb = faqGroupsFromCms(cmsRows)
  const groups =
    groupsFromDb.length > 0 ? groupsFromDb : Array.isArray(faq?.groups) ? faq.groups : []

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
          <div className="rounded-3xl border border-border bg-gradient-to-b from-cream to-white p-6 sm:p-10 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-foreground text-white flex items-center justify-center shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h1 className={`text-3xl md:text-4xl font-semibold text-foreground ${fonts.headings}`}>
                  {faq?.title?.trim() || "Frequently asked questions"}
                </h1>
                {faq?.subtitle?.trim() ? (
                  <p className={`mt-2 text-sm md:text-base text-muted-foreground ${fonts.body}`}>
                    {faq.subtitle}
                  </p>
                ) : null}
              </div>
              <Sparkles className="w-5 h-5 text-gold mt-3 shrink-0 hidden sm:block" />
            </div>

            {groups.length === 0 ? (
              <p className={`mt-10 text-sm text-muted-foreground ${fonts.body}`}>
                FAQ content is not set yet. Add entries in the admin dashboard under{" "}
                <strong>FAQ Master</strong>, or use General Settings → storefront JSON{" "}
                <code className="text-xs bg-muted px-1 rounded">supportPages.faqPage</code>.
              </p>
            ) : (
              <div className="mt-10 space-y-10">
                {groups.map((group) => (
                  <section key={group.title || "g"}>
                    {group.title?.trim() ? (
                      <h2 className={`text-xs uppercase tracking-[0.25em] text-muted-foreground ${fonts.labels} mb-4`}>
                        {group.title}
                      </h2>
                    ) : null}
                    <div className="rounded-2xl border border-border bg-white divide-y divide-border overflow-hidden">
                      {(group.items || []).map((item, i) =>
                        item.q?.trim() ? (
                          <details key={`${item.q}-${i}`} className="group px-5 py-1">
                            <summary
                              className={`cursor-pointer list-none py-4 flex items-start justify-between gap-4 text-sm font-medium text-foreground ${fonts.headings} marker:content-none [&::-webkit-details-marker]:hidden`}
                            >
                              <span>{item.q}</span>
                              <span className="text-gold text-lg leading-none mt-0.5 group-open:rotate-45 transition-transform">
                                +
                              </span>
                            </summary>
                            <p className={`pb-4 text-sm text-muted-foreground ${fonts.body} leading-relaxed pr-8`}>
                              {item.a}
                            </p>
                          </details>
                        ) : null
                      )}
                    </div>
                  </section>
                ))}
              </div>
            )}

            <div className="mt-10 rounded-2xl border border-border bg-cream p-6">
              <p className={`text-sm font-semibold text-foreground ${fonts.headings}`}>Still need help?</p>
              <p className={`mt-1 text-sm text-muted-foreground ${fonts.body}`}>
                {contact.email ? (
                  <>
                    Email{" "}
                    <a href={`mailto:${contact.email}`} className="text-foreground font-medium underline-offset-2 hover:underline">
                      {contact.email}
                    </a>
                  </>
                ) : (
                  "Add a store email in General Settings."
                )}{" "}
                or visit{" "}
                <Link href="/contact" className="text-foreground font-medium underline-offset-2 hover:underline">
                  Contact
                </Link>
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
