import type { Product } from "@/types/product"
import { slugifyLabel } from "@/lib/slugify"

export type ApiCategoryRow = {
  _id: string
  categoryname: string
  description?: string
  defaultdata?: boolean
}

export type ApiSubcategoryRow = {
  _id: string
  subcategoryname: string
  categoryid?: string
  category?: string
}

export type ApiProductRow = {
  _id: string
  productname: string
  price: number
  originalPrice: number
  buyOneGetOneFree?: boolean
  showIn925SilverPost?: boolean
  storefrontHomeSectionKeys?: string[]
  occasionids?: string[]
  occasions?: string[]
  categoryid?: string
  category?: string
  subcategory?: string
  images?: string[]
  description?: string
  instock?: number
  availableQty?: number
  material?: string
  plating?: string
  dimensions?: string
  weight?: string
  gender?: 'Man' | 'Woman' | 'Both'
  details?: string
  productdetails?: { details?: string }[]
}

export type CatalogCategoryRow = {
  id: string
  slug: string
  displayName: string
  description: string
  isDefault?: boolean
}

export type CatalogSubcategoryRow = {
  id: string
  slug: string
  displayName: string
  categoryId: string
  categorySlug: string
}

const PLACEHOLDER_IMAGE = "/placeholder.svg"

export function categoryNameById(categories: ApiCategoryRow[]): Map<string, string> {
  const m = new Map<string, string>()
  for (const c of categories) {
    m.set(String(c._id), c.categoryname)
  }
  return m
}

export function mapApiCategories(rows: ApiCategoryRow[]): CatalogCategoryRow[] {
  return rows.map((c) => {
    const displayName = c.categoryname?.trim() || "Category"
    const slug = slugifyLabel(displayName)
    return {
      id: String(c._id),
      slug,
      displayName,
      description:
        c.description?.trim() ||
        `Discover ${displayName.toLowerCase()} from our collection.`,
      isDefault: c.defaultdata === true,
    }
  })
}

export function mapApiSubcategories(
  rows: ApiSubcategoryRow[],
  categories: ApiCategoryRow[]
): CatalogSubcategoryRow[] {
  const nameById = categoryNameById(categories)
  return rows.map((s) => {
    const catId = s.categoryid ? String(s.categoryid) : ""
    const rawCatName = catId
      ? nameById.get(catId) || s.category || ""
      : s.category || ""
    const displayName = s.subcategoryname?.trim() || "Subcategory"
    return {
      id: String(s._id),
      slug: slugifyLabel(displayName),
      displayName,
      categoryId: catId,
      categorySlug: slugifyLabel(rawCatName) || "uncategorized",
    }
  })
}

function mapOneProduct(doc: ApiProductRow, nameByCatId: Map<string, string>): Product {
  const rawCat =
    (doc.category && String(doc.category).trim()) ||
    (doc.categoryid ? nameByCatId.get(String(doc.categoryid)) : undefined) ||
    ""
  const categorySlug = slugifyLabel(rawCat) || "uncategorized"
  const subcategory = doc.subcategory?.trim()
    ? slugifyLabel(doc.subcategory)
    : undefined

  const detailLines: string[] = []
  if (Array.isArray(doc.productdetails)) {
    for (const row of doc.productdetails) {
      const line = row?.details?.trim()
      if (line) detailLines.push(line)
    }
  }
  if (doc.details?.trim()) {
    for (const line of doc.details.split(/\r?\n/)) {
      const t = line.trim()
      if (t) detailLines.push(t)
    }
  }

  const images = Array.isArray(doc.images) ? doc.images.filter((u) => u && String(u).trim()) : []
  const primary = images[0] || PLACEHOLDER_IMAGE
  const sectionKeys = Array.isArray(doc.storefrontHomeSectionKeys)
    ? doc.storefrontHomeSectionKeys.map((k) => String(k).trim()).filter(Boolean)
    : []

  const rawQty =
    typeof doc.availableQty === "number" && Number.isFinite(doc.availableQty)
      ? Math.max(0, Math.floor(doc.availableQty))
      : undefined
  const legacyFlag = typeof doc.instock === "number" ? doc.instock : 1
  const available =
    rawQty !== undefined ? rawQty : legacyFlag > 0 ? 1 : 0

  return {
    id: String(doc._id),
    name: doc.productname,
    price: Number(doc.price) || 0,
    originalPrice:
      doc.originalPrice != null && Number(doc.originalPrice) > 0
        ? Number(doc.originalPrice)
        : undefined,
    buyOneGetOneFree: doc.buyOneGetOneFree === true,
    showIn925SilverPost: sectionKeys.includes("showIn925SilverPost") || doc.showIn925SilverPost === true,
    storefrontHomeSectionKeys: sectionKeys.length ? sectionKeys : undefined,
    occasionIds: Array.isArray(doc.occasionids)
      ? doc.occasionids.map((x) => String(x)).filter(Boolean)
      : undefined,
    occasions: Array.isArray(doc.occasions)
      ? doc.occasions.map((x) => String(x).trim()).filter(Boolean)
      : undefined,
    categoryId: doc.categoryid ? String(doc.categoryid) : undefined,
    category: categorySlug,
    categoryName: rawCat || undefined,
    subcategory,
    image: primary,
    images: images.length ? images : undefined,
    description: doc.description?.trim() || "",
    inStock: available > 0,
    stockLeft: available,
    material: doc.material?.trim() || undefined,
    plating: doc.plating?.trim() || undefined,
    dimensions: doc.dimensions?.trim() || undefined,
    weight: doc.weight?.trim() || undefined,
    gender: doc.gender || 'Both',
    details: detailLines.length ? detailLines : ["See description for details."],
  }
}

export function mapApiProducts(
  rows: ApiProductRow[],
  categories: ApiCategoryRow[]
): Product[] {
  const nameById = categoryNameById(categories)
  const isDefaultById = new Map<string, boolean>()
  for (const c of categories) {
    isDefaultById.set(String(c._id), c.defaultdata === true)
  }
  return rows.map((p) => {
    const product = mapOneProduct(p, nameById)
    if (product.categoryId) {
      product.isDefaultCategory = isDefaultById.get(product.categoryId) || false
    }
    return product
  })
}

/** Recompute derived nav + listing fields from raw API rows (call after any raw slice changes). */
export function deriveCatalogFromRaw(
  rawCategories: ApiCategoryRow[],
  rawSubcategories: ApiSubcategoryRow[],
  rawProducts: ApiProductRow[]
): {
  categories: CatalogCategoryRow[]
  subcategories: CatalogSubcategoryRow[]
  products: Product[]
} {
  return {
    categories: mapApiCategories(rawCategories),
    subcategories: mapApiSubcategories(rawSubcategories, rawCategories),
    products: mapApiProducts(rawProducts, rawCategories),
  }
}
