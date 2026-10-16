import Link from "next/link"
import { Home, Search, ArrowLeft } from "lucide-react"
import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import { font } from "@/lib/fonts"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16">
        <div className="max-w-lg mx-auto px-4 text-center">
          {/* 404 Text */}
          <h1 className="text-8xl md:text-9xl font-bold text-gold mb-4">
            404
          </h1>
          <h2 className={`text-2xl md:text-3xl font-semibold text-foreground mb-4 ${font('headings')}`}>
            Page Not Found
          </h2>
          <p className={`text-muted-foreground mb-8 ${font('body')}`}>
            Sorry, we couldn't find the page you're looking for. It might have been moved or no longer exists.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className={`inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-white tracking-wider hover:bg-gold-dark transition-colors ${font('buttons')}`}
            >
              <Home className="w-5 h-5" />
              GO HOME
            </Link>
            <Link
              href="/search"
              className={`inline-flex items-center justify-center gap-2 px-8 py-4 border border-foreground text-foreground tracking-wider hover:bg-foreground hover:text-white transition-colors ${font('buttons')}`}
            >
              <Search className="w-5 h-5" />
              SEARCH
            </Link>
          </div>

          {/* Popular Links */}
          <div className="mt-12">
            <h3 className={`text-sm font-semibold text-foreground mb-4 ${font('labels')}`}>
              POPULAR CATEGORIES
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {["Necklaces", "Earrings", "Bracelets", "Rings", "9KT Gold"].map((cat) => (
                <Link
                  key={cat}
                  href="/category/all"
                  className={`px-4 py-2 bg-cream text-sm text-foreground hover:bg-gold-light transition-colors ${font('body')}`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

