import type { RootState } from '@/store'
import type { Product } from '@/types/product'
import {
  getProductById,
  getProductsByCategory,
  searchProducts as searchCatalog,
} from '@/lib/catalogQueries'

export const selectTopStylesItems = (state: RootState) => state.topStyles.items
export const selectTopStylesStatus = (state: RootState) => state.topStyles.status
export const selectTopStylesError = (state: RootState) => state.topStyles.error
export const selectTopStylesTotalCount = (state: RootState) =>
  state.topStyles.totalCount

export const selectUiLoading = (state: RootState) => state.ui.loading

export const selectShowGridListShimmer = (state: RootState) =>
  Boolean(state.ui.loading.showGridListShimmer)

export const selectProducts = (state: RootState) => state.catalog.products

export const selectCatalogCategories = (state: RootState) =>
  state.catalog.categories

export const selectCatalogSubcategories = (state: RootState) =>
  state.catalog.subcategories

export const selectCatalogListingMeta = (state: RootState) =>
  state.catalog.listingMeta

export const selectCatalogShopFailed = (state: RootState) =>
  state.catalog.status.categories === "failed" ||
  state.catalog.status.products === "failed"

/** Nav + PLP: need categories + products; subcategories load in parallel but are not blocking. */
export const selectCatalogShopReady = (state: RootState) =>
  state.catalog.status.categories === "succeeded" &&
  state.catalog.status.products === "succeeded"

export const selectCatalogShopLoading = (state: RootState) => {
  const { categories, products } = state.catalog.status
  if (categories === "failed" || products === "failed") return false
  return (
    categories !== "succeeded" ||
    products !== "succeeded"
  )
}

export const selectCatalogShopError = (state: RootState) => {
  const { categories, products } = state.catalog.errors
  const parts = [categories, products].filter(Boolean) as string[]
  return parts.length ? parts.join(" · ") : null
}

/** @deprecated Prefer selectCatalogShopReady / resource-specific status */
export const selectCatalogStatus = (state: RootState) => state.catalog.status

/** @deprecated Prefer selectCatalogShopError */
export const selectCatalogError = selectCatalogShopError

export const selectProductById = (id: string) => (state: RootState) =>
  getProductById(state.catalog.products, id)

export const selectProductsByCategory = (category: string) => (state: RootState) =>
  getProductsByCategory(state.catalog.products, category)

export function selectRelatedForProduct(
  state: RootState,
  product: Product,
  limit = 4
): Product[] {
  return state.catalog.products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit)
}

export const selectSearchResults = (query: string) => (state: RootState) =>
  searchCatalog(state.catalog.products, query)

export const selectCartItems = (state: RootState) => state.cart.cartItems
export const selectWishlistItems = (state: RootState) => state.cart.wishlistItems

export const selectCartTotal = (state: RootState) =>
  state.cart.cartItems.reduce((total, item) => total + item.price * item.quantity, 0)

export const selectCartCount = (state: RootState) =>
  state.cart.cartItems.reduce((count, item) => count + item.quantity, 0)
