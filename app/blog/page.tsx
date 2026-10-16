import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import { fetchStoreSettingsServer } from "@/lib/server/fetchStoreSettings"
import { cmsBlogPosts } from "@/lib/server/cmsFromSettings"
import { Sparkles } from "lucide-react"
import { fonts } from "@/lib/fonts"

export const metadata: Metadata = {
  title: "Blog",
  description: "Journal and guides.",
}

export default async function BlogPage() {
  const settings = await fetchStoreSettingsServer()
  const blogPosts = cmsBlogPosts(settings)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
          <div className="rounded-3xl border border-border bg-gradient-to-b from-cream to-white p-6 sm:p-10 shadow-sm mb-10">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-foreground text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className={`text-xs uppercase tracking-[0.25em] text-muted-foreground ${fonts.labels}`}>Journal</p>
                <h1 className={`mt-2 text-3xl md:text-4xl font-semibold text-foreground ${fonts.headings}`}>Blog</h1>
                <p className={`mt-2 text-sm md:text-base text-muted-foreground ${fonts.body} max-w-2xl leading-relaxed`}>
                  Posts are loaded from <code className="text-xs bg-muted px-1 rounded">blogPosts</code> in your storefront
                  JSON.
                </p>
              </div>
            </div>
          </div>

          {blogPosts.length === 0 ? (
            <p className={`text-center text-muted-foreground ${fonts.body}`}>No blog posts configured yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {blogPosts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                  <article className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <div className="p-6">
                      <div className={`flex items-center gap-3 text-xs ${fonts.body}`}>
                        <span className="text-gold">{post.category}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">{post.dateLabel}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">{post.readMinutes} min read</span>
                      </div>
                      <h2 className={`mt-3 text-xl font-semibold text-foreground group-hover:text-gold-dark transition-colors ${fonts.headings}`}>
                        {post.title}
                      </h2>
                      <p className={`mt-2 text-sm text-muted-foreground line-clamp-3 ${fonts.body}`}>{post.excerpt}</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
