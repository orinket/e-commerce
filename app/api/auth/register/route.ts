import { NextResponse } from "next/server"
import { resolveOrinketBackendOrigin } from "@/lib/publicApi/server/resolveBackendOrigin"

export async function POST(req: Request) {
  const base = resolveOrinketBackendOrigin()
  if (!base) return NextResponse.json({ success: false, message: "Backend not configured" }, { status: 500 })

  const parsed = await req.json().catch(() => null)
  if (!parsed) return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 })

  // Auto-generate username from email if not provided
  if (!parsed.username && parsed.email) {
    const base64 = parsed.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "")
    parsed.username = base64 + Math.floor(1000 + Math.random() * 9000)
  }

  const res = await fetch(`${base}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed),
  })

  const data = await res.json()
  const response = NextResponse.json(data, { status: res.status })

  const setCookie = res.headers.get("set-cookie")
  if (setCookie) response.headers.set("set-cookie", setCookie)

  return response
}
