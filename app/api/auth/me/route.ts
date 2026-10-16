import { NextResponse } from "next/server"
import { resolveOrinketBackendOrigin } from "@/lib/publicApi/server/resolveBackendOrigin"

export async function GET(req: Request) {
  const base = resolveOrinketBackendOrigin()
  if (!base) return NextResponse.json({ success: false, message: "Backend not configured" }, { status: 500 })

  const cookie = req.headers.get("cookie") ?? ""
  const auth = req.headers.get("authorization") ?? ""

  const headers: Record<string, string> = { cookie }
  if (auth) headers["authorization"] = auth

  const res = await fetch(`${base}/api/auth/me`, { headers })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
