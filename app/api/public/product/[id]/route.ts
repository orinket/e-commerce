import { NextResponse } from "next/server"
import { resolveOrinketBackendOrigin } from "@/lib/publicApi/server/resolveBackendOrigin"
import {
  mapApiProducts,
  type ApiProductRow,
} from "@/lib/publicApi/mappers/catalogFromApi"

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/

/** Map Ecom `GET /api/ecom/products/:id` payload → `ApiProductRow`. */
function ecomDetailToApiRow(d: Record<string, unknown>): ApiProductRow {
  const cat = d.category
  const slugOrRef =
    typeof cat === "string"
      ? cat
      : cat && typeof cat === "object" && "slug" in (cat as object)
        ? String((cat as { slug?: string }).slug ?? "")
        : ""
  const name =
    typeof d.categoryName === "string" && d.categoryName.trim()
      ? String(d.categoryName)
      : slugOrRef

  const imgs = Array.isArray(d.images)
    ? (d.images as unknown[]).filter((u): u is string => typeof u === "string" && u.trim() !== "")
    : typeof d.image === "string" && d.image
      ? [d.image]
      : []

  return {
    _id: String(d.id ?? ""),
    productname: String(d.name ?? ""),
    price: Number(d.price) || 0,
    originalPrice:
      d.originalPrice != null && Number(d.originalPrice) > 0
        ? Number(d.originalPrice)
        : Number(d.price) || 0,
    category: name,
    subcategory:
      Array.isArray(d.tags) && typeof d.tags[0] === "string" ? d.tags[0] : "",
    images: imgs,
    description: "",
    instock: d.inStock === true ? 1 : 0,
    availableQty: typeof d.stock === "number" ? d.stock : 0,
    material: "",
    plating: "",
    dimensions: "",
    weight: "",
    details: "",
    productdetails: [],
  }
}

/**
 * Single product for PDP when the id is not in the hydrated catalog (e.g. deep link with Mongo ObjectId).
 * 1) Product Master via POST /api/public/products with `_id` filter (keeps `categoryid`)
 * 2) Ecom product by id (fallback)
 */
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  if (!OBJECT_ID_RE.test(id)) {
    return NextResponse.json({ success: false, message: "Invalid product id" }, { status: 400 })
  }

  const base = resolveOrinketBackendOrigin()
  if (!base) {
    return NextResponse.json(
      { success: false, message: "Missing ORINKET_BACKEND_URL or NEXT_PUBLIC_API_URL" },
      { status: 500 }
    )
  }

  try {
    const pmRes = await fetch(`${base}/api/public/products`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        paginationinfo: {
          pageno: 1,
          pagelimit: 1,
          filter: { _id: id },
        },
        searchtext: "",
      }),
      cache: "no-store",
    })
    const pmJson = (await pmRes.json()) as {
      success?: boolean
      data?: ApiProductRow[]
      message?: string
    }
    if (
      pmRes.ok &&
      pmJson.success &&
      Array.isArray(pmJson.data) &&
      pmJson.data.length > 0
    ) {
      const [product] = mapApiProducts(pmJson.data, [])
      if (product) {
        return NextResponse.json({ success: true, data: product })
      }
    }
  } catch {
    /* try Ecom fallback */
  }

  try {
    const ecomRes = await fetch(`${base}/api/ecom/products/${encodeURIComponent(id)}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    })
    const ecomJson = (await ecomRes.json()) as {
      success?: boolean
      data?: Record<string, unknown>
      message?: string
    }
    if (ecomRes.ok && ecomJson.success && ecomJson.data && typeof ecomJson.data === "object") {
      const row = ecomDetailToApiRow(ecomJson.data)
      const [product] = mapApiProducts([row], [])
      if (product) {
        return NextResponse.json({ success: true, data: product })
      }
    }
  } catch {
    /* fall through */
  }

  return NextResponse.json(
    { success: false, message: "Product not found" },
    { status: 404 }
  )
}
