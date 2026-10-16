import { NextResponse } from "next/server"
import { resolveOrinketBackendOrigin } from "@/lib/publicApi/server/resolveBackendOrigin"

export async function proxyEcom(
  req: Request,
  backendPath: string,
  method: "GET" | "POST" | "PUT" | "DELETE"
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

  const incoming = new URL(req.url)
  const path = backendPath.startsWith("/") ? backendPath : `/${backendPath}`
  const target = new URL(`${base}${path}`)
  incoming.searchParams.forEach((value, key) => target.searchParams.set(key, value))

  const body = method === "GET" || method === "DELETE" ? undefined : await req.text()
  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
  }

  const sessionId = req.headers.get("x-session-id")
  if (sessionId) headers["x-session-id"] = sessionId
  const auth = req.headers.get("authorization")
  if (auth) headers["authorization"] = auth
  const cookie = req.headers.get("cookie")
  if (cookie) headers["cookie"] = cookie

  try {
    const res = await fetch(target.toString(), {
      method,
      headers,
      body,
      cache: "no-store",
    })
    const text = await res.text()
    let json: unknown = {}
    try {
      json = text ? (JSON.parse(text) as unknown) : {}
    } catch {
      json = { success: false, message: "Invalid JSON from backend", raw: text.slice(0, 200) }
    }
    return NextResponse.json(json, { status: res.status })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "ecom_proxy_failed",
      },
      { status: 502 }
    )
  }
}
