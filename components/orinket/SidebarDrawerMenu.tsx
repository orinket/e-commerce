"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { X, User, LogOut } from "lucide-react"
import styles from "./SidebarDrawerMenu.module.css"
import { useAuth } from "@/context/AuthContext"

type SidebarTab = {
  id: string
  label: string
  isVisible?: boolean
}

type SidebarCategory = {
  id: string
  name: string
  href: string
  imageUrl?: string
  isVisible?: boolean
}

type SidebarOccasion = {
  id: string
  name: string
  href: string
  imageUrl?: string
  isVisible?: boolean
}

type SidebarSectionItem = {
  label: string
  href: string
  imageUrl?: string
}

type SidebarSection = {
  id: string
  title: string
  items?: SidebarSectionItem[]
  isVisible?: boolean
}

type SidebarFooterLink = {
  id: string
  label: string
  href: string
  isVisible?: boolean
}

type SidebarMenuPayload = {
  tabs: SidebarTab[]
  categories: SidebarCategory[]
  occasions?: SidebarOccasion[]
  sections: SidebarSection[]
  footerLinks?: SidebarFooterLink[]
}

type SidebarMenuResponse = {
  success?: boolean
  data?: SidebarMenuPayload
  message?: string
}

type SidebarDrawerMenuProps = {
  open: boolean
  onClose: () => void
  logoText: string
}

const FALLBACK_FOOTER: SidebarFooterLink[] = [
  { id: "return-exchange", label: "Return & Exchange", href: "/returns" },
  { id: "about-us", label: "About Us", href: "/about" },
  { id: "support", label: "Support", href: "/contact" },
]

export default function SidebarDrawerMenu({ open, onClose, logoText }: SidebarDrawerMenuProps) {
  const { user, isLoggedIn, logout } = useAuth()
  const router = useRouter()
  const [activeTabId, setActiveTabId] = useState<string>("")
  const [expandedSectionIds, setExpandedSectionIds] = useState<Set<string>>(new Set())
  const [menuData, setMenuData] = useState<SidebarMenuPayload | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorText, setErrorText] = useState("")

  const tabs = useMemo(
    () => (menuData?.tabs || []).filter((tab) => tab.isVisible !== false),
    [menuData?.tabs]
  )
  const categories = useMemo(
    () => (menuData?.categories || []).filter((category) => category.isVisible !== false),
    [menuData?.categories]
  )
  const sections = useMemo(
    () => (menuData?.sections || []).filter((section) => section.isVisible !== false),
    [menuData?.sections]
  )
  const footerLinks = useMemo(() => {
    const links = (menuData?.footerLinks || FALLBACK_FOOTER).filter((link) => link.isVisible !== false)
    return links.length > 0 ? links : FALLBACK_FOOTER
  }, [menuData?.footerLinks])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onClose])

  useEffect(() => {
    let active = true
    if (!open) return

    const loadMenu = async () => {
      if (menuData) return
      setIsLoading(true)
      setErrorText("")
      try {
        const response = await fetch("/api/public/sidebar-menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        })
        const json = (await response.json().catch(() => ({}))) as SidebarMenuResponse
        if (!active) return
        if (!response.ok || !json?.data) {
          throw new Error(json?.message || "Could not load menu")
        }
        setMenuData(json.data)
      } catch (error) {
        if (!active) return
        setErrorText(error instanceof Error ? error.message : "Could not load menu")
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadMenu()
    return () => {
      active = false
    }
  }, [open, menuData])

  useEffect(() => {
    if (!tabs.length) return
    if (activeTabId && tabs.some((tab) => tab.id === activeTabId)) return
    setActiveTabId(tabs[0]?.id || "")
  }, [tabs, activeTabId])

  const toggleSection = (id: string) => {
    setExpandedSectionIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }
  return (
    <div
      className={`${styles.overlay} ${open ? styles.overlayOpen : ""}`}
      onClick={onClose}
      aria-hidden={!open}
    >
      <aside
        className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar menu"
      >
        <div className={styles.header}>
          <div className={styles.logo}>{logoText}</div>
          <button className={styles.closeBtn} type="button" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        {/* User strip */}
        {isLoggedIn && user ? (
          <div className={styles.userStrip}>
            <div className={styles.userAvatar}>
              {user.firstname?.[0]?.toUpperCase() ?? <User size={16} />}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.firstname} {user.lastname}</span>
              <span className={styles.userEmail}>{user.email}</span>
            </div>
            <button
              type="button"
              className={styles.signOutBtn}
              onClick={async () => {
                onClose()
                await logout()
                router.refresh()
              }}
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link href="/account" className={styles.signInLink} onClick={onClose}>
            <User size={15} />
            Sign In / Register
          </Link>
        )}

        <div className={styles.tabRow}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tabButton} ${activeTabId === tab.id ? styles.tabActive : ""}`}
              onClick={() => setActiveTabId(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.content}>
          <section className={styles.sectionBlock}>
            <div className={styles.sectionTitleRow}>
              <h3 className={styles.sectionTitle}>Shop by Category</h3>
              <span className={styles.sectionIcon}>-</span>
            </div>

            {isLoading ? (
              <div className={styles.categoryGrid}>
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={`skeleton-${index}`} className={styles.categoryCardSkeleton} />
                ))}
              </div>
            ) : categories.length > 0 ? (
              <div className={styles.categoryGrid}>
                {categories.map((category) => (
                  <Link key={category.id} href={category.href || "#"} className={styles.categoryCard} onClick={onClose}>
                    <span className={styles.categoryName}>{category.name}</span>
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className={styles.categoryImage}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className={styles.imagePlaceholder} />
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.emptyText}>{errorText || "No categories found."}</div>
            )}
          </section>

          <div className={styles.viewAllWrap}>
            <Link href="/category/all" className={styles.viewAllLink} onClick={onClose}>
              View all
            </Link>
          </div>

          <section className={styles.accordionList}>
            {(isLoading ? [] : sections).map((section) => {
              const isOpen = expandedSectionIds.has(section.id)
              const hasItems = Array.isArray(section.items) && section.items.length > 0
              const hasImageItems = hasItems && section.items!.some((item) => Boolean(item.imageUrl))
              const itemCount = section.items?.length || 0
              const sectionId = String(section.id || "").toLowerCase()
              const bodyLarge =
                hasImageItems && (itemCount >= 4 || sectionId === "shop-by-occasion")
              return (
                <div key={section.id} className={styles.accordionItem}>
                  <button
                    className={styles.accordionHeader}
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    aria-expanded={isOpen}
                    aria-controls={`section-${section.id}`}
                  >
                    <span>{section.title}</span>
                    <span className={styles.toggleIcon}>{isOpen ? "-" : "+"}</span>
                  </button>
                  <div
                    id={`section-${section.id}`}
                    className={`${styles.accordionBody} ${isOpen ? styles.accordionBodyOpen : ""} ${
                      bodyLarge ? styles.accordionBodyLarge : ""
                    }`}
                  >
                    {hasItems ? (
                      hasImageItems ? (
                        <>
                          <div className={styles.categoryGrid}>
                            {section.items!.map((item) => (
                              <Link
                                key={`${section.id}-${item.href}-${item.label}`}
                                href={item.href || "#"}
                                className={styles.categoryCard}
                                onClick={onClose}
                              >
                                <span className={styles.categoryName}>{item.label}</span>
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.label}
                                    className={styles.categoryImage}
                                    loading="lazy"
                                    decoding="async"
                                  />
                                ) : (
                                  <span className={styles.imagePlaceholder} />
                                )}
                              </Link>
                            ))}
                          </div>
                          {/* View all for Shop by Occasion removed */}
                        </>
                      ) : (
                        <div className={styles.accordionLinks}>
                          {section.items!.map((item) => (
                            <Link
                              key={`${section.id}-${item.href}-${item.label}`}
                              href={item.href || "#"}
                              className={styles.accordionLink}
                              onClick={onClose}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      )
                    ) : (
                      <p className={styles.accordionPlaceholder}>Explore this collection</p>
                    )}
                  </div>
                </div>
              )
            })}
          </section>
        </div>

        <footer className={styles.footer}>
          {footerLinks.map((link) => (
            <Link key={link.id} href={link.href || "#"} className={styles.footerLink} onClick={onClose}>
              {link.label}
            </Link>
          ))}
        </footer>
      </aside>
    </div>
  )
}
