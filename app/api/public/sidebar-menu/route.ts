import { ORINKET_BACKEND_PUBLIC } from "@/lib/publicApi/backendRoutes"
import { proxyOrinketBackendPost } from "@/lib/publicApi/server/proxyToBackend"

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}))
  return proxyOrinketBackendPost(ORINKET_BACKEND_PUBLIC.sidebarMenu, json)
}
