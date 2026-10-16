import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import { fetchStoreSettingsServer } from "@/lib/server/fetchStoreSettings"
import { legalBulletsFromCms } from "@/lib/supportPagesFromCms"
import { contactFromSettings } from "@/lib/contactFromSettings"
import { FileText, Sparkles } from "lucide-react"
import { fonts } from "@/lib/fonts"

export default async function TermsPage() {
  const settings = await fetchStoreSettingsServer()
  const bullets = legalBulletsFromCms(settings, "termsPage")
  const contact = contactFromSettings(settings)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
          <div className="rounded-3xl border border-border bg-gradient-to-b from-cream to-white p-6 sm:p-10 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-foreground text-white flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h1 className={`text-3xl md:text-4xl font-semibold text-foreground ${fonts.headings}`}>
                  Terms & Conditions
                </h1>
                <p className={`mt-2 text-sm md:text-base text-muted-foreground ${fonts.body}`}>
                  Add bullet points under <code className="text-xs bg-muted px-1 rounded">termsPage.bullets</code> in
                  storefront JSON.
                </p>
              </div>
              <Sparkles className="w-5 h-5 text-gold mt-3" />
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-white p-6">
              <p className={`text-xs uppercase tracking-widest text-muted-foreground ${fonts.labels}`}>Terms</p>
              {bullets.length === 0 ? (
                <p className={`mt-4 text-sm text-muted-foreground ${fonts.body}`}>No terms text configured yet.</p>
              ) : (
                <ul className={`mt-4 space-y-3 text-sm text-muted-foreground ${fonts.body}`}>
                  {bullets.map((line) => (
                    <li key={line} className="flex gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold flex-shrink-0" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-cream p-6">
              <p className={`text-sm font-semibold text-foreground ${fonts.headings}`}>Questions?</p>
              <p className={`mt-1 text-sm text-muted-foreground ${fonts.body}`}>
                {contact.email ? (
                  <>
                    Write to{" "}
                    <a href={`mailto:${contact.email}`} className="text-foreground font-medium underline-offset-2 hover:underline">
                      {contact.email}
                    </a>
                  </>
                ) : (
                  "Add store email in General Settings."
                )}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
