import type { Metadata } from "next"
import Image from "next/image"
import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import { fetchStoreSettingsServer } from "@/lib/server/fetchStoreSettings"
import { parseStorefrontContentJson } from "@/lib/parseStorefrontContentJson"
import { BookOpen, Sparkles } from "lucide-react"
import Link from "next/link"
import { fonts } from "@/lib/fonts"

export const metadata: Metadata = {
  title: "Our story",
  description: "Our story.",
}

export default async function StoryPage() {
  const settings = await fetchStoreSettingsServer()
  const cms = parseStorefrontContentJson(settings?.storefrontContentJson)
  const raw = cms.storyPage
  const story =
    raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : null

  const headline = typeof story?.headline === "string" ? story.headline : "Our story"
  const lede = typeof story?.lede === "string" ? story.lede : ""
  const paragraphs = Array.isArray(story?.paragraphs) ? story.paragraphs.map(String) : []
  const milestones = Array.isArray(story?.milestones) ? story.milestones : []
  const image = typeof story?.image === "string" && story.image.trim() ? story.image : "/images/brand-story.jpg"

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
          <div className="rounded-3xl border border-border bg-gradient-to-b from-cream to-white p-6 sm:p-10 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-foreground text-white flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h1 className={`text-3xl md:text-4xl font-semibold text-foreground ${fonts.headings}`}>{headline}</h1>
                {lede.trim() ? (
                  <p className={`mt-2 text-sm md:text-base text-muted-foreground ${fonts.body} max-w-2xl leading-relaxed`}>
                    {lede}
                  </p>
                ) : null}
              </div>
              <Sparkles className="w-5 h-5 text-gold mt-2 shrink-0 hidden sm:block" />
            </div>

            {!story ? (
              <p className={`mt-8 text-sm text-muted-foreground ${fonts.body}`}>
                Add <code className="text-xs bg-muted px-1 rounded">storyPage</code> to storefront JSON.
              </p>
            ) : null}

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border">
                <Image
                  src={image}
                  alt={headline}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
              <div className="space-y-4">
                {paragraphs.map((p, i) => (
                  <p key={i} className={`text-sm md:text-base text-muted-foreground ${fonts.body} leading-relaxed`}>
                    {p}
                  </p>
                ))}
              </div>
            </div>

            {milestones.length > 0 ? (
              <div className="mt-14">
                <p className={`text-xs uppercase tracking-[0.25em] text-muted-foreground ${fonts.labels} mb-6`}>
                  Milestones
                </p>
                <div className="relative">
                  <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border md:left-4" aria-hidden />
                  <ul className="space-y-8">
                    {milestones.map((m, i) => {
                      const row =
                        m && typeof m === "object" && !Array.isArray(m) ? (m as Record<string, unknown>) : null
                      const year = typeof row?.year === "string" ? row.year : String(i)
                      const title = typeof row?.title === "string" ? row.title : ""
                      const detail = typeof row?.detail === "string" ? row.detail : ""
                      if (!title) return null
                      return (
                        <li key={`${year}-${title}`} className="relative pl-10 md:pl-12">
                          <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-gold bg-cream md:left-2.5" />
                          <p className={`text-sm font-semibold text-gold ${fonts.labels}`}>{year}</p>
                          <p className={`mt-1 text-base font-semibold text-foreground ${fonts.headings}`}>{title}</p>
                          {detail.trim() ? (
                            <p className={`mt-1 text-sm text-muted-foreground ${fonts.body}`}>{detail}</p>
                          ) : null}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            ) : null}

            <div className="mt-10 text-center">
              <Link
                href="/about"
                className={`inline-flex px-8 py-3 border border-foreground text-foreground text-sm tracking-[0.15em] hover:bg-foreground hover:text-background transition-colors ${fonts.buttons}`}
              >
                BACK TO ABOUT
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
