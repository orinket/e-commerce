import { NextResponse } from "next/server"
import { resolveOrinketBackendOrigin } from "@/lib/publicApi/server/resolveBackendOrigin"

type BodyShape = {
  paginationinfo?: { pageno?: number; pagelimit?: number }
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as BodyShape
  const base = resolveOrinketBackendOrigin()
  if (!base) {
    return NextResponse.json(
      { success: false, message: "Missing ORINKET_BACKEND_URL or NEXT_PUBLIC_API_URL" },
      { status: 500 }
    )
  }

  const pageno = Math.max(1, Number(body?.paginationinfo?.pageno || 1))
  const pagelimit = Math.min(1000, Math.max(1, Number(body?.paginationinfo?.pagelimit || 500)))

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${base}/api/ecom/products?page=1&limit=1000`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      }),
      fetch(`${base}/api/ecom/categories`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      }),
    ])
    const productsJson = (await productsRes.json()) as {
      success?: boolean
      data?: Array<{ id: string; category?: string; categoryName?: string; tags?: string[] }>
    }
    const categoriesJson = (await categoriesRes.json()) as {
      success?: boolean
      data?: Array<{ _id: string; name: string; slug: string }>
    }

    if (!productsRes.ok || !categoriesRes.ok || !Array.isArray(productsJson.data) || !Array.isArray(categoriesJson.data)) {
      return NextResponse.json(
        { success: false, message: "Failed to build subcategories from ecom data" },
        { status: 500 }
      )
    }

    const categoryMap = new Map(categoriesJson.data.map((c) => [c.slug, c]))
    const grouped = new Map<string, { _id: string; subcategoryname: string; categoryid: string; category: string }>()
    for (const product of productsJson.data) {
      const categorySlug = product.category || ""
      const category = categoryMap.get(categorySlug)
      if (!category) continue
      for (const tag of product.tags || []) {
        if (!tag || tag.length < 3) continue
        const key = `${categorySlug}::${tag.toLowerCase()}`
        if (grouped.has(key)) continue
        grouped.set(key, {
          _id: `sub_${categorySlug}_${tag.toLowerCase()}`,
          subcategoryname: tag,
          categoryid: String(category._id),
          category: category.name,
        })
      }
    }

    const all = [...grouped.values()]
    const start = (pageno - 1) * pagelimit
    const rows = all.slice(start, start + pagelimit)
    return NextResponse.json({
      success: true,
      data: rows,
      totalCount: all.length,
      count: rows.length,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "subcategories_proxy_failed",
      },
      { status: 502 }
    )
  }
}
