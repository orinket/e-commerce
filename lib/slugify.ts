/** URL slug from a display name (matches category routes like `/category/necklaces`). */
export function slugifyLabel(input: string): string {
  return String(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/['\u2019]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
