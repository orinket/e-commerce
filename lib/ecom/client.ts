const SESSION_KEY = "orinket_session_id"

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server-session"
  const existing = window.localStorage.getItem(SESSION_KEY)
  if (existing) return existing
  const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  window.localStorage.setItem(SESSION_KEY, id)
  return id
}

export async function ecomFetch<T>(
  path: string,
  options: RequestInit & { sessionAware?: boolean } = {}
): Promise<T> {
  const headers = new Headers(options.headers || {})
  headers.set("Content-Type", "application/json")
  if (options.sessionAware !== false) {
    headers.set("x-session-id", getOrCreateSessionId())
  }
  const res = await fetch(path, { ...options, headers, credentials: "include" })
  const json = (await res.json()) as T
  return json
}
