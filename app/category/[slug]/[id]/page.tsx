import ProductPage from "@/app/product/[id]/page"

export default async function CategoryProductPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { id } = await params
  return <ProductPage params={Promise.resolve({ id })} />
}
