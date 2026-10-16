'use client'

import ProductGrid from '@/components/orinket/ProductGrid'
import AnimatedSection from '@/components/orinket/AnimatedSection'
import { useAppSelector } from '@/store/hooks'
import { selectProducts } from '@/store/selectors'

export default function AllProductsClient() {
  const products = useAppSelector(selectProducts)

  return (
    <>
      {products.length > 0 ? (
        <AnimatedSection animation="slideUp" delay={200}>
          <ProductGrid products={products} />
        </AnimatedSection>
      ) : (
        <AnimatedSection animation="fadeIn" delay={200}>
          <div className="py-16 text-center">
            <h2 className="mb-4 text-2xl font-semibold">No products found</h2>
            <p className="text-muted-foreground mb-8">
              We&apos;re adding new products to our collection. Check back soon!
            </p>
            <a
              href="/"
              className="inline-block rounded-sm bg-foreground px-6 py-3 text-white transition-colors hover:bg-gold-dark"
            >
              Continue Shopping
            </a>
          </div>
        </AnimatedSection>
      )}
    </>
  )
}
