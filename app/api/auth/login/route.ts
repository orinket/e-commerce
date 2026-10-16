import { NextResponse } from "next/server"
import { resolveOrinketBackendOrigin } from "@/lib/publicApi/server/resolveBackendOrigin"

export async function POST(req: Request) {
  const base = resolveOrinketBackendOrigin()
  if (!base) return NextResponse.json({ success: false, message: "Backend not configured" }, { status: 500 })

  const body = await req.text()
  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })

  const data = await res.json()
  const response = NextResponse.json(data, { status: res.status })

  // Forward the HttpOnly token cookie set by the backend
  const setCookie = res.headers.get("set-cookie")
  if (setCookie) response.headers.set("set-cookie", setCookie)

  return response
}
