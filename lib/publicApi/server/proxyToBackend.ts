import { NextResponse } from "next/server"
import { resolveOrinketBackendOrigin } from "@/lib/publicApi/server/resolveBackendOrigin"

/**
 * Forward GET to the Node API (full path including `/api/...`).
 */
export async function proxyOrinketBackendGet(
  backendPath: string
): Promise<NextResponse> {
  const base = resolveOrinketBackendOrigin()
  if (!base) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Set ORINKET_BACKEND_URL or NEXT_PUBLIC_API_URL (e.g. http://127.0.0.1:5000 or https://your-app.up.railway.app/api).",
      },
      { status: 500 }
    )
  }

  const url = `${base}${backendPath.startsWith("/") ? "" : "/"}${backendPath}`

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    })
    const text = await res.text()
    let body: unknown
    try {
      body = JSON.parse(text) as unknown
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON from backend",
          raw: text.slice(0, 200),
        },
        { status: 502 }
      )
    }
    if (!res.ok) {
      return NextResponse.json(
        typeof body === "object" && body !== null ? body : { success: false, message: text },
        { status: res.status }
      )
    }
    return NextResponse.json(body)
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        message: e instanceof Error ? e.message : "backend_proxy_failed",
      },
      { status: 502 }
    )
  }
}

/**
 * Forward POST JSON to the Node API (listing-style bodies).
 */
export async function proxyOrinketBackendPost(
  backendPath: string,
  jsonBody: unknown
): Promise<NextResponse> {
  const base = resolveOrinketBackendOrigin()
  if (!base) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Set ORINKET_BACKEND_URL or NEXT_PUBLIC_API_URL (e.g. http://127.0.0.1:5000 or https://your-app.up.railway.app/api).",
      },
      { status: 500 }
    )
  }

  const url = `${base}${backendPath.startsWith("/") ? "" : "/"}${backendPath}`

  try {
    const res = await fetch(url, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonBody ?? {}),
    })
    const text = await res.text()
    let body: unknown
    try {
      body = JSON.parse(text) as unknown
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON from backend",
          raw: text.slice(0, 200),
        },
        { status: 502 }
      )
    }
    if (!res.ok) {
      return NextResponse.json(
        typeof body === "object" && body !== null ? body : { success: false, message: text },
        { status: res.status }
      )
    }
    return NextResponse.json(body)
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        message: e instanceof Error ? e.message : "backend_proxy_failed",
      },
      { status: 502 }
    )
  }
}
