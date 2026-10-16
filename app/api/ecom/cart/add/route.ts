import { ORINKET_BACKEND_ECOM } from "@/lib/publicApi/backendRoutes"
import { proxyEcom } from "@/lib/ecom/proxyToEcomBackend"

export async function POST(req: Request) {
  return proxyEcom(req, ORINKET_BACKEND_ECOM.cartAdd, "POST")
}
