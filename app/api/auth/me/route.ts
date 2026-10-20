import { NextResponse } from "next/server"
import { resolveOrinketBackendOrigin } from "@/lib/publicApi/server/resolveBackendOrigin"

export async function GET(req: Request) {
  try {
    const base = resolveOrinketBackendOrigin()
    if (!base) return NextResponse.json({ success: false, message: "Backend not configured" }, { status: 500 })

    const cookie = req.headers.get("cookie") ?? ""
    const auth = req.headers.get("authorization") ?? ""

    const headers: Record<string, string> = { cookie }
    if (auth) headers["authorization"] = auth

    const res = await fetch(`${base}/api/auth/me`, {
      headers,
      cache: "no-store",
    })
    const data = await res.json().catch(() => ({ success: false, message: "Invalid JSON from backend" }))
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : "auth_check_failed" },
      { status: 500 }
    )
  }
}
