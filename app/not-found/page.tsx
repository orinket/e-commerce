import Link from 'next/link'
import Header from '@/components/orinket/Header'
import Footer from '@/components/orinket/Footer'
import AnimatedSection from '@/components/orinket/AnimatedSection'

export default function NotFound() {
  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        <AnimatedSection animation="fadeIn" delay={100}>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-semibold mb-4">404</h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">Page Not Found</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              The page you're looking for doesn't exist or has been moved. 
              Let's get you back to shopping for beautiful jewelry!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="px-6 py-3 bg-foreground text-white rounded-sm hover:bg-gold-dark transition-colors"
              >
                Back to Home
              </Link>
              <Link
                href="/category/all"
                className="px-6 py-3 border border-border rounded-sm hover:bg-cream transition-colors"
              >
                Shop New Arrivals
              </Link>
            </div>
            
            {/* Quick Category Links */}
            <div className="mt-12">
              <h3 className="text-lg font-semibold mb-6">Popular Categories</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <Link
                  href="/category/all"
                  className="p-4 border border-border rounded-sm hover:border-gold hover:bg-cream transition-all text-center"
                >
                  <div className="font-medium">Necklaces</div>
                  <div className="text-sm text-muted-foreground">Elegant designs</div>
                </Link>
                <Link
                  href="/category/all"
                  className="p-4 border border-border rounded-sm hover:border-gold hover:bg-cream transition-all text-center"
                >
                  <div className="font-medium">Earrings</div>
                  <div className="text-sm text-muted-foreground">Beautiful styles</div>
                </Link>
                <Link
                  href="/category/all"
                  className="p-4 border border-border rounded-sm hover:border-gold hover:bg-cream transition-all text-center"
                >
                  <div className="font-medium">Bracelets</div>
                  <div className="text-sm text-muted-foreground">Everyday wear</div>
                </Link>
                <Link
                  href="/category/all"
                  className="p-4 border border-border rounded-sm hover:border-gold hover:bg-cream transition-all text-center"
                >
                  <div className="font-medium">Rings</div>
                  <div className="text-sm text-muted-foreground">Special moments</div>
                </Link>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
      
      <Footer />
    </main>
  )
}

