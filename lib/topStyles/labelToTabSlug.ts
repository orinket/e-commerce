import { slugifyLabel } from "@/lib/slugify"

/** UI label (Top Styles tabs) → API `tab` slug (matches CategoryMaster slugify(categoryname)). */
export const TOP_STYLE_LABEL_TO_TAB: Record<string, string> = {
  ALL: "all",
  NECKLACES: "necklaces",
  BRACELETS: "bracelets",
  EARRINGS: "earrings",
  RINGS: "rings",
  MENS: "men",
  MANGALSUTRA: "mangalsutra",
}

export function topStyleLabelToTab(label: string): string {
  const u = String(label || "")
    .trim()
    .toUpperCase()
  if (u === "ALL") return "all"
  if (TOP_STYLE_LABEL_TO_TAB[u]) return TOP_STYLE_LABEL_TO_TAB[u]
  const fromName = slugifyLabel(String(label || "").trim())
  return fromName || "all"
}

/** `VIEW ALL` href slug (same as category route segment). */
export function topStyleLabelToCategoryPath(label: string): string {
  return "/category/all"
}
