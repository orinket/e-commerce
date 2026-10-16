"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAppDispatch } from "@/store/hooks"
import { fetchPublicListing } from "@/store/slices/catalogSlice"
import { resolvePageApiCalls } from "@/lib/publicApi/pageApi/resolvePageApiCalls"

/** Survives Strict Mode remount in dev so the same pathname does not dispatch twice. */
let lastCatalogFetchPathname = ""

/**
 * Reads `config/public-page-apis.json` for the current pathname and dispatches
 * listing POSTs (pagination / sort / filter / projection / search) per page.
 */
export function PublicPageApiCoordinator() {
  const pathname = usePathname() ?? ""
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!pathname || lastCatalogFetchPathname === pathname) return
    lastCatalogFetchPathname = pathname

    const calls = resolvePageApiCalls(pathname)
    for (const call of calls) {
      dispatch(
        fetchPublicListing({
          resource: call.resource,
          paginationinfo: call.paginationinfo as Record<string, unknown> | undefined,
          searchtext: call.searchtext ?? "",
          skipIfLoaded: call.skipIfLoaded ?? false,
        })
      )
    }
  }, [pathname, dispatch])

  return null
}
