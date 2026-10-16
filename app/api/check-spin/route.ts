import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { ORINKET_BACKEND_PUBLIC } from "@/lib/publicApi/backendRoutes"
import { resolveOrinketBackendOrigin } from "@/lib/publicApi/server/resolveBackendOrigin"

function jsonError(message: string, status = 500) {
  return NextResponse.json({ success: false, message }, { status })
}

export async function POST(req: Request) {
  const store = await cookies()
  const incoming = await req.json().catch(() => ({} as Record<string, unknown>))

  const existingSessionId = store.get("orinket_spin_session")?.value?.trim() ?? ""
  const session_id = existingSessionId || crypto.randomUUID()
  const email = typeof incoming.email === "string" ? incoming.email.trim().toLowerCase() : ""

  const origin = resolveOrinketBackendOrigin()
  if (!origin) {
    return jsonError("Backend URL is not configured", 500)
  }

  let backendResponse: Response
  try {
    backendResponse = await fetch(`${origin}${ORINKET_BACKEND_PUBLIC.checkSpin}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, session_id }),
      cache: "no-store",
    })
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "backend_proxy_failed", 502)
  }

  const text = await backendResponse.text()
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(text) as Record<string, unknown>
  } catch {
    return jsonError("Invalid JSON from backend", 502)
  }

  const response = NextResponse.json(parsed, { status: backendResponse.status })
  if (!existingSessionId) {
    response.cookies.set("orinket_spin_session", session_id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    })
  }
  return response
}
