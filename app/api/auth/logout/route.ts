import { NextResponse } from "next/server"
import { resolveOrinketBackendOrigin } from "@/lib/publicApi/server/resolveBackendOrigin"

export async function GET(req: Request) {
  const base = resolveOrinketBackendOrigin()
  if (!base) return NextResponse.json({ success: false, message: "Backend not configured" }, { status: 500 })

  const cookie = req.headers.get("cookie") ?? ""
  const res = await fetch(`${base}/api/auth/logout`, {
    headers: { cookie },
  })

  const data = await res.json()
  const response = NextResponse.json(data, { status: res.status })

  // Forward cookie-clear header from backend
  const setCookie = res.headers.get("set-cookie")
  if (setCookie) response.headers.set("set-cookie", setCookie)

  return response
}
