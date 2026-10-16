'use client'

import { useMemo } from 'react'
import ProductGrid from '@/components/orinket/ProductGrid'
import AnimatedSection from '@/components/orinket/AnimatedSection'
import { useAppSelector } from '@/store/hooks'
import { selectProducts } from '@/store/selectors'
import { getSaleProducts } from '@/lib/catalogQueries'
import { fonts } from '@/lib/fonts'

export default function SaleProductGridClient() {
  const catalog = useAppSelector(selectProducts)
  const products = useMemo(() => getSaleProducts(catalog), [catalog])

  if (products.length === 0) {
    return (
      <p className={`text-center text-muted-foreground ${fonts.body}`}>
        No sale items right now — check back soon.
      </p>
    )
  }

  return (
    <AnimatedSection animation="slideUp" delay={120}>
      <ProductGrid products={products} />
    </AnimatedSection>
  )
}
