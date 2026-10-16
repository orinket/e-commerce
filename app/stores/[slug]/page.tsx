import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import { fetchStoreSettingsServer } from "@/lib/server/fetchStoreSettings"
import { getCmsStoreBySlug } from "@/lib/server/cmsFromSettings"
import { MapPin, Phone, Clock, ArrowLeft } from "lucide-react"
import { fonts } from "@/lib/fonts"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const settings = await fetchStoreSettingsServer()
  const store = getCmsStoreBySlug(settings, slug)
  if (!store) return { title: "Store" }
  return {
    title: `${store.name} — ${store.city}`,
    description: `${store.address}. ${store.hours}`,
  }
}

export default async function StoreDetailPage({ params }: Props) {
  const { slug } = await params
  const settings = await fetchStoreSettingsServer()
  const store = getCmsStoreBySlug(settings, slug)
  if (!store) notFound()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
          <Link
            href="/stores"
            className={`inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground ${fonts.navigation} mb-8`}
          >
            <ArrowLeft className="w-4 h-4" />
            All stores
          </Link>

          <p className={`text-xs uppercase tracking-[0.25em] text-gold ${fonts.labels}`}>{store.city}</p>
          <h1 className={`mt-2 text-3xl md:text-4xl font-semibold text-foreground ${fonts.headings}`}>{store.name}</h1>

          <div className="relative aspect-[16/10] mt-8 rounded-2xl overflow-hidden border border-border">
            <Image
              src={store.image}
              alt={store.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 720px"
              priority
            />
          </div>

          <div className={`mt-8 space-y-4 text-sm text-muted-foreground ${fonts.body}`}>
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <span>{store.address}</span>
            </div>
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <span>{store.hours}</span>
            </div>
            <div className="flex gap-3">
              <Phone className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <a
                href={`tel:${store.phone.replace(/\s/g, "")}`}
                className="text-foreground hover:text-gold-dark transition-colors"
              >
                {store.phone}
              </a>
            </div>
          </div>

          <ul className="mt-6 flex flex-wrap gap-2">
            {store.highlights.map((h) => (
              <li
                key={h}
                className={`text-xs px-3 py-1.5 rounded-full bg-cream border border-border text-foreground/80 ${fonts.labels}`}
              >
                {h}
              </li>
            ))}
          </ul>

          <Link
            href="/contact"
            className={`mt-10 inline-block px-8 py-3 border border-foreground text-foreground text-sm tracking-[0.2em] hover:bg-foreground hover:text-background transition-all ${fonts.buttons}`}
          >
            BOOK STYLING
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
