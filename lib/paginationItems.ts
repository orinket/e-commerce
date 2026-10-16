export type PaginationItem = number | "ellipsis"

/**
 * Compact page list: e.g. `1 2 3 4 … 14 15 16 … 26 27 28` instead of every page button.
 * Merges first pages, window around `current`, and last pages; inserts `ellipsis` for gaps.
 */
export function getPaginationItems(
  current: number,
  total: number,
  options?: { leadingCount?: number; trailingCount?: number; siblingCount?: number }
): PaginationItem[] {
  const leadingCount = options?.leadingCount ?? 4
  const trailingCount = options?.trailingCount ?? 3
  const siblingCount = options?.siblingCount ?? 1

  if (total < 1) return []
  const compactThreshold = leadingCount + trailingCount + 1
  if (total <= compactThreshold) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const set = new Set<number>()
  for (let i = 1; i <= Math.min(leadingCount, total); i++) set.add(i)
  for (
    let i = Math.max(1, current - siblingCount);
    i <= Math.min(total, current + siblingCount);
    i++
  ) {
    set.add(i)
  }
  for (let i = Math.max(1, total - trailingCount + 1); i <= total; i++) {
    set.add(i)
  }

  const sorted = [...set].sort((a, b) => a - b)
  const out: PaginationItem[] = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push("ellipsis")
    out.push(sorted[i])
  }
  return out
}
