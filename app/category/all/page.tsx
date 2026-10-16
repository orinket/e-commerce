import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import CategoryPageContent from "@/components/orinket/CategoryPageContent"

export default function CategoryAllPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <CategoryPageContent slug="all" />
      <Footer />
    </main>
  )
}
