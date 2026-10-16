import manifest from "@/config/public-page-apis.json"
import { interpolateTemplates } from "@/lib/publicApi/pageApi/interpolateTemplates"
import { buildPathTemplateContext } from "@/lib/publicApi/pageApi/pathContext"
import type {
  JsonValue,
  PageWhen,
  PublicPageApiCallDef,
  PublicPageApisManifest,
} from "@/lib/publicApi/types/listing"

const m = manifest as PublicPageApisManifest

function whenMatches(when: PageWhen, pathname: string): boolean {
  switch (when.type) {
    case "exact":
      return pathname === when.path
    case "prefix":
      return (
        when.path != null &&
        (pathname === when.path || pathname.startsWith(`${when.path}/`))
      )
    case "regex":
      return when.pattern != null && new RegExp(when.pattern).test(pathname)
    case "catchAll":
      return true
    default:
      return false
  }
}

/** First matching page in manifest order wins. */
export function resolvePageApiCalls(pathname: string): PublicPageApiCallDef[] {
  const ctx = buildPathTemplateContext(pathname)
  for (const page of m.pages) {
    if (!whenMatches(page.when, pathname)) continue
    return page.calls.map(
      (call) =>
        interpolateTemplates(call as unknown as JsonValue, ctx) as PublicPageApiCallDef
    )
  }
  return []
}
