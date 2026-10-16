/** Values available for `{{key}}` placeholders inside `public-page-apis.json` strings. */
export function buildPathTemplateContext(pathname: string): Record<string, string> {
  const segments = pathname.split("/").filter(Boolean)
  return {
    pathname,
    segment0: segments[0] ?? "",
    segment1: segments[1] ?? "",
    segment2: segments[2] ?? "",
    categorySlug:
      segments[0] === "category" ? (segments[1] ?? "") : "",
    productId: segments[0] === "product" ? (segments[1] ?? "") : "",
  }
}
