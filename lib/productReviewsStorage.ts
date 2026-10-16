export interface StoredReview {
  id: string
  author: string
  rating: number
  title?: string
  text: string
  date: string
  verified?: boolean
}

type ReviewApiRow = {
  _id?: string
  reviewerName?: string
  rating?: number
  title?: string
  text?: string
  createdAt?: string
}

function mapRow(row: ReviewApiRow): StoredReview {
  return {
    id: String(row._id || ""),
    author: String(row.reviewerName || "Customer"),
    rating: Number(row.rating || 0),
    title: row.title ? String(row.title) : undefined,
    text: String(row.text || ""),
    date: String(row.createdAt || new Date().toISOString()),
    verified: false,
  }
}

export async function getUserReviewsForProduct(productId: string): Promise<StoredReview[]> {
  if (!productId) return []
  try {
    const res = await fetch("/api/public/product-reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        paginationinfo: {
          pageno: 1,
          pagelimit: 100,
          filter: { productId },
          sort: { createdAt: -1 },
        },
        searchtext: "",
      }),
      cache: "no-store",
    })
    const json = (await res.json().catch(() => null)) as {
      success?: boolean
      data?: ReviewApiRow[]
    } | null
    if (!res.ok || !json?.success || !Array.isArray(json.data)) return []
    return json.data.map(mapRow).filter((r) => r.id && r.text && r.author)
  } catch {
    return []
  }
}

export async function addUserReview(
  productId: string,
  input: {
    productName?: string
    author: string
    rating: number
    title?: string
    text: string
  }
): Promise<StoredReview | null> {
  if (!productId) return null
  try {
    const res = await fetch("/api/public/product-reviews/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        productId,
        productName: input.productName || "",
        reviewerName: input.author,
        rating: input.rating,
        title: input.title || "",
        text: input.text,
      }),
    })
    const json = (await res.json().catch(() => null)) as {
      success?: boolean
      data?: ReviewApiRow
    } | null
    if (!res.ok || !json?.success || !json.data) return null
    return mapRow(json.data)
  } catch {
    return null
  }
}

export function averageRating(reviews: { rating: number }[]): number {
  if (reviews.length === 0) return 0
  const sum = reviews.reduce((s, r) => s + r.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

export function formatReviewDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return iso
  }
}
