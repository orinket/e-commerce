"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { fonts } from "@/lib/fonts"
import { getPaginationItems } from "@/lib/paginationItems"

type ProductListingPaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function ProductListingPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ProductListingPaginationProps) {
  if (totalPages <= 1) return null

  const items = getPaginationItems(currentPage, totalPages)

  return (
    <div className="mt-10 flex justify-center sm:mt-14">
      <div className="flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-2xl border border-stone-200/60 bg-white/80 px-2 py-2 shadow-sm backdrop-blur-sm sm:gap-2 sm:px-3">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex shrink-0 items-center gap-1 rounded-xl border border-stone-200/80 bg-white px-3 py-2.5 sm:gap-2 sm:px-4 ${fonts.buttons} text-sm text-stone-800 transition-colors hover:border-gold/40 hover:bg-cream/50 disabled:cursor-not-allowed disabled:opacity-45`}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex min-w-0 flex-nowrap items-center justify-center gap-0.5 sm:gap-1">
          {items.map((item, idx) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${idx}`}
                className={`select-none px-1.5 text-sm text-stone-400 sm:px-2 ${fonts.body}`}
                aria-hidden
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${fonts.buttons} text-sm tabular-nums transition-all ${
                  currentPage === item
                    ? "bg-gradient-to-br from-gold to-gold-dark font-semibold text-white shadow-md"
                    : "border border-stone-200/80 bg-white text-stone-700 hover:border-gold/35 hover:bg-cream/40"
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex shrink-0 items-center gap-1 rounded-xl border border-stone-200/80 bg-white px-3 py-2.5 sm:gap-2 sm:px-4 ${fonts.buttons} text-sm text-stone-800 transition-colors hover:border-gold/40 hover:bg-cream/50 disabled:cursor-not-allowed disabled:opacity-45`}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
