import { NextResponse } from "next/server"
import { resolveOrinketBackendOrigin } from "@/lib/publicApi/server/resolveBackendOrigin"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const base = resolveOrinketBackendOrigin()
  if (!base) {
    return NextResponse.json(
      { success: false, message: "Missing ORINKET_BACKEND_URL or NEXT_PUBLIC_API_URL" },
      { status: 500 }
    )
  }

  try {
    const res = await fetch(`${base}/api/public/occasions`, {
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
        { success: false, message: json.message || "Failed to load occasions" },
        { status: res.status || 500 }
      )
    }
    return NextResponse.json(json)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "occasions_proxy_failed",
      },
      { status: 502 }
    )
  }
}
