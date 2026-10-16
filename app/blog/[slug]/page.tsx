import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import { fetchStoreSettingsServer } from "@/lib/server/fetchStoreSettings"
import { getCmsBlogPostBySlug } from "@/lib/server/cmsFromSettings"
import { ArrowLeft } from "lucide-react"
import { fonts } from "@/lib/fonts"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const settings = await fetchStoreSettingsServer()
  const post = getCmsBlogPostBySlug(settings, slug)
  if (!post) return { title: "Article" }
  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params
  const settings = await fetchStoreSettingsServer()
  const post = getCmsBlogPostBySlug(settings, slug)
  if (!post) notFound()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
          <Link
            href="/blog"
            className={`inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground ${fonts.body} mb-8`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to blog
          </Link>

          <p className={`text-xs uppercase tracking-[0.25em] text-gold ${fonts.labels}`}>{post.category}</p>
          <h1 className={`mt-3 text-3xl md:text-4xl font-semibold text-foreground ${fonts.headings} leading-tight`}>
            {post.title}
          </h1>
          <p className={`mt-4 text-sm text-muted-foreground ${fonts.body}`}>
            {post.dateLabel} · {post.readMinutes} min read
          </p>

          <div className="relative aspect-[16/9] mt-8 rounded-2xl overflow-hidden border border-border">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>

          <div className="mt-10 space-y-6">
            {post.body.map((para, i) => (
              <p key={i} className={`text-base text-muted-foreground ${fonts.body} leading-relaxed`}>
                {para}
              </p>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-border bg-gradient-to-b from-cream to-white p-6">
            <p className={`text-sm font-semibold text-foreground ${fonts.headings}`}>Want a personal pick?</p>
            <p className={`mt-2 text-sm text-muted-foreground ${fonts.body}`}>
              Contact us for styling help.
            </p>
            <Link
              href="/contact"
              className={`mt-4 inline-block text-sm tracking-[0.15em] text-foreground ${fonts.buttons} border-b border-foreground pb-0.5 hover:text-gold-dark hover:border-gold-dark transition-colors`}
            >
              CONTACT US
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  )
}
