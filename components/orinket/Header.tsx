"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Heart, ShoppingBag, User, Menu, X, GitCompare, LogOut, ChevronDown } from "lucide-react"
import { useCart } from "@/store/useCart"
import { useCompare } from "@/context/CompareContext"
import { useCurrency } from "@/context/CurrencyContext"
import { useStoreSettings } from "@/context/StoreSettingsContext"
import { useAuth } from "@/context/AuthContext"
import { useAppSelector } from "@/store/hooks"
import { selectCatalogCategories, selectProducts } from "@/store/selectors"
import { font } from "@/lib/fonts"
import SidebarDrawerMenu from "@/components/orinket/SidebarDrawerMenu"

export default function Header() {
  const { settings } = useStoreSettings()
  const {
    getTopBannerDesktopText,
    getTopBannerMobileText,
    getSecondaryBannerText,
  } = useCurrency()

  const showTopBanner = (settings?.showTopBanner ?? 1) === 1
  const showSecondaryBanner = (settings?.showSecondaryBanner ?? 1) === 1
  const storeName = settings?.storeName?.trim() || "ORINKET"

  const desktopBanner =
    settings?.topBannerDesktopText?.trim() || getTopBannerDesktopText()
  const mobileBanner =
    settings?.topBannerMobileText?.trim() || getTopBannerMobileText()
  const secondaryBanner =
    settings?.secondaryBannerText?.trim() || getSecondaryBannerText()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const router = useRouter()
  const { user, isLoggedIn, logout } = useAuth()
  const { cartCount, wishlistItems } = useCart()
  const { compareCount } = useCompare()
  const catalog = useAppSelector(selectProducts)
  const catalogCategoryRows = useAppSelector(selectCatalogCategories)
  const categories = useMemo(
    () =>
      catalogCategoryRows.map((c) => ({
        name: c.displayName.toUpperCase(),
        href: `/category/${c.id}`,
      })),
    [catalogCategoryRows]
  )
  const uniqueProductNames = Array.from(new Set(catalog.map((product) => product.name)))
  const popularSearchTags = useMemo(
    () => catalogCategoryRows.slice(0, 8).map((c) => c.displayName),
    [catalogCategoryRows]
  )
  const searchSuggestions =
    searchQuery.trim().length > 0
      ? uniqueProductNames
          .filter((name) => name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
          .slice(0, 8)
      : []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery("")
    }
  }

  const handleSuggestionClick = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`)
    setSearchOpen(false)
    setSearchQuery("")
  }

  const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (searchSuggestions.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveSuggestionIndex((prev) => (prev < searchSuggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : searchSuggestions.length - 1))
    } else if (e.key === "Enter" && activeSuggestionIndex >= 0) {
      e.preventDefault()
      setSearchQuery(searchSuggestions[activeSuggestionIndex])
      setActiveSuggestionIndex(-1)
    }
  }

  useEffect(() => {
    setActiveSuggestionIndex(-1)
  }, [searchQuery, searchOpen])

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    const closeMenuIfDesktop = () => {
      if (mq.matches) setMobileMenuOpen(false)
    }
    closeMenuIfDesktop()
    mq.addEventListener("change", closeMenuIfDesktop)
    return () => mq.removeEventListener("change", closeMenuIfDesktop)
  }, [])

  return (
    <header className="w-full relative z-40 bg-white">
      {/* Top Banner */}
      {showTopBanner && (
        <div className={`bg-[#2d2d2d] px-3 py-2 text-center text-xs leading-relaxed tracking-wide text-white sm:px-4 sm:text-sm ${font('body')}`}>
          <span className="hidden break-words md:inline">{desktopBanner}</span>
          <span className="break-words text-[11px] sm:text-xs md:hidden">{mobileBanner}</span>
        </div>
      )}

      {/* Secondary Banner */}
      {showSecondaryBanner && (
        <div className={`bg-gold-light px-3 py-2 text-center text-xs text-gold-dark sm:px-4 sm:text-sm ${font('body')}`}>
          <span className="block break-words text-[11px] leading-relaxed sm:text-xs md:text-sm">{secondaryBanner}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="relative flex min-w-0 items-center justify-between gap-2 py-3 sm:gap-3 sm:py-4">
            {/* Mobile: menu opens sidebar. lg+ same as desktop nav — hide control (.touch-target display:flex was overriding lg:hidden). */}
            <button
              type="button"
              className="z-10 flex h-12 w-12 shrink-0 items-center justify-center p-2.5 lg:!hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Logo — centered on mobile, left on lg+ */}
            <Link
              href="/"
              className="group absolute left-1/2 top-1/2 z-0 flex max-w-[calc(100vw-8rem)] min-w-0 -translate-x-1/2 -translate-y-1/2 flex-shrink lg:static lg:left-auto lg:top-auto lg:z-auto lg:max-w-none lg:translate-x-0 lg:translate-y-0"
            >
              <h1 className={`max-w-full truncate text-center text-xl font-semibold tracking-[0.24em] text-foreground transition-all duration-300 group-hover:scale-105 group-hover:text-gold-dark sm:text-2xl md:text-3xl lg:text-4xl ${font('headings')}`}>
                {storeName}
              </h1>
            </Link>

            {/* Balance hamburger width so logo stays visually centered */}
            <div className="h-12 w-12 shrink-0 lg:!hidden" aria-hidden />

            {/* Right Icons — desktop / tablet lg+ only */}
            <div className="hidden items-center gap-1 sm:gap-2 md:gap-4 lg:flex">
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 hover:text-gold-dark transition-all duration-300 touch-target"
                aria-label="Search"
              >
                <Search className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <Link
                href="/compare"
                className="p-2.5 hover:text-gold-dark transition-all duration-300 touch-target relative"
                aria-label={`Compare products${compareCount > 0 ? `, ${compareCount} selected` : ""}`}
              >
                <GitCompare className="w-5 h-5 sm:w-6 sm:h-6" />
                {hydrated && compareCount > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-bold text-white ${font('labels')}`}
                  >
                    {compareCount}
                  </span>
                )}
              </Link>
              <Link href="/wishlist" className="relative hidden p-2.5 transition-all duration-300 hover:text-gold-dark touch-target sm:block">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                {hydrated && wishlistItems.length > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-white text-xs font-bold ${font('labels')}`}
                  >
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
              {/* User icon / dropdown */}
              <div className="relative hidden md:block">
                {isLoggedIn && user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setUserMenuOpen((o) => !o)}
                      className="flex items-center gap-1.5 p-2.5 hover:text-gold-dark transition-all duration-300 touch-target"
                      aria-label="Account menu"
                    >
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full bg-gold/15 text-[11px] font-bold text-gold-dark ring-1 ring-gold/25 ${font('labels')}`}>
                        {user.firstname?.[0]?.toUpperCase() ?? <User className="h-4 w-4" />}
                      </span>
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                    </button>
                    {userMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} aria-hidden />
                        <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-border/60 bg-white shadow-[0_8px_32px_-8px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.04]">
                          <div className="border-b border-border/50 px-4 py-3">
                            <p className={`text-xs font-semibold text-foreground truncate ${font('labels')}`}>
                              {user.firstname} {user.lastname}
                            </p>
                            <p className={`mt-0.5 text-[11px] text-muted-foreground truncate ${font('body')}`}>
                              {user.email}
                            </p>
                          </div>
                          <div className="p-1.5">
                            <Link
                              href="/account"
                              onClick={() => setUserMenuOpen(false)}
                              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-cream hover:text-foreground ${font('body')}`}
                            >
                              <User className="h-4 w-4 shrink-0" />
                              My Account
                            </Link>
                            <button
                              type="button"
                              onClick={async () => {
                                setUserMenuOpen(false)
                                await logout()
                                router.refresh()
                              }}
                              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 ${font('body')}`}
                            >
                              <LogOut className="h-4 w-4 shrink-0" />
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <Link href="/account" className="p-2.5 hover:text-gold-dark transition-all duration-300 touch-target">
                    <User className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Link>
                )}
              </div>
              <Link href="/cart" className="p-2.5 hover:text-gold-dark transition-all duration-300 touch-target relative">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                {hydrated && cartCount > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gold px-1 text-xs font-bold text-white ${font('labels')}`}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Desktop Category Nav */}
          <nav className="hidden lg:flex items-center justify-center gap-8 py-4 border-t border-border">
            {categories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className={`text-xs tracking-wider text-foreground hover:text-gold-dark transition-all duration-300 whitespace-nowrap relative group ${font('navigation')}`}
              >
                {category.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-500 to-yellow-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-black/55 backdrop-blur-sm">
          <div className="border-b border-[#e7dcc8] bg-gradient-to-b from-[#fffefb] via-white to-[#fdf8ef] p-4 shadow-[0_18px_45px_rgba(38,24,8,0.18)] sm:p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-4 flex items-start justify-between gap-3">
                <p className={`pr-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark ${font('labels')}`}>
                  Search Orinket
                </p>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#e3d7c2] bg-white hover:bg-[#f8f2e6] transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSearch} className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex-1 w-full relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-dark/70" />
                  <input
                    type="text"
                    placeholder="Search for necklaces, earrings, rings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchInputKeyDown}
                    className={`w-full pl-12 pr-4 py-3.5 border border-[#d9c9ad] bg-[#fffcf6] rounded-xl focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm ${font('body')}`}
                    autoFocus
                  />
                  {searchSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-10 max-h-[min(18rem,50vh)] overflow-auto rounded-xl border border-[#e5dac8] bg-white shadow-[0_20px_40px_rgba(42,24,8,0.12)]">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          onMouseEnter={() => setActiveSuggestionIndex(index)}
                          className={`w-full px-4 py-2.5 text-left text-sm text-foreground transition-colors border-b border-[#f2ecdf] last:border-b-0 ${font('body')} ${
                            activeSuggestionIndex === index ? "bg-[#fff6e7]" : "hover:bg-[#fff6e7]"
                          }`}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className={`w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#1b0e09] via-[#2a1710] to-[#1b0e09] border border-[#3c2417] text-white text-sm tracking-[0.14em] hover:from-[#2b170f] hover:via-[#3a2217] hover:to-[#2b170f] transition-all rounded-xl touch-target shadow-[0_10px_24px_rgba(34,17,7,0.25)] ${font('buttons')}`}
                >
                  SEARCH
                </button>
              </form>

              {popularSearchTags.length > 0 ? (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {popularSearchTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        router.push(`/search?q=${encodeURIComponent(tag)}`)
                        setSearchOpen(false)
                      }}
                      className={`px-3 py-1.5 rounded-full border border-[#e4d8c3] bg-white text-xs text-foreground hover:border-gold hover:text-gold-dark hover:bg-[#fff8ea] transition-all ${font('labels')}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <SidebarDrawerMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} logoText={storeName} />
    </header>
  )
}

