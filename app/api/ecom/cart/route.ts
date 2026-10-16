import { ORINKET_BACKEND_ECOM } from "@/lib/publicApi/backendRoutes"
import { proxyEcom } from "@/lib/ecom/proxyToEcomBackend"

export async function GET(req: Request) {
  return proxyEcom(req, ORINKET_BACKEND_ECOM.cart, "GET")
}
