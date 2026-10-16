import type { JsonValue } from "@/lib/publicApi/types/listing"

function interpolateString(s: string, ctx: Record<string, string>): string {
  return s.replace(/\{\{\s*([\w]+)\s*\}\}/g, (_, key: string) => {
    if (Object.prototype.hasOwnProperty.call(ctx, key)) {
      return ctx[key] ?? ""
    }
    return ""
  })
}

/** Deep-interpolate `{{categorySlug}}` etc. in strings (JSON manifest). */
export function interpolateTemplates<T extends JsonValue>(
  value: T,
  ctx: Record<string, string>
): T {
  if (value === null || value === undefined) return value
  if (typeof value === "string") {
    return interpolateString(value, ctx) as T
  }
  if (Array.isArray(value)) {
    return value.map((v) => interpolateTemplates(v as JsonValue, ctx)) as T
  }
  if (typeof value === "object") {
    const out: Record<string, JsonValue> = {}
    for (const [k, v] of Object.entries(value)) {
      out[k] = interpolateTemplates(v as JsonValue, ctx)
    }
    return out as T
  }
  return value
}
