"use client"

import { Search, ChevronDown, X, Grid3x3, List, Filter, Sparkles, Check } from "lucide-react"
import type { ReactNode } from "react"
import { useState, useEffect, useRef } from "react"
import { fonts } from "@/lib/fonts"

/** Hero strip — same visual language as /search */
export function ProductListingHero({
  badge,
  title,
  subtitle,
}: {
  badge: string
  title: ReactNode
  subtitle: string
}) {
  return (
    <section className="mb-10 md:mb-12">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-stone-200/70 bg-gradient-to-br from-white via-cream/40 to-white shadow-[0_24px_64px_-28px_rgba(28,25,23,0.18)] ring-1 ring-stone-900/[0.04]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-90"
          style={{
            background: `radial-gradient(circle at center, color-mix(in oklab, var(--gold) 14%, transparent) 0%, transparent 70%)`,
          }}
        />
        <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-48 rounded-full bg-stone-900/[0.03] blur-2xl" />

        <div className="relative space-y-6 p-6 sm:p-8 lg:p-10">
          <div className="min-w-0 space-y-5 text-center lg:text-left">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-5 lg:justify-start">
              <span className={`inline-flex items-center gap-2 rounded-full border border-stone-200/90 bg-white/80 px-3.5 py-1.5 ${fonts.labels} text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-dark shadow-sm backdrop-blur-sm`}>
                <Sparkles className="h-3.5 w-3.5 text-gold" aria-hidden />
                {badge}
              </span>
              <span
                aria-hidden
                className="hidden h-px w-16 bg-gradient-to-r from-gold/40 to-transparent sm:block lg:w-24"
              />
            </div>

            <div className="space-y-3">
              <h1 className="font-serif text-[1.75rem] font-semibold leading-[1.15] tracking-tight text-stone-900 sm:text-3xl md:text-[2.125rem] lg:text-4xl">
                {title}
              </h1>
              <p className={`mx-auto max-w-full ${fonts.body} text-[15px] leading-relaxed text-stone-600 lg:mx-0`}>
                {subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const DEFAULT_SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
]

function SortSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const current = options.find((o) => o.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent | PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Sort products by: ${current.label}`}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-transparent px-2 py-1 text-left transition-colors hover:border-stone-200/60 hover:bg-white ${fonts.body} text-sm font-medium text-stone-900 focus:outline-none focus-visible:border-gold/40 focus-visible:ring-2 focus-visible:ring-gold/25`}
      >
        <span className="min-w-0 truncate">{current.label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-stone-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label="Sort options"
          className={`absolute left-0 right-0 top-full z-[60] mt-1.5 max-h-[min(20rem,calc(100dvh-10rem))] overflow-auto rounded-xl border border-stone-200/90 bg-white py-1.5 shadow-[0_16px_48px_-12px_rgba(28,25,23,0.22)] ring-1 ring-stone-900/[0.06] ${fonts.body}`}
        >
          {options.map((o) => {
            const selected = o.value === value
            return (
              <li key={o.value} role="presentation" className="px-1.5">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(o.value)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    selected
                      ? "bg-gradient-to-r from-gold-light/45 to-cream/90 font-semibold text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                      : "font-medium text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  <span className="flex min-w-0 flex-1 leading-snug">{o.label}</span>
                  {selected ? (
                    <Check className="h-4 w-4 shrink-0 text-gold-dark" strokeWidth={2.5} aria-hidden />
                  ) : (
                    <span className="h-4 w-4 shrink-0" aria-hidden />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

/** Toolbar — product count, optional search field, sort, grid/list (matches /search) */
export function ProductListingToolbar({
  productCount,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  showSearch = true,
  sortBy,
  onSortChange,
  sortOptions = DEFAULT_SORT_OPTIONS,
  viewMode,
  onViewModeChange,
  onOpenFiltersMobile,
  mobileFilterBadge = 0,
  extraCountSlot,
}: {
  productCount: number
  searchQuery: string
  onSearchChange: (q: string) => void
  onSearchSubmit: (e: React.FormEvent) => void
  onClearSearch: () => void
  showSearch?: boolean
  sortBy: string
  onSortChange: (v: string) => void
  sortOptions?: { value: string; label: string }[]
  viewMode: "grid" | "list"
  onViewModeChange: (m: "grid" | "list") => void
  onOpenFiltersMobile: () => void
  mobileFilterBadge?: number
  /** e.g. “3 filters applied” chip from category page */
  extraCountSlot?: ReactNode
}) {
  return (
    <div className="relative z-20 mb-5 overflow-visible rounded-2xl border border-stone-200/80 bg-white/90 p-3 shadow-[0_8px_40px_-14px_rgba(28,25,23,0.12)] backdrop-blur-sm ring-1 ring-stone-900/[0.04] sm:mb-7 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenFiltersMobile}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-stone-900 to-stone-800 px-4 py-2.5 text-white shadow-md transition-all duration-300 hover:shadow-lg"
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters</span>
            {mobileFilterBadge > 0 && (
              <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-semibold text-stone-900 shadow-sm">
                {mobileFilterBadge}
              </span>
            )}
          </button>

          <div className="flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl border border-stone-200/70 bg-cream/40 px-4 py-2.5">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <p className={`${fonts.body} text-sm font-medium text-stone-800`}>
              <span className="font-semibold tabular-nums">{productCount}</span>
              <span className="ml-1">products</span>
            </p>
            {extraCountSlot}
          </div>
        </div>

        <div className="flex min-w-0 w-full flex-col gap-3 sm:flex-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
          {showSearch && (
            <form
              onSubmit={onSearchSubmit}
              className="min-w-0 w-full sm:w-auto sm:max-w-[min(100%,22rem)]"
            >
              <div className="relative min-w-0">
                <button
                  type="submit"
                  className="absolute left-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-gold-dark/55 transition hover:bg-cream/60 hover:text-gold-dark"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4" />
                </button>
                <input
                  type="text"
                  name="q"
                  enterKeyHint="search"
                  autoComplete="off"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Necklaces, earrings, rings…"
                  className={`h-10 w-full min-w-0 rounded-xl border border-stone-200/90 bg-white py-2 pl-11 pr-9 ${fonts.body} text-sm text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20`}
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={onClearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            </form>
          )}

          <div className="flex min-w-0 flex-1 items-stretch gap-2 rounded-xl border border-stone-200/70 bg-white/80 px-2 py-1 sm:min-w-[220px] sm:flex-none lg:min-w-[260px]">
            <span className="flex shrink-0 items-center px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
              Sort
            </span>
            <SortSelect value={sortBy} onChange={onSortChange} options={sortOptions} />
          </div>

          <div className="flex items-center gap-0.5 rounded-xl border border-stone-200/70 bg-stone-100/80 p-1">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`rounded-lg p-2 transition-all ${
                viewMode === "grid"
                  ? "bg-gradient-to-br from-gold to-gold-dark text-white shadow-md"
                  : "text-stone-600 hover:bg-white hover:text-stone-900"
              }`}
              title="Grid view"
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={`rounded-lg p-2 transition-all ${
                viewMode === "list"
                  ? "bg-gradient-to-br from-gold to-gold-dark text-white shadow-md"
                  : "text-stone-600 hover:bg-white hover:text-stone-900"
              }`}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Outer wrapper: gradient + max width + hero + main column; filter opens as a fixed drawer (see filterDrawer) */
export function ProductListingShell({
  hero,
  filterDrawer,
  children,
}: {
  hero: ReactNode
  filterDrawer: ReactNode
  children: ReactNode
}) {
  return (
    <div className="relative min-w-0 flex-1 bg-gradient-to-b from-cream via-background to-cream-dark/50">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, color-mix(in oklab, var(--gold) 18%, transparent), transparent 55%)`,
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 md:pb-12 md:pt-10">
        {hero}

        <div className="mx-auto w-full max-w-[1400px] overflow-visible">
          <div className="min-w-0 overflow-visible">{children}</div>
        </div>
      </div>
      {filterDrawer}
    </div>
  )
}
