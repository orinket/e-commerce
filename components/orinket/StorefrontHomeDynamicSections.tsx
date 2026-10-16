"use client"

import AnimatedSection from "@/components/orinket/AnimatedSection"
import AutomatedStorefrontSections from "@/components/orinket/AutomatedStorefrontSections"
import {
  storefrontHomeCmsSectionsAfterEcom,
  storefrontHomeCmsSectionsBeforeEcom,
} from "@/lib/storefrontHomeSectionConfig"

function renderCmsGroup(defs: typeof storefrontHomeCmsSectionsBeforeEcom) {
  return defs.map(({ id, Component, animation, delay }) => (
    <AnimatedSection key={id} animation={animation} delay={delay}>
      <Component />
    </AnimatedSection>
  ))
}

/**
 * Renders all dashboard-managed homepage sections in order:
 * CMS (2) → automated ecom rails → CMS (12), all fed by `storefrontContentJson` via hooks inside each component.
 */
export default function StorefrontHomeDynamicSections() {
  return (
    <>
      {renderCmsGroup(storefrontHomeCmsSectionsBeforeEcom)}
      <AnimatedSection animation="fadeIn" delay={130}>
        <AutomatedStorefrontSections />
      </AnimatedSection>
      {renderCmsGroup(storefrontHomeCmsSectionsAfterEcom)}
    </>
  )
}
