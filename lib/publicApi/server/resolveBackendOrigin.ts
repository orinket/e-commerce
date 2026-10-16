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
    return normalizeBackendOrigin(raw) || null
  }
  if (process.env.NODE_ENV === "development") {
    return "http://127.0.0.1:5000"
  }
  return null
}
