import type { Product } from '@/types/product'
import { slugifyLabel } from '@/lib/slugify'

/**
 * Match products to a category route slug. Handles small slug mismatches (singular/plural,
 * API vs URL) by comparing normalized slugs and optional catalog rows.
 */
export function getProductsByCategory(
  products: Product[],
  categorySlug: string,
  catalogCategories?: { slug: string }[]
): Product[] {
  if (categorySlug === 'all') return products

  const routeNorm = slugifyLabel(categorySlug)
  const alt = new Set<string>()
  alt.add(categorySlug.trim().toLowerCase())
  alt.add(routeNorm)

  const row = catalogCategories?.find(
    (c) => c.slug === categorySlug || slugifyLabel(c.slug) === routeNorm
  )
  if (row) {
    alt.add(row.slug.trim().toLowerCase())
    alt.add(slugifyLabel(row.slug))
  }

  const stripTrailingS = (s: string) => (s.length > 1 ? s.replace(/s$/i, '') : s)

  return products.filter((product) => {
    const raw = product.category.trim().toLowerCase()
    const pNorm = slugifyLabel(product.category)
    if (alt.has(raw) || alt.has(pNorm)) return true
    if (pNorm === routeNorm) return true
    // e.g. necklaces vs necklace, rings vs ring
    if (
      routeNorm.length > 2 &&
      pNorm.length > 2 &&
      stripTrailingS(routeNorm) === stripTrailingS(pNorm)
    ) {
      return true
    }
    return false
  })
}

export function getProductById(products: Product[], id: string): Product | undefined {
  return products.find((product) => product.id === id)
}

export function getNewArrivals(products: Product[]): Product[] {
  return products.filter((product) => product.isNew)
}

export function getBestsellers(products: Product[]): Product[] {
  return products.filter((product) => product.isBestseller)
}

export function searchProducts(products: Product[], query: string): Product[] {
  const lowercaseQuery = query.toLowerCase()
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery)
  )
}

export function getProductsByIds(products: Product[], ids: string[]): Product[] {
  const order = new Map(ids.map((id, i) => [id, i]))
  return products
    .filter((p) => order.has(p.id))
    .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
}

export function getSaleProducts(products: Product[]): Product[] {
  return products.filter((p) => p.originalPrice != null && p.originalPrice > p.price)
}

/** Rounded % off from list price vs original (same idea as product cards). */
export function productDiscountPercent(product: Product): number | null {
  const orig = product.originalPrice
  if (orig == null || orig <= 0) return null
  if (product.price >= orig) return null
  return Math.round((1 - product.price / orig) * 100)
}

/** Rounded discount must equal `percent` (e.g. only exactly 50% off). */
export function getProductsWithDiscountPercent(products: Product[], percent: number): Product[] {
  if (!Number.isFinite(percent) || percent < 1 || percent > 99) return []
  return products.filter((p) => productDiscountPercent(p) === percent)
}

/**
 * “Up to {maxPercent}% off” — any on-sale item whose rounded % off is between 1 and maxPercent inclusive.
 * Matches typical hero/marketing copy; avoids empty PLPs when discounts are e.g. 15%, 30%, 45% instead of exactly 50%.
 */
export function getProductsWithDiscountUpTo(products: Product[], maxPercent: number): Product[] {
  if (!Number.isFinite(maxPercent) || maxPercent < 1 || maxPercent > 99) return []
  return products.filter((p) => {
    const d = productDiscountPercent(p)
    return d != null && d >= 1 && d <= maxPercent
  })
}

export function getBuyOneGetOneProducts(products: Product[]): Product[] {
  return products.filter((p) => p.buyOneGetOneFree === true)
}

/** Products tagged in Product Master → “Product Listed On” (`storefrontHomeSectionKeys`). */
/** Products tagged with a given Occasion Master id in Product Master. */
export function getProductsByOccasionId(products: Product[], occasionId: string): Product[] {
  const id = String(occasionId || "").trim()
  if (!id) return []
  return products.filter((p) => {
    const ids = p.occasionIds
    if (!Array.isArray(ids) || ids.length === 0) return false
    return ids.some((x) => String(x) === id)
  })
}

export function getProductsWithStorefrontSectionKey(products: Product[], key: string): Product[] {
  const k = String(key || '').trim()
  if (!k) return []
  return products.filter((p) => {
    const keys = p.storefrontHomeSectionKeys
    if (!Array.isArray(keys) || keys.length === 0) return false
    return keys.some((x) => String(x).trim() === k)
  })
}

/**
 * Normalizes Product Master / API gender strings for recipient PLPs.
 * Him → male-coded + both; Her → female-coded + both.
 */
function canonicalRecipientGender(gender: string | undefined): 'male' | 'female' | 'both' | 'other' {
  const raw = String(gender ?? 'Both').trim().toLowerCase()
  if (!raw || raw === 'both' || raw === 'unisex') return 'both'
  if (raw === 'man' || raw === 'male' || raw === 'men') return 'male'
  if (raw === 'woman' || raw === 'female' || raw === 'women') return 'female'
  return 'other'
}

function productMatchesRecipient(product: Product, recipient: 'her' | 'him'): boolean {
  const lane = canonicalRecipientGender(product.gender)
  if (lane === 'both') return true
  if (recipient === 'him') return lane === 'male'
  return lane === 'female'
}

function isGiftCategoryProduct(p: Product): boolean {
  const name = (p.categoryName?.trim() ?? '').toLowerCase()
  const slug = (p.category?.trim() ?? '').toLowerCase()
  return (
    name === 'gifts' ||
    name === 'gift' ||
    slug === 'gifts' ||
    slug === 'gift' ||
    slugifyLabel(p.categoryName ?? '') === 'gifts'
  )
}

/** Gifts category only; within that, male+Both (him) or female+Both (her). */
export function getProductsForRecipient(products: Product[], recipient: 'her' | 'him'): Product[] {
  return products.filter((p) => isGiftCategoryProduct(p) && productMatchesRecipient(p, recipient))
}
