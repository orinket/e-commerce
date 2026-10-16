'use client'

import { useMemo } from 'react'
import ProductGrid from '@/components/orinket/ProductGrid'
import AnimatedSection from '@/components/orinket/AnimatedSection'
import { useAppSelector } from '@/store/hooks'
import { selectProducts } from '@/store/selectors'
import { getProductsByIds } from '@/lib/catalogQueries'

export default function CollectionProductGridClient({ productIds }: { productIds: string[] }) {
  const catalog = useAppSelector(selectProducts)
  const products = useMemo(() => getProductsByIds(catalog, productIds), [catalog, productIds])

  return (
    <AnimatedSection animation="slideUp" delay={120}>
      <ProductGrid products={products} />
    </AnimatedSection>
  )
}
