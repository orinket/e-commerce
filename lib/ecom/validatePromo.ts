import { ecomFetch } from "@/lib/ecom/client"

export type PromoValidateOk = { ok: true; discount: number; code: string; description?: string }
export type PromoValidateErr = { ok: false; message: string }
export type PromoValidateResult = PromoValidateOk | PromoValidateErr

type ApiShape = {
  success: boolean
  valid?: boolean
  message?: string
  discount?: number
  code?: string
  description?: string
}

export async function validatePromoCode(
  code: string,
  subtotal: number,
  totalQuantity: number
): Promise<PromoValidateResult> {
  const data = await ecomFetch<ApiShape>("/api/promo/validate", {
    method: "POST",
    body: JSON.stringify({
      code: String(code || "").trim(),
      subtotal,
      totalQuantity,
    }),
    sessionAware: false,
  })
  if (!data.success) {
    return { ok: false, message: data.message || "Unable to validate code" }
  }
  if (!data.valid) {
    return { ok: false, message: data.message || "Invalid or expired code" }
  }
  return {
    ok: true,
    discount: Math.max(0, Number(data.discount) || 0),
    code: String(data.code || "").trim() || String(code || "").trim(),
    description: typeof data.description === "string" ? data.description : undefined,
  }
}
