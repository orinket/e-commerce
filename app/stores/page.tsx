import type { Metadata } from "next"
import Image from "next/image"
import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import { fetchStoreSettingsServer } from "@/lib/server/fetchStoreSettings"
import { cmsStoreLocations } from "@/lib/server/cmsFromSettings"
import { contactFromSettings } from "@/lib/contactFromSettings"
import { MapPin, Phone, Clock, Sparkles } from "lucide-react"
import Link from "next/link"
import { fonts } from "@/lib/fonts"

export const metadata: Metadata = {
  title: "Stores",
  description: "Store locations.",
}

export default async function StoresPage() {
  const settings = await fetchStoreSettingsServer()
  const storeLocations = cmsStoreLocations(settings)
  const contact = contactFromSettings(settings)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
          <div className="rounded-3xl border border-border bg-gradient-to-b from-cream to-white p-6 sm:p-10 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-foreground text-white flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className={`text-xs uppercase tracking-[0.25em] text-muted-foreground ${fonts.labels}`}>Visit us</p>
                <h1 className={`mt-2 text-3xl md:text-4xl font-semibold text-foreground ${fonts.headings}`}>
                  Our stores
                </h1>
                <p className={`mt-2 text-sm md:text-base text-muted-foreground ${fonts.body} max-w-2xl leading-relaxed`}>
                  Locations come from <code className="text-xs bg-muted px-1 rounded">storeLocations</code> in storefront
                  JSON.
                </p>
              </div>
              <Sparkles className="w-5 h-5 text-gold mt-2 shrink-0 hidden sm:block" />
            </div>

            {storeLocations.length === 0 ? (
              <p className={`mt-10 text-sm text-muted-foreground ${fonts.body}`}>No stores configured yet.</p>
            ) : (
              <div className="mt-10 grid grid-cols-1 gap-8">
                {storeLocations.map((store) => (
                  <article
                    key={store.slug}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-2xl border border-border bg-white overflow-hidden"
                  >
                    <Link href={`/stores/${store.slug}`} className="relative block aspect-[4/3] md:aspect-auto md:min-h-[280px]">
                      <Image
                        src={store.image}
                        alt={store.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </Link>
                    <div className="p-6 sm:p-8 flex flex-col justify-center">
                      <p className={`text-xs uppercase tracking-wider text-gold ${fonts.labels}`}>{store.city}</p>
                      <h2 className={`mt-1 text-xl md:text-2xl font-semibold text-foreground ${fonts.headings}`}>
                        <Link href={`/stores/${store.slug}`} className="hover:text-gold-dark transition-colors">
                          {store.name}
                        </Link>
                      </h2>
                      <div className={`mt-4 space-y-3 text-sm text-muted-foreground ${fonts.body}`}>
                        <div className="flex gap-3">
                          <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                          <span>{store.address}</span>
                        </div>
                        <div className="flex gap-3">
                          <Clock className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                          <span>{store.hours}</span>
                        </div>
                        <div className="flex gap-3">
                          <Phone className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                          <a
                            href={`tel:${store.phone.replace(/\s/g, "")}`}
                            className="hover:text-foreground transition-colors"
                          >
                            {store.phone}
                          </a>
                        </div>
                      </div>
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {store.highlights.map((h) => (
                          <li
                            key={h}
                            className={`text-xs px-3 py-1 rounded-full bg-cream border border-border text-foreground/80 ${fonts.labels}`}
                          >
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="mt-10 rounded-2xl border border-border bg-cream p-6">
              <p className={`text-sm font-semibold text-foreground ${fonts.headings}`}>Head office</p>
              <p className={`mt-1 text-sm text-muted-foreground ${fonts.body}`}>
                {contact.address || "—"}
                {contact.hours ? ` · ${contact.hours}` : ""}
              </p>
              <p className={`mt-4 text-sm text-muted-foreground ${fonts.body}`}>
                {contact.email ? (
                  <>
                    Email{" "}
                    <a href={`mailto:${contact.email}`} className="text-foreground font-medium hover:text-gold-dark">
                      {contact.email}
                    </a>
                  </>
                ) : null}
              </p>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/contact"
                className={`inline-block px-8 py-3 border border-foreground text-foreground text-sm tracking-[0.2em] hover:bg-foreground hover:text-background transition-all ${fonts.buttons}`}
              >
                CONTACT CONCIERGE
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
