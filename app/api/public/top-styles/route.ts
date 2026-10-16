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
    const res = await fetch(`${base}/api/public/top-styles`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body && typeof body === "object" ? body : {}),
      cache: "no-store",
    })
    const json = (await res.json()) as Record<string, unknown>
    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            typeof json.message === "string"
              ? json.message
              : `top_styles_backend_${res.status}`,
        },
        { status: res.status }
      )
    }
    return NextResponse.json(json)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "top_styles_proxy_failed",
      },
      { status: 502 }
    )
  }
}
