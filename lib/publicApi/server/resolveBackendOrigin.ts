/** Strip trailing `/api` so callers can keep using `${origin}/api/...`. */
function normalizeBackendOrigin(raw: string): string {
  let s = raw.trim().replace(/\/+$/, "")
  if (s.endsWith("/api")) {
    s = s.slice(0, -4).replace(/\/+$/, "")
  }
  return s
}

export function resolveOrinketBackendOrigin(): string | null {
  const raw =
    process.env.ORINKET_BACKEND_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim()
  if (raw) {
    const origin = normalizeBackendOrigin(raw)
    // In Vercel build/serverless environment, localhost or 127.0.0.1 is unreachable
    if (process.env.VERCEL && (origin.includes("localhost") || origin.includes("127.0.0.1"))) {
      return null
    }
    return origin || null
  }
  if (process.env.NODE_ENV === "development") {
    return "http://127.0.0.1:5002"
  }
  return null
}
