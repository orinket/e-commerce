import Header from '@/components/orinket/Header'
import Footer from '@/components/orinket/Footer'
import AnimatedSection from '@/components/orinket/AnimatedSection'
import AllProductsClient from './AllProductsClient'

export default function AllProductsPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <AnimatedSection animation="fadeIn" delay={100}>
          <div className="mb-12 text-center">
            <h1 className="mb-4 font-serif text-4xl md:text-5xl">All Products</h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Discover our complete collection of beautiful jewelry pieces
            </p>
          </div>
        </AnimatedSection>

        <AllProductsClient />
      </div>

      <Footer />
    </main>
  )
}
