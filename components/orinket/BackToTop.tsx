"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { fonts } from "@/lib/fonts"

const SHOW_AFTER_PX = 320

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  const onScroll = useCallback(() => {
    setVisible(typeof window !== "undefined" && window.scrollY > SHOW_AFTER_PX)
  }, [])

  useEffect(() => {
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [onScroll])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        // Mobile: sit above sticky bars (e.g. product page add-to-bag); desktop keeps corner placement
        "fixed bottom-[calc(7rem+env(safe-area-inset-bottom,0px))] right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-white shadow-lg transition-all duration-300 ease-out md:bottom-6 md:right-6",
        "hover:bg-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "touch-target", fonts.buttons,
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      )}
      aria-label="Back to top"
    >
      <ChevronUp className="h-5 w-5" strokeWidth={2.25} aria-hidden />
    </button>
  )
}
