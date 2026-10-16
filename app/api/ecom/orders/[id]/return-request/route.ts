import { proxyEcom } from "@/lib/ecom/proxyToEcomBackend"

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  return proxyEcom(req, `/api/ecom/orders/${id}/return-request`, "PATCH")
}
