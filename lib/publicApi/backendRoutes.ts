/** Paths on the Orinket Express app (mounted at /api). */
export const ORINKET_BACKEND_PUBLIC = {
  categories: "/api/public/categories",
  subcategories: "/api/public/subcategories",
  products: "/api/public/products",
  topStyles: "/api/public/top-styles",
  storeSettings: "/api/public/store-settings",
  sidebarMenu: "/api/public/sidebar-menu",
  productReviews: "/api/public/product-reviews",
  submitProductReview: "/api/public/product-reviews/submit",
  checkSpin: "/api/check-spin",
  spin: "/api/spin",
  promoValidate: "/api/promo/validate",
  settings: "/api/settings",
} as const

export const ORINKET_BACKEND_ECOM = {
  cart: "/api/ecom/cart",
  cartAdd: "/api/ecom/cart/add",
  cartUpdate: "/api/ecom/cart/update",
  orders: "/api/ecom/orders",
  paymentCreateOrder: "/api/ecom/payments/create-order",
  paymentVerify: "/api/ecom/payments/verify",
  recommendationUpsell: "/api/ecom/recommendations/cart-upsell",
  recommendationFbt: "/api/ecom/recommendations/frequently-bought-together",
  recommendationSimilar: "/api/ecom/recommendations/similar-products",
  recommendationCompleteLook: "/api/ecom/recommendations/complete-the-look",
  storefrontHome: "/api/ecom/storefront/home",
  storefrontTopStyles: "/api/ecom/storefront/top-styles",
  analyticsSummary: "/api/ecom/analytics/summary",
} as const

export const ORINKET_BACKEND_ADMIN = {
  sidebarMenu: "/api/sidebarmenu",
  sidebarMenuCategoryCreate: "/api/sidebarmenu/category/create",
  sidebarMenuCategoryUpdate: "/api/sidebarmenu/category/update",
  sidebarMenuCategoryDelete: "/api/sidebarmenu/category/delete",
  sidebarMenuSectionsReorder: "/api/sidebarmenu/sections/reorder",
  sidebarMenuVisibilityToggle: "/api/sidebarmenu/visibility/toggle",
} as const
