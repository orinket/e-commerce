"use client"

import Header from "@/components/orinket/Header"
import HeroSlider from "@/components/orinket/HeroSlider"
import Footer from "@/components/orinket/Footer"
import AnimatedSection from "@/components/orinket/AnimatedSection"
import HomePageSkeleton from "@/components/orinket/HomePageSkeleton"
import StorefrontHomeDynamicSections from "@/components/orinket/StorefrontHomeDynamicSections"
import { useStoreSettings } from "@/context/StoreSettingsContext"

export default function HomePageClient() {
  const { loading } = useStoreSettings()
  if (loading) return <HomePageSkeleton />

  return (
    <main className="min-h-screen">
      <Header />
      <HeroSlider />
      <StorefrontHomeDynamicSections />
      <AnimatedSection animation="fadeIn" delay={720}>
        <Footer />
      </AnimatedSection>
    </main>
  )
}
