import { NextResponse } from "next/server"
import { resolveOrinketBackendOrigin } from "@/lib/publicApi/server/resolveBackendOrigin"

type BodyShape = {
  paginationinfo?: { pageno?: number; pagelimit?: number }
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as BodyShape
  const base = resolveOrinketBackendOrigin()
  if (!base) {
    return NextResponse.json(
      { success: false, message: "Missing ORINKET_BACKEND_URL or NEXT_PUBLIC_API_URL" },
      { status: 500 }
    )
  }

  try {
    // Use Product Master public categories so category IDs match `product.categoryid`.
    const res = await fetch(`${base}/api/public/categories`, {
      method: "POST",
      cache: "no-store",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body && typeof body === "object" ? body : {}),
    })
    const json = (await res.json()) as Record<string, unknown> & {
      success?: boolean
      data?: unknown[]
      message?: string
    }
    if (!res.ok || json.success === false || !Array.isArray(json.data)) {
      return NextResponse.json(
        { success: false, message: json.message || "Failed to load categories" },
        { status: res.status || 500 }
      )
    }
    return NextResponse.json(json)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "categories_proxy_failed",
      },
      { status: 502 }
    )
  }
}
