import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import CategoryPageContent from "@/components/orinket/CategoryPageContent"

export const dynamic = "force-dynamic"

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  return (
    <main className="min-h-screen">
      <Header />
      <CategoryPageContent slug={slug} />
      <Footer />
    </main>
  )
}
