/** Next.js App Router proxies — browser & server components call these (same origin). */
export const STOREFRONT_PUBLIC_API = {
  categories: "/api/public/categories",
  subcategories: "/api/public/subcategories",
  products: "/api/public/products",
  topStyles: "/api/public/top-styles",
} as const
