"use client"

import { useState, use, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  Shield,
  Star,
  Minus,
  Plus,
  ChevronRight,
  Check,
  Share2,
  Copy,
  ZoomIn,
  X,
  Package,
  Ruler,
  Scale,
  Sparkles,
  Award,
  Clock,
  ChevronDown,
  GitCompare,
  MoveHorizontal,
} from "lucide-react"
import Header from "@/components/orinket/Header"
import Footer from "@/components/orinket/Footer"
import ProductVideoAnd360 from "@/components/orinket/ProductVideoAnd360"
import Product360View from "@/components/orinket/Product360View"
import ProductReviewsPanel from "@/components/orinket/ProductReviewsPanel"
import type { Product } from "@/types/product"
import { getProductById } from "@/lib/catalogQueries"
import ProductCard from "@/components/orinket/ProductCard"
import { useCart } from "@/store/useCart"
import { useAppSelector } from "@/store/hooks"
import { selectCatalogShopLoading } from "@/store/selectors"
import { useCompare } from "@/context/CompareContext"
import { PRODUCT_FAQ } from "@/lib/productDetailMock"
import { useTimedAdded, useTimedHint } from "@/hooks/useTimedAdded"
import { useCurrency } from "@/context/CurrencyContext"
import { font } from "@/lib/fonts"
import { ecomFetch } from "@/lib/ecom/client"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/

export default function ProductPage({ params }: ProductPageProps) {
  const { formatPrice } = useCurrency()
  const { id } = use(params)
  const catalog = useAppSelector((s) => s.catalog.products)
  const shopLoading = useAppSelector(selectCatalogShopLoading)

  const catalogProduct = useMemo(() => getProductById(catalog, id), [catalog, id])
  const [remoteProduct, setRemoteProduct] = useState<Product | null>(null)
  const [reviewSummary, setReviewSummary] = useState({ avg: 0, count: 0 })
  /** False until catalog+remote lookup settles (avoids flashing “not found” before fetch). */
  const [remoteFetchDone, setRemoteFetchDone] = useState(false)

  const product = catalogProduct ?? remoteProduct

  useEffect(() => {
    setReviewSummary({
      avg: Number(product?.rating || 0),
      count: Number(product?.reviews || 0),
    })
  }, [product?.id, product?.rating, product?.reviews])

  useEffect(() => {
    setRemoteProduct(null)
    setRemoteFetchDone(false)
  }, [id])

  useEffect(() => {
    if (catalogProduct) return
    if (shopLoading) return
    if (!OBJECT_ID_RE.test(id)) {
      setRemoteFetchDone(true)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/public/product/${encodeURIComponent(id)}`, {
          cache: "no-store",
        })
        const json = (await res.json()) as { success?: boolean; data?: Product }
        if (cancelled) return
        if (res.ok && json.success && json.data) {
          setRemoteProduct(json.data)
        } else {
          setRemoteProduct(null)
        }
      } catch {
        if (!cancelled) setRemoteProduct(null)
      } finally {
        if (!cancelled) setRemoteFetchDone(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, catalogProduct, shopLoading])
  const relatedProducts = useMemo(
    () =>
      product
        ? catalog
            .filter((p) => p.category === product.category && p.id !== product.id)
            .slice(0, 4)
        : [],
    [catalog, product]
  )
  const [apiRecommendations, setApiRecommendations] = useState<{
    similar: Product[]
    frequentlyBought: Product[]
    completeLook: Product[]
  }>({ similar: [], frequentlyBought: [], completeLook: [] })

  const [selectedImage, setSelectedImage] = useState(0)
  const [show360, setShow360] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("specifications")
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pincode, setPincode] = useState("")
  const [pincodeResult, setPincodeResult] = useState<string | null>(null)
  const [faqOpen, setFaqOpen] = useState<number | null>(0)
  const [recentIds, setRecentIds] = useState<string[]>([])
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart()

  const recentProducts = useMemo(() => {
    return recentIds
      .map((rid) => catalog.find((p) => p.id === rid))
      .filter((p): p is Product => Boolean(p))
  }, [recentIds, catalog])
  const { addToCompare, isInCompare } = useCompare()
  const bagAdded = useTimedAdded()
  const compareAdded = useTimedAdded()
  const compareHint = useTimedHint()

  useEffect(() => {
    if (!product?.id) return
    try {
      const key = "orinket_recent"
      const raw = localStorage.getItem(key)
      const ids: string[] = raw ? JSON.parse(raw) : []
      const next = [product.id, ...ids.filter((x) => x !== product.id)].slice(0, 8)
      localStorage.setItem(key, JSON.stringify(next))
      setRecentIds(next.filter((x) => x !== product.id).slice(0, 4))
    } catch {
      setRecentIds([])
    }
  }, [product?.id])

  useEffect(() => {
    if (!product?.id) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/public/product-reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            paginationinfo: {
              pageno: 1,
              pagelimit: 1,
              filter: { productId: product.id },
              sort: { createdAt: -1 },
            },
            searchtext: "",
          }),
        })
        const json = (await res.json().catch(() => null)) as
          | { success?: boolean; totalCount?: number; averageRating?: number }
          | null
        if (!cancelled && res.ok && json?.success) {
          setReviewSummary({
            avg: Number(json.averageRating || 0),
            count: Number(json.totalCount || 0),
          })
        }
      } catch {
        // keep fallback summary from product payload
      }
    })()
    return () => {
      cancelled = true
    }
  }, [product?.id])

  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false)
    }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [lightboxOpen])

  useEffect(() => {
    if (!product) return
    const mapToProduct = (p: {
      id: string
      name: string
      price: number
      originalPrice?: number
      category?: string
      image?: string
      images?: string[]
      stock?: number
      inStock?: boolean
    }): Product => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      category: p.category || product.category,
      image: p.image || "/images/product-necklace-1.jpg",
      images: p.images || (p.image ? [p.image] : []),
      description: "",
      inStock: p.inStock ?? true,
      stockLeft: p.stock,
      details: ["Recommended for your style"],
    })

    const loadRecommendations = async () => {
      const [similarRes, fbtRes, completeRes] = await Promise.all([
        ecomFetch<{ success: boolean; data?: Array<any> }>(
          `/api/ecom/recommendations/similar-products?productId=${product.id}`
        ),
        ecomFetch<{ success: boolean; data?: Array<any> }>(
          `/api/ecom/recommendations/frequently-bought-together?productId=${product.id}`
        ),
        ecomFetch<{ success: boolean; data?: Array<any> }>(
          `/api/ecom/recommendations/complete-the-look?productId=${product.id}`
        ),
      ])
      setApiRecommendations({
        similar: (similarRes.data || []).map(mapToProduct).slice(0, 4),
        frequentlyBought: (fbtRes.data || []).map(mapToProduct).slice(0, 4),
        completeLook: (completeRes.data || []).map(mapToProduct).slice(0, 4),
      })
    }
    loadRecommendations()
  }, [product?.id])

  const needsRemoteLookup =
    !catalogProduct && OBJECT_ID_RE.test(id) && !remoteFetchDone
  const showBlockingLoader = !product && (shopLoading || needsRemoteLookup)

  if (showBlockingLoader) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-24">
          <p className={`text-sm text-stone-600 ${font("body")}`}>Loading product…</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-16 w-full">
          <div className="text-center">
            <h1 className={`text-3xl md:text-4xl font-semibold text-foreground mb-4 ${font('headings')}`}>
              Product Not Found
            </h1>
            <p className={`text-muted-foreground mb-8 ${font('body')}`}>
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Link
              href="/"
              className={`inline-block py-3 px-8 bg-foreground text-white tracking-wider hover:bg-gold-dark transition-colors ${font('buttons')}`}
            >
              BACK TO HOME
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const inWishlist = isInWishlist(product.id)
  const images = product.images || [product.image]
  const view360Frames =
    product.view360Images && product.view360Images.length >= 2
      ? product.view360Images
      : images.length >= 2
        ? [...images, ...images].slice(0, 12)
        : []

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      stockLeft: product.stockLeft,
    }, quantity)
    bagAdded.pulse()
  }

  const handleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        category: product.category,
        stockLeft: product.stockLeft,
      })
    }
  }

  const copyProductLink = async () => {
    const url = typeof window !== "undefined" ? window.location.href : ""
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const shareProduct = async () => {
    const url = typeof window !== "undefined" ? window.location.href : ""
    const title = product.name
    try {
      if (navigator.share) {
        await navigator.share({ title, text: `Check out ${title} on Orinket`, url })
      } else {
        await copyProductLink()
      }
    } catch {
      /* user cancelled or share failed */
    }
  }

  const handleCompare = () => {
    if (isInCompare(product.id)) return
    const ok = addToCompare(product.id)
    if (ok) compareAdded.pulse()
    else compareHint.show("You can compare up to 4 products.")
  }

  const checkPincode = () => {
    const clean = pincode.replace(/\D/g, "").slice(0, 6)
    setPincode(clean)
    if (clean.length !== 6) {
      setPincodeResult("Enter a valid 6-digit pincode.")
      return
    }
    const last = parseInt(clean.slice(-1), 10)
    const days = 5 + (last % 3)
    setPincodeResult(`Estimated delivery: ${days}–${days + 2} business days to pincode ${clean}.`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gradient-to-b from-cream/80 via-background to-background pb-24 md:pb-0">
        {/* Breadcrumb */}
        <div className="border-b border-border/60 bg-background/70 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-2.5">
            <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground ${font('body')}`}>
              <Link href="/" className="hover:text-gold-dark transition-colors tracking-wide">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
              <Link
                href={`/category/${product.categoryId || "all"}`}
                className="hover:text-gold-dark transition-colors capitalize tracking-wide"
              >
                {product.category.replace("-", " ")}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
              <span className="text-foreground/90 font-medium line-clamp-1">{product.name}</span>
            </div>
          </div>
        </div>

        {/* Product Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-8 md:pt-5 md:pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] items-start gap-6 md:gap-8 lg:gap-12 xl:gap-16">
            {/* Image Gallery */}
            <div className="flex w-full flex-col md:flex-row md:items-start gap-4 md:gap-5 lg:sticky lg:top-28">
              {/* Thumbnails — desktop column */}
              <div className="hidden md:flex flex-col gap-3 order-2 md:order-1">
                {images.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setSelectedImage(index)
                      setShow360(false)
                    }}
                    className={`relative w-[4.5rem] h-[4.5rem] shrink-0 rounded-xl overflow-hidden transition-all duration-300 ring-offset-2 ring-offset-background ${
                      !show360 && selectedImage === index
                        ? "ring-2 ring-gold shadow-md scale-[1.02]"
                        : "ring-1 ring-border/60 hover:ring-gold/40 opacity-90 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} view ${index + 1}`}
                      width={72}
                      height={72}
                      className="h-full w-full object-cover object-top"
                    />
                  </button>
                ))}
                
                {/* 360 View Toggle (Desktop) */}
                {view360Frames.length >= 2 && (
                  <button
                    type="button"
                    onClick={() => setShow360(true)}
                    className={`relative w-[4.5rem] h-[4.5rem] shrink-0 rounded-xl overflow-hidden transition-all duration-300 ring-offset-2 ring-offset-background flex flex-col items-center justify-center bg-cream/30 gap-1 ${
                      show360
                        ? "ring-2 ring-gold shadow-md scale-[1.02]"
                        : "ring-1 ring-border/60 hover:ring-gold/40 opacity-90 hover:opacity-100"
                    }`}
                  >
                    <MoveHorizontal className={`h-6 w-6 ${show360 ? "text-gold-dark" : "text-muted-foreground"}`} />
                    <span className={`text-[10px] font-bold ${font('labels')} ${show360 ? "text-gold-dark" : "text-muted-foreground"}`}>360°</span>
                  </button>
                )}
              </div>

              {/* Main Image */}
              <div className="flex-1 order-1 md:order-2 min-w-0">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-cream-dark via-cream to-cream-dark shadow-[0_28px_56px_-18px_rgba(25,18,14,0.18)] ring-1 ring-black/[0.06]">
                  {show360 ? (
                    <Product360View frames={view360Frames} productName={product.name} />
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setLightboxOpen(true)}
                        className="absolute inset-0 z-[1] cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                        aria-label="View larger image"
                      />
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)] pointer-events-none z-[1]" />
                      <Image
                        src={images[selectedImage]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover object-top pointer-events-none"
                        priority
                      />
                      <div className={`pointer-events-none absolute bottom-5 right-5 z-[2] flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] text-foreground shadow-md ring-1 ring-black/5 backdrop-blur-sm ${font('labels')}`}>
                        <ZoomIn className="h-3.5 w-3.5 text-gold-dark" strokeWidth={2} />
                        Tap to zoom
                      </div>
                    </>
                  )}
                  
                  <div className="pointer-events-none absolute top-5 left-5 z-[3] flex flex-col gap-2">
                    {product.isNew && (
                      <span className={`bg-foreground/95 text-white text-[10px] sm:text-xs px-3 py-1.5 tracking-[0.2em] shadow-lg ${font('labels')}`}>
                        NEW
                      </span>
                    )}
                    {product.isBestseller && (
                      <span className={`bg-gradient-to-r from-gold to-gold-dark text-white text-[10px] sm:text-xs px-3 py-1.5 tracking-[0.2em] shadow-lg ${font('labels')}`}>
                        BESTSELLER
                      </span>
                    )}
                  </div>
                  {product.inStock ? (
                    <div className={`pointer-events-none absolute bottom-5 left-5 z-[3] inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] text-foreground shadow-md backdrop-blur-sm ring-1 ring-black/5 ${font('labels')}`}>
                      <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
                      In stock — ships in 2–4 days
                    </div>
                  ) : (
                    <div className={`pointer-events-none absolute bottom-5 left-5 z-[3] inline-flex items-center rounded-full bg-foreground/90 px-3 py-1.5 text-[11px] text-white shadow-md ${font('labels')}`}>
                      Out of stock
                    </div>
                  )}
                </div>
                {/* Mobile thumbnails */}
                <div className="flex md:hidden gap-2 mt-4 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSelectedImage(index)
                        setShow360(false)
                      }}
                      className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden transition-all ${
                        !show360 && selectedImage === index
                          ? "ring-2 ring-gold shadow"
                          : "ring-1 ring-border/50 opacity-80"
                      }`}
                    >
                      <Image src={img} alt="" width={64} height={64} className="h-full w-full object-cover object-top" />
                    </button>
                  ))}
                  
                  {/* 360 View Toggle (Mobile) */}
                  {view360Frames.length >= 2 && (
                    <button
                      type="button"
                      onClick={() => setShow360(true)}
                      className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden transition-all flex flex-col items-center justify-center bg-cream/30 gap-1 ${
                        show360
                          ? "ring-2 ring-gold shadow"
                          : "ring-1 ring-border/50 opacity-80"
                      }`}
                    >
                      <MoveHorizontal className={`h-5 w-5 ${show360 ? "text-gold-dark" : "text-muted-foreground"}`} />
                      <span className={`text-[9px] font-bold ${font('labels')} ${show360 ? "text-gold-dark" : "text-muted-foreground"}`}>360°</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col rounded-2xl border border-border/50 bg-gradient-to-b from-card via-card to-cream/20 px-5 pt-5 pb-6 sm:px-7 sm:pt-6 sm:pb-8 md:px-8 md:pt-7 md:pb-10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_18px_40px_-24px_rgba(25,18,14,0.12)]">
              <p className={`text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-gold-dark mb-3 ${font('labels')}`}>
                {product.category.replace("-", " ")}
                {product.subcategory ? ` · ${product.subcategory}` : ""}
              </p>
              <h1 className={`text-3xl sm:text-4xl md:text-[2.65rem] font-light text-foreground leading-[1.12] tracking-tight mb-4 ${font('headings')}`}>
                {product.name}
              </h1>

              <div className="mb-5 flex flex-wrap items-center gap-2 sm:gap-3">
                <span className={`text-[11px] text-muted-foreground ${font('body')}`}>
                  Style <span className="font-medium text-foreground/90">{product.id.toUpperCase()}</span>
                </span>
                <span className="hidden sm:inline text-border">|</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={copyProductLink}
                    className={`inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-cream/50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-cream ${font('buttons')}`}
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy link"}
                  </button>
                  <button
                    type="button"
                    onClick={shareProduct}
                    className={`inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-cream/50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-cream ${font('buttons')}`}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                  </button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-cream/90 px-3.5 py-2 ring-1 ring-border/40">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                          i < Math.floor(reviewSummary.avg || 0) ? "text-gold fill-gold" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <a
                    href="#reviews"
                    className={`text-xs sm:text-sm text-muted-foreground tabular-nums transition-colors hover:text-gold-dark ${font('body')}`}
                  >
                    <span className="text-foreground font-medium">{reviewSummary.avg || 0}</span>
                    <span className="mx-1 opacity-40">·</span>
                    {reviewSummary.count} reviews
                  </a>
                </div>
              </div>

              {/* Price */}
              <div className="mb-7 pl-4 border-l-[3px] border-gold/80">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className={`text-3xl sm:text-4xl font-light text-foreground tabular-nums tracking-tight ${font('headings')}`}>
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className={`text-lg text-muted-foreground line-through tabular-nums ${font('body')}`}>
                        {formatPrice(product.originalPrice)}
                      </span>
                      <span className={`text-xs sm:text-sm uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded ${font('labels')}`}>
                        Save {formatPrice(product.originalPrice - product.price)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className={`text-muted-foreground text-sm sm:text-[15px] leading-[1.75] mb-5 max-w-xl ${font('body')}`}>
                {product.description}
              </p>

              {/* Highlights */}
              <div className="mb-8">
                <h3 className={`text-[10px] uppercase tracking-[0.25em] font-semibold text-foreground/80 mb-3 flex items-center gap-2 ${font('labels')}`}>
                  <Sparkles className="h-3.5 w-3.5 text-gold-dark" strokeWidth={1.5} />
                  Highlights
                </h3>
                <ul className="flex flex-col gap-2">
                  {product.details.slice(0, 3).map((line, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-2 text-sm text-foreground/85 leading-snug ${font('body')}`}
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700/90" strokeWidth={2.5} />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Material + specs */}
              <div className="mb-8 space-y-4">
                <div className="rounded-xl bg-cream/40 px-4 py-3.5 ring-1 ring-border/30">
                  <h3 className="text-[10px] uppercase tracking-[0.25em] font-semibold ${font('labels')} text-foreground/80 mb-1.5">
                    Material
                  </h3>
                  <p className="text-sm text-foreground/90 ${font('body')}">
                    {product.material}
                    {product.plating ? ` · ${product.plating} plating` : ""}
                  </p>
                </div>
                {(product.dimensions || product.weight) && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {product.dimensions && (
                      <div className="flex gap-3 rounded-xl border border-border/40 bg-background/60 px-4 py-3">
                        <Ruler className="h-5 w-5 shrink-0 text-gold-dark" strokeWidth={1.5} />
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground ${font('labels')}">
                            Dimensions
                          </p>
                          <p className="text-sm font-medium text-foreground ${font('labels')}">
                            {product.dimensions}
                          </p>
                        </div>
                      </div>
                    )}
                    {product.weight && (
                      <div className="flex gap-3 rounded-xl border border-border/40 bg-background/60 px-4 py-3">
                        <Scale className="h-5 w-5 shrink-0 text-gold-dark" strokeWidth={1.5} />
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground ${font('labels')}">
                            Weight
                          </p>
                          <p className="text-sm font-medium text-foreground ${font('labels')}">
                            {product.weight}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-8">
                <h3 className="text-[10px] uppercase tracking-[0.25em] font-semibold ${font('labels')} text-foreground/80 mb-3">
                  Quantity
                </h3>
                <div className="inline-flex items-center rounded-full border border-border/80 bg-background/80 shadow-inner overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3.5 hover:bg-cream/80 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="min-w-[2.75rem] text-center ${font('body')} text-sm tabular-nums font-medium">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3.5 hover:bg-cream/80 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="mb-4 flex flex-col gap-2">
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={!product.inStock || bagAdded.added}
                    onClick={handleAddToCart}
                    className={`group flex min-w-[min(100%,12rem)] flex-1 items-center justify-center gap-2.5 rounded-sm py-4 ${font('buttons')} text-sm tracking-[0.15em] shadow-[0_12px_28px_-8px_rgba(25,18,14,0.45)] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 ${
                      bagAdded.added
                        ? "cursor-default border border-emerald-800 bg-emerald-700 text-white"
                        : "bg-foreground text-white hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-8px_rgba(25,18,14,0.55)]"
                    }`}
                  >
                    {bagAdded.added ? (
                      <>
                        <Check className="w-5 h-5" strokeWidth={2.5} />
                        Added to cart
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-105" />
                        {product.inStock ? "ADD TO BAG" : "UNAVAILABLE"}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleWishlist}
                    className={`shrink-0 rounded-sm border p-4 transition-all duration-300 ${
                      inWishlist
                        ? "border-transparent bg-gradient-to-br from-gold to-gold-dark text-white shadow-md"
                        : "border-border/80 bg-background/50 hover:border-gold/50 hover:text-gold-dark hover:shadow-md"
                    }`}
                    aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart className={`h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
                  </button>
                  {isInCompare(product.id) ? (
                    <Link
                      href="/compare"
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-sm border border-gold/40 bg-cream/60 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-gold/15 ${font('buttons')}"
                    >
                      <GitCompare className="h-4 w-4" strokeWidth={2} />
                      View compare
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCompare}
                      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-sm border px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-all ${font('buttons')} ${
                        compareAdded.added
                          ? "border-emerald-800 bg-emerald-700 text-white"
                          : "border-border/80 bg-background/50 text-foreground hover:border-gold/50 hover:text-gold-dark"
                      }`}
                    >
                      {compareAdded.added ? (
                        <>
                          <Check className="h-4 w-4" strokeWidth={2.5} />
                          Added
                        </>
                      ) : (
                        <>
                          <GitCompare className="h-4 w-4" strokeWidth={2} />
                          Compare
                        </>
                      )}
                    </button>
                  )}
                </div>
                {compareHint.hint && (
                  <p className="text-xs text-amber-800 ${font('body')}">{compareHint.hint}</p>
                )}
              </div>

              <Link
                href={product.inStock ? `/checkout?product=${product.id}&quantity=${quantity}` : "#"}
                aria-disabled={!product.inStock}
                onClick={(e) => {
                  if (!product.inStock) e.preventDefault()
                }}
                className={`mb-10 w-full rounded-sm py-4 text-center ${font('buttons')} text-sm tracking-[0.2em] transition-all duration-300 ${
                  product.inStock
                    ? "bg-gradient-to-r from-gold via-gold to-gold-dark text-white shadow-[0_10px_28px_-10px_rgba(160,120,50,0.55)] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-8px_rgba(160,120,50,0.65)]"
                    : "pointer-events-none cursor-not-allowed bg-muted text-muted-foreground opacity-60"
                }`}
              >
                {product.inStock ? "BUY NOW" : "BACK SOON"}
              </Link>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2">
                {[
                  { icon: Truck, label: "Free shipping" },
                  { icon: RotateCcw, label: "Easy returns" },
                  { icon: Shield, label: "Secure checkout" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center text-center rounded-xl border border-border/40 bg-cream/30 px-3 py-4"
                  >
                    <Icon className="w-5 h-5 mb-2 text-gold-dark opacity-90" strokeWidth={1.5} />
                    <p className="text-[11px] uppercase tracking-wider ${font('body')} text-muted-foreground">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Tabs Section */}
              <div className="mt-8 pt-8 border-t border-border/50">
                {/* Tab Navigation */}
                <div className="flex gap-1 sm:gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
                  {["specifications", "material", "shipping", "size"].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`shrink-0 whitespace-nowrap px-3 sm:px-4 py-2.5 rounded-lg ${font('buttons')} text-[10px] sm:text-xs font-semibold tracking-wider transition-all duration-200 ${
                        activeTab === tab
                          ? "bg-foreground text-white shadow-md"
                          : "text-muted-foreground hover:text-foreground hover:bg-cream/60"
                      }`}
                    >
                      {tab === "specifications" && "SPECIFICATIONS"}
                      {tab === "material" && "MATERIAL & CARE"}
                      {tab === "shipping" && "SHIPPING"}
                      {tab === "size" && "SIZE GUIDE"}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === "specifications" && (
                  <div className="rounded-xl bg-cream/25 px-4 py-5 ring-1 ring-border/30">
                    <h3 className="text-[10px] uppercase tracking-[0.25em] font-semibold ${font('labels')} text-foreground/80 mb-4">
                      Product details
                    </h3>
                    <ul className="space-y-3.5">
                      {product.details.map((detail, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-sm text-muted-foreground ${font('body')} leading-relaxed"
                        >
                          <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === "material" && (
                  <div className="space-y-6">
                    <div className="rounded-xl bg-cream/25 px-4 py-5 ring-1 ring-border/30">
                      <h3 className="text-[10px] uppercase tracking-[0.25em] font-semibold ${font('labels')} text-foreground/80 mb-3">
                        Material
                      </h3>
                      <p className="text-sm text-muted-foreground ${font('body')} leading-relaxed">
                        {product.material}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-[10px] uppercase tracking-[0.25em] font-semibold ${font('labels')} text-foreground/80 mb-4">
                        Care instructions
                      </h3>
                      <ul className="space-y-3 text-sm text-muted-foreground ${font('body')} leading-relaxed">
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-gold rounded-full mt-1 flex-shrink-0" />
                        Keep away from water, perfume, and harsh chemicals
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-gold rounded-full mt-1 flex-shrink-0" />
                        Store in a cool, dry place
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-gold rounded-full mt-1 flex-shrink-0" />
                        Clean with a soft, dry cloth
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-gold rounded-full mt-1 flex-shrink-0" />
                        Avoid extreme temperatures
                      </li>
                    </ul>
                    </div>
                  </div>
                )}

                {activeTab === "shipping" && (
                  <div className="rounded-xl bg-cream/25 px-4 py-5 ring-1 ring-border/30">
                    <h3 className="text-[10px] uppercase tracking-[0.25em] font-semibold ${font('labels')} text-foreground/80 mb-4">
                      Shipping information
                    </h3>
                    <ul className="space-y-3 text-sm text-muted-foreground ${font('labels')} leading-relaxed">
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-gold rounded-full mt-1 flex-shrink-0" />
                        Free shipping on all orders across India
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-gold rounded-full mt-1 flex-shrink-0" />
                        Delivery within 5-7 business days
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-gold rounded-full mt-1 flex-shrink-0" />
                        30 days easy returns and exchanges
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-gold rounded-full mt-1 flex-shrink-0" />
                        Secure packaging and insured shipment
                      </li>
                    </ul>
                  </div>
                )}

                {activeTab === "size" && (
                  <div className="rounded-xl bg-cream/25 px-4 py-5 ring-1 ring-border/30">
                    <h3 className="text-[10px] uppercase tracking-[0.25em] font-semibold ${font('labels')} text-foreground/80 mb-3">
                      Size guide
                    </h3>
                    <p className="text-sm text-muted-foreground ${font('labels')} mb-5 leading-relaxed">
                      Most of our jewelry pieces are adjustable or one size fits all. For rings, please refer to your ring size chart.
                    </p>
                    <table className="w-full text-sm ${font('body')}">
                      <thead>
                        <tr className="border-b border-border/60">
                          <th className="text-left py-2.5 text-foreground font-medium">Type</th>
                          <th className="text-left py-2.5 text-foreground font-medium">Size</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border/40">
                          <td className="py-2.5 text-muted-foreground">Bracelets</td>
                          <td className="py-2.5 text-muted-foreground">One size fits most (adjustable)</td>
                        </tr>
                        <tr className="border-b border-border/40">
                          <td className="py-2.5 text-muted-foreground">Necklaces</td>
                          <td className="py-2.5 text-muted-foreground">16-18 inches (adjustable)</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 text-muted-foreground">Rings</td>
                          <td className="py-2.5 text-muted-foreground">Multiple sizes available</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          <ProductVideoAnd360 product={product} />
        </div>

        <div className="max-w-7xl mx-auto space-y-12 border-t border-border/50 px-4 pb-8 pt-12 md:space-y-16 md:pb-10 md:pt-16 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-b border-border/30 pb-10 text-center md:justify-between md:text-left">
            <div className="flex max-w-xs items-start gap-3 md:max-w-none">
              <Award className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" strokeWidth={1.5} />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground ${font('labels')}">
                  Quality promise
                </p>
                <p className="text-sm text-muted-foreground ${font('labels')} leading-relaxed">
                  Nickel-free bases & thick 18K gold plating on demi-fine pieces.
                </p>
              </div>
            </div>
            <div className="flex max-w-xs items-start gap-3 md:max-w-none">
              <Package className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" strokeWidth={1.5} />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground ${font('labels')}">
                  Careful dispatch
                </p>
                <p className="text-sm text-muted-foreground ${font('labels')} leading-relaxed">
                  Orders ship within 24–48 hours in secure, gift-ready packaging.
                </p>
              </div>
            </div>
            <div className="flex max-w-xs items-start gap-3 md:max-w-none">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" strokeWidth={1.5} />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground ${font('labels')}">
                  Easy support
                </p>
                <p className="text-sm text-muted-foreground ${font('labels')} leading-relaxed">
                  30-day returns & responsive help on every order.
                </p>
              </div>
            </div>
          </div>

          <ProductReviewsPanel product={product} />

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <section>
              <p className="text-[10px] uppercase tracking-[0.35em] text-gold-dark ${font('labels')} mb-2">
                Common questions
              </p>
              <h2 className="mb-6 text-xl font-light ${font('headings')} text-foreground md:text-2xl">
                FAQ
              </h2>
              <div className="space-y-2">
                {PRODUCT_FAQ.map((item, i) => (
                  <div key={item.q} className="rounded-xl border border-border/40 bg-card/80">
                    <button
                      type="button"
                      onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left ${font('body')} text-sm font-medium text-foreground transition-colors hover:bg-cream/40"
                    >
                      {item.q}
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                          faqOpen === i ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {faqOpen === i && (
                      <div className="border-t border-border/30 px-4 pb-4 pt-2 text-sm leading-relaxed text-muted-foreground ${font('body')}">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border/50 bg-gradient-to-br from-cream/40 to-card p-6 shadow-inner sm:p-8">
              <h2 className="mb-2 text-lg font-light ${font('headings')} text-foreground">
                Check delivery time
              </h2>
              <p className="mb-5 text-sm text-muted-foreground ${font('body')} leading-relaxed">
                Enter your pincode for an estimated delivery window (India).
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="560001"
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    setPincodeResult(null)
                  }}
                  className="min-h-11 flex-1 rounded-lg border border-border/60 bg-background px-4 ${font('body')} text-sm outline-none ring-0 focus:border-gold"
                />
                <button
                  type="button"
                  onClick={checkPincode}
                  className="rounded-lg bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-gold-dark ${font('buttons')}"
                >
                  Check
                </button>
              </div>
              {pincodeResult && (
                <p className="mt-4 text-sm text-foreground/90 ${font('body')} leading-relaxed">
                  {pincodeResult}
                </p>
              )}
            </section>
          </div>

          {recentProducts.length > 0 && (
            <section className="border-t border-border/40 pt-12 md:pt-14">
              <div className="mb-8 text-center md:text-left">
                <p className="text-[10px] uppercase tracking-[0.35em] text-gold-dark ${font('labels')} mb-2">
                  Your journey
                </p>
                <h2 className="text-2xl font-light ${font('headings')} text-foreground md:text-3xl">
                  Recently viewed
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {recentProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>

        {(apiRecommendations.completeLook.length > 0 || relatedProducts.length > 0) && (
          <div className="border-t border-border/60 bg-gradient-to-b from-cream/40 to-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20">
              <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
                <p className="text-[10px] md:text-[11px] uppercase tracking-[0.35em] text-gold-dark ${font('labels')} mb-3">
                  Curated for you
                </p>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light ${font('headings')} text-foreground tracking-tight mb-3">
                  Complete your look
                </h2>
                <p className="text-muted-foreground ${font('body')} text-sm md:text-[15px] leading-relaxed">
                  Pair this piece with complementary styles from the same collection.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 lg:gap-8">
                {(apiRecommendations.completeLook.length > 0
                  ? apiRecommendations.completeLook
                  : relatedProducts
                ).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </div>
        )}

        {apiRecommendations.similar.length > 0 && (
          <div className="border-t border-border/40 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
              <h3 className={`text-2xl ${font('headings')} mb-6`}>Similar Products</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {apiRecommendations.similar.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </div>
        )}

        {apiRecommendations.frequentlyBought.length > 0 && (
          <div className="border-t border-border/40 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
              <h3 className={`text-2xl ${font('headings')} mb-6`}>Frequently Bought Together</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {apiRecommendations.frequentlyBought.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </div>
        )}

        {lightboxOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Product image enlarged"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              className="absolute right-4 top-4 z-[1] rounded-full bg-white/15 p-2.5 text-white transition-colors hover:bg-white/25"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close zoom"
            >
              <X className="h-5 w-5" />
            </button>
            <div
              className="relative aspect-square w-full max-w-[min(100%,56rem)] max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_32px_-12px_rgba(25,18,14,0.12)] backdrop-blur-md md:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4">
            <div className="min-w-0 flex-1">
              <p className={`truncate text-[11px] text-muted-foreground ${font("body")}`}>
                {product.name}
              </p>
              <p className={`text-lg font-semibold tabular-nums text-foreground ${font("body")}`}>
                {formatPrice(product.price)}
              </p>
            </div>
            <button
              type="button"
              disabled={!product.inStock || bagAdded.added}
              onClick={handleAddToCart}
              className={`shrink-0 rounded-sm px-5 py-3 text-[11px] font-semibold uppercase tracking-wider ${font('buttons')} disabled:opacity-40 ${
                bagAdded.added ? "border border-emerald-800 bg-emerald-700 text-white" : "bg-foreground text-white"
              }`}
            >
              {bagAdded.added ? "Added" : "Add to bag"}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
