import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import AnimatedSection from "@/components/orinket/AnimatedSection"
import { collectionLandings } from "@/data/landingCollections"
import CollectionProductGridClient from "./CollectionProductGridClient"
import { fonts } from "@/lib/fonts"

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return Object.keys(collectionLandings).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const landing = collectionLandings[slug]
  if (!landing) return { title: "Collection | ORINKET" }
  return {
    title: `${landing.title} | ORINKET`,
    description: landing.description,
  }
}

export default async function CollectionLandingPage({ params }: Props) {
  const { slug } = await params
  const landing = collectionLandings[slug]
  if (!landing) notFound()

  return (
    <main className="min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
        <AnimatedSection animation="fadeIn" delay={80}>
          <div className="text-center mb-12">
            <h1 className={`text-3xl md:text-5xl font-light tracking-[0.1em] ${fonts.headings} mb-4`}>
              {landing.title}
            </h1>
            <p className={`text-muted-foreground max-w-xl mx-auto ${fonts.body}`}>
              {landing.description}
            </p>
          </div>
        </AnimatedSection>

        <CollectionProductGridClient productIds={landing.productIds} />
      </div>
      <Footer />
    </main>
  )
}
