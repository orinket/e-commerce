import type { Metadata } from "next"
import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import { fetchStoreSettingsServer } from "@/lib/server/fetchStoreSettings"
import { cmsCareersIntro, cmsJobOpenings } from "@/lib/server/cmsFromSettings"
import { contactFromSettings } from "@/lib/contactFromSettings"
import { Briefcase, Sparkles, Check } from "lucide-react"
import Link from "next/link"
import { fonts } from "@/lib/fonts"

export const metadata: Metadata = {
  title: "Careers",
  description: "Careers.",
}

export default async function CareersPage() {
  const settings = await fetchStoreSettingsServer()
  const { intro, perks } = cmsCareersIntro(settings)
  const jobOpenings = cmsJobOpenings(settings)
  const contact = contactFromSettings(settings)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
          <div className="rounded-3xl border border-border bg-gradient-to-b from-cream to-white p-6 sm:p-10 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-foreground text-white flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className={`text-xs uppercase tracking-[0.25em] text-muted-foreground ${fonts.labels}`}>Careers</p>
                <h1 className={`mt-2 text-3xl md:text-4xl font-semibold text-foreground ${fonts.headings}`}>
                  Work with us
                </h1>
                {intro?.trim() ? (
                  <p className={`mt-3 text-sm md:text-base text-muted-foreground ${fonts.body} max-w-2xl leading-relaxed`}>
                    {intro}
                  </p>
                ) : (
                  <p className={`mt-3 text-sm text-muted-foreground ${fonts.body}`}>
                    Configure <code className="text-xs bg-muted px-1 rounded">careersPage</code> and{" "}
                    <code className="text-xs bg-muted px-1 rounded">jobOpenings</code> in storefront JSON.
                  </p>
                )}
              </div>
              <Sparkles className="w-5 h-5 text-gold mt-2 shrink-0 hidden sm:block" />
            </div>

            {perks.length > 0 ? (
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                {perks.map((perk) => (
                  <div key={perk} className="flex gap-3 rounded-2xl border border-border bg-white p-4">
                    <div className="h-8 w-8 rounded-lg bg-cream border border-border flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-gold" />
                    </div>
                    <p className={`text-sm text-muted-foreground ${fonts.body} leading-relaxed`}>{perk}</p>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-12">
              <h2 className={`text-lg font-semibold text-foreground ${fonts.headings} tracking-wide`}>Open roles</h2>
              {jobOpenings.length === 0 ? (
                <p className={`mt-2 text-sm text-muted-foreground ${fonts.body}`}>No roles listed yet.</p>
              ) : (
                <ul className="mt-6 space-y-4">
                  {jobOpenings.map((job) => (
                    <li
                      key={job.id}
                      className="rounded-2xl border border-border bg-white p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className={`text-base font-semibold text-foreground ${fonts.headings}`}>{job.title}</h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full bg-cream border border-border text-muted-foreground ${fonts.labels}`}
                          >
                            {job.type}
                          </span>
                        </div>
                        <p className={`mt-1 text-xs text-gold ${fonts.labels}`}>
                          {job.team} · {job.location}
                        </p>
                        <p className={`mt-3 text-sm text-muted-foreground ${fonts.body} leading-relaxed`}>
                          {job.summary}
                        </p>
                      </div>
                      {contact.email ? (
                        <a
                          href={`mailto:${contact.email}?subject=Application%20%E2%80%94%20${encodeURIComponent(job.title)}`}
                          className={`shrink-0 inline-flex justify-center px-6 py-2.5 bg-foreground text-background text-xs tracking-[0.15em] hover:bg-gold-dark transition-colors ${fonts.buttons} rounded-lg`}
                        >
                          APPLY
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-10 rounded-2xl border border-border bg-cream p-6 text-center">
              <p className={`text-sm text-muted-foreground ${fonts.body}`}>
                General enquiries:{" "}
                {contact.email ? (
                  <a href={`mailto:${contact.email}`} className="text-foreground font-medium hover:text-gold-dark">
                    {contact.email}
                  </a>
                ) : (
                  "add store email in General Settings"
                )}
              </p>
              <Link
                href="/about"
                className={`mt-4 inline-block text-xs tracking-[0.2em] text-foreground ${fonts.navigation} border-b border-foreground/40 pb-0.5 hover:border-foreground`}
              >
                ABOUT US
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
