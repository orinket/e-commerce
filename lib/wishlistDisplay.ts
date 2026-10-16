import type { Product } from "@/types/product"

/** Deterministic demo stock 1–20 when `stockLeft` is not on the product. */
export function getEffectiveStockLeft(product: Product | undefined): number | null {
  if (!product) return null
  if (!product.inStock) return 0
  if (product.stockLeft != null) return product.stockLeft
  let h = 0
  for (let i = 0; i < product.id.length; i++) {
    h = (h * 31 + product.id.charCodeAt(i)) >>> 0
  }
  return (h % 20) + 1
}

export type StockTone = "out" | "low" | "ok"

export function getStockDisplay(product: Product | undefined): {
  label: string
  tone: StockTone
  disabled: boolean
} {
  if (!product) {
    return { label: "In stock", tone: "ok", disabled: false }
  }
  if (!product.inStock) {
    return { label: "Out of stock", tone: "out", disabled: true }
  }
  const left = getEffectiveStockLeft(product)
  if (left == null || left <= 0) {
    return { label: "Out of stock", tone: "out", disabled: true }
  }
  if (left <= 5) {
    return { label: `Few left (${left})`, tone: "low", disabled: false }
  }
  return { label: "In stock", tone: "ok", disabled: false }
}

export function formatAddedAgo(addedAt: number | undefined): string | null {
  if (addedAt == null || Number.isNaN(addedAt)) return null
  const sec = Math.floor((Date.now() - addedAt) / 1000)
  if (sec < 45) return "Added just now"
  if (sec < 3600) return `Added ${Math.floor(sec / 60)} min ago`
  if (sec < 86400) return `Added ${Math.floor(sec / 3600)} hr ago`
  if (sec < 86400 * 7) return `Added ${Math.floor(sec / 86400)} day${Math.floor(sec / 86400) === 1 ? "" : "s"} ago`
  return `Added ${new Date(addedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
}
