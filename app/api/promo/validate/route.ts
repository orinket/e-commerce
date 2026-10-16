import { NextResponse } from "next/server"
import { ORINKET_BACKEND_PUBLIC } from "@/lib/publicApi/backendRoutes"
import { resolveOrinketBackendOrigin } from "@/lib/publicApi/server/resolveBackendOrigin"

export async function POST(req: Request) {
  const origin = resolveOrinketBackendOrigin()
  if (!origin) {
    return NextResponse.json({ success: false, message: "Backend URL is not configured" }, { status: 500 })
  }

  const incoming = await req.json().catch(() => ({} as Record<string, unknown>))

  let backendResponse: Response
  try {
    backendResponse = await fetch(`${origin}${ORINKET_BACKEND_PUBLIC.promoValidate}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(incoming),
      cache: "no-store",
    })
  } catch (e) {
    return NextResponse.json(
      { success: false, valid: false, message: e instanceof Error ? e.message : "backend_proxy_failed" },
      { status: 502 }
    )
  }

  const text = await backendResponse.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return NextResponse.json({ success: false, valid: false, message: "Invalid JSON from backend" }, { status: 502 })
  }

  return NextResponse.json(parsed, { status: backendResponse.status })
}
