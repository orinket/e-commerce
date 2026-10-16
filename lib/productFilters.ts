import type { Product } from '@/types/product'

export interface FilterState {
  categories: string[]
  priceRange: { min: number; max: number } | null
  materials: string[]
  platings: string[]
  rating: number[]
  inStock: boolean
}

export function filterProducts(products: Product[], filters: FilterState): Product[] {
  return products.filter(product => {
    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
      return false
    }

    // Price range filter
    if (filters.priceRange) {
      if (product.price < filters.priceRange.min || product.price > filters.priceRange.max) {
        return false
      }
    }

    // Material filter
    if (filters.materials.length > 0 && (!product.material || !filters.materials.includes(product.material))) {
      return false
    }

    // Plating filter
    if (filters.platings.length > 0 && (!product.plating || !filters.platings.includes(product.plating))) {
      return false
    }

    // Rating filter
    if (filters.rating.length > 0) {
      const productRating = Number(product.rating || 0)
      const matchesAnySelectedRating = filters.rating.some((minRating) => productRating >= minRating)
      if (!matchesAnySelectedRating) {
        return false
      }
    }

    // Stock filter
    if (filters.inStock && !product.inStock) {
      return false
    }

    return true
  })
}

export function getFilterOptions(
  products: Product[],
  formatPrice: (amountInStorage: number) => string
) {
  const categories = [...new Set(products.map(p => p.category))]
  const materials = [...new Set(products.map(p => p.material).filter((m): m is string => Boolean(m)))]
  const platings = [...new Set(products.map(p => p.plating).filter((p): p is string => Boolean(p)))]
  const ratings = [4, 3, 2, 1] // Common rating thresholds
  
  const priceBounds: { min: number; max: number }[] = [
    { min: 0, max: 500 },
    { min: 500, max: 1000 },
    { min: 1000, max: 2000 },
    { min: 2000, max: 5000 },
    { min: 5000, max: 10000 },
    { min: 10000, max: Infinity },
  ]
  const bucketLabel = (min: number, max: number) => {
    if (!Number.isFinite(max) || max >= Number.MAX_SAFE_INTEGER / 2) {
      return `Over ${formatPrice(min)}`
    }
    if (min <= 0) {
      return `Under ${formatPrice(max)}`
    }
    return `${formatPrice(min)} – ${formatPrice(max)}`
  }
  const priceRanges = priceBounds.map(({ min, max }) => ({
    label: bucketLabel(min, max),
    min,
    max,
  }))

  return {
    categories,
    materials,
    platings,
    ratings,
    priceRanges,
  }
}
