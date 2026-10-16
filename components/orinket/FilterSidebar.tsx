'use client'

import { useState, useEffect } from 'react'
import { X, ChevronDown, ChevronUp, Star, DollarSign, Package, Shield } from 'lucide-react'
import { font } from '@/lib/fonts'
import type { FilterState } from '@/lib/productFilters'

interface FilterSidebarProps {
  filters: {
    categories: string[]
    priceRanges: { label: string; min: number; max: number }[]
    materials: string[]
    platings: string[]
    ratings: number[]
  }
  activeFilters: FilterState
  onFiltersChange: (activeFilters: FilterState) => void
  isOpen: boolean
  onClose: () => void
}

const EMPTY_FILTERS: FilterState = {
  categories: [],
  priceRange: null,
  materials: [],
  platings: [],
  rating: [],
  inStock: false,
}

export default function FilterSidebar({
  filters,
  activeFilters,
  onFiltersChange,
  isOpen,
  onClose,
}: FilterSidebarProps) {
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    materials: true,
    platings: true,
    rating: true,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleCategoryChange = (category: string) => {
    const newCategories = activeFilters.categories.includes(category)
      ? activeFilters.categories.filter(c => c !== category)
      : [...activeFilters.categories, category]
    
    const updatedFilters = { ...activeFilters, categories: newCategories }
    onFiltersChange(updatedFilters)
  }

  const handlePriceRangeChange = (min: number, max: number) => {
    const newPriceRange = activeFilters.priceRange?.min === min && activeFilters.priceRange.max === max
      ? null
      : { min, max }
    
    const updatedFilters = { ...activeFilters, priceRange: newPriceRange }
    onFiltersChange(updatedFilters)
  }

  const handleMaterialChange = (material: string) => {
    const newMaterials = activeFilters.materials.includes(material)
      ? activeFilters.materials.filter(m => m !== material)
      : [...activeFilters.materials, material]
    
    const updatedFilters = { ...activeFilters, materials: newMaterials }
    onFiltersChange(updatedFilters)
  }

  const handlePlatingChange = (plating: string) => {
    const newPlatings = activeFilters.platings.includes(plating)
      ? activeFilters.platings.filter(p => p !== plating)
      : [...activeFilters.platings, plating]
    
    const updatedFilters = { ...activeFilters, platings: newPlatings }
    onFiltersChange(updatedFilters)
  }

  const handleRatingChange = (rating: number) => {
    const newRating = activeFilters.rating.includes(rating)
      ? activeFilters.rating.filter((r) => r !== rating)
      : [...activeFilters.rating, rating]
    const updatedFilters = { ...activeFilters, rating: newRating }
    onFiltersChange(updatedFilters)
  }

  const handleInStockChange = (inStock: boolean) => {
    const updatedFilters = { ...activeFilters, inStock }
    onFiltersChange(updatedFilters)
  }

  const clearAllFilters = () => {
    const clearedFilters = { ...EMPTY_FILTERS }
    onFiltersChange(clearedFilters)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (activeFilters.categories.length > 0) count++
    if (activeFilters.priceRange) count++
    if (activeFilters.materials.length > 0) count++
    if (activeFilters.platings.length > 0) count++
    if (activeFilters.rating.length > 0) count++
    if (activeFilters.inStock) count++
    return count
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < rating ? 'fill-gold text-gold' : 'text-stone-300'
            }`}
          />
        ))}
        <span className="ml-1 text-xs text-stone-500">& up</span>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 animate-fadeIn bg-black/50 cursor-pointer"
        onClick={onClose}
        aria-hidden
      />

      <div
        className="fixed left-0 top-0 z-50 flex h-[100dvh] w-full max-w-[min(20rem,92vw)] flex-col bg-white shadow-2xl shadow-stone-900/15 sm:max-w-[22rem]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-drawer-title"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-stone-200/80 bg-white px-4 py-4 sm:px-5">
          <h2
            id="filter-drawer-title"
            className={`text-base font-semibold tracking-wide text-stone-900 ${font('headings')}`}
          >
            Filters
          </h2>
          <div className="flex items-center gap-2">
            {getActiveFilterCount() > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-stone-600 transition-colors hover:bg-stone-100"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto space-y-3 p-3 sm:p-4 sm:space-y-3.5 sm:pb-6">
          {/* Categories */}
          {filters.categories.length > 0 && (
            <div className="rounded-xl border border-stone-200/70 bg-white/80 p-3 shadow-sm backdrop-blur-sm">
              <button className="group flex w-full items-center justify-between rounded-lg px-1 py-2 transition-colors hover:bg-stone-50/80" onClick={() => toggleSection('categories')}>
                <div className="flex items-center gap-1.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100">
                    <Package className="h-3.5 w-3.5 text-stone-700" />
                  </div>
                  <h3 className={`font-semibold text-stone-900 transition-colors ${font('headings')}`}>Categories</h3>
                </div>
                {expandedSections.categories ? (
                  <ChevronUp className="h-4 w-4 text-stone-500 transition-colors group-hover:text-gold-dark" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-stone-500 transition-colors group-hover:text-gold-dark" />
                )}
              </button>
              
              {expandedSections.categories && (
                <div className="space-y-1 pt-1">
                  {filters.categories.map((category) => (
                    <label key={category} className="group -mx-1.5 flex cursor-pointer items-center rounded-lg px-2 py-1.5 transition-colors hover:bg-cream/30">
                      <input
                        type="checkbox"
                        checked={activeFilters.categories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        className="h-4 w-4 cursor-pointer rounded border-stone-300 text-gold-dark accent-gold focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-0"
                      />
                      <span className="ml-3 text-sm font-medium capitalize text-stone-700 transition-colors group-hover:text-stone-900">
                        {category.replace('-', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Price Range */}
          <div className="rounded-xl border border-stone-200/70 bg-white/80 p-3 shadow-sm backdrop-blur-sm">
            <button className="group flex w-full items-center justify-between rounded-lg px-1 py-2 transition-colors hover:bg-stone-50/80" onClick={() => toggleSection('price')}>
              <div className="flex items-center gap-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold-light/50">
                  <DollarSign className="h-3.5 w-3.5 text-gold-dark" />
                </div>
                <h3 className={`font-semibold text-stone-900 transition-colors ${font('headings')}`}>Price range</h3>
              </div>
              {expandedSections.price ? (
                <ChevronUp className="h-4 w-4 text-stone-500 transition-colors group-hover:text-gold-dark" />
              ) : (
                <ChevronDown className="h-4 w-4 text-stone-500 transition-colors group-hover:text-gold-dark" />
              )}
            </button>
            
            {expandedSections.price && (
              <div className="space-y-1 pt-1">
                {filters.priceRanges.map((range) => (
                  <label key={range.label} className="group -mx-1.5 flex cursor-pointer items-center rounded-lg px-2 py-1.5 transition-colors hover:bg-cream/30">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={activeFilters.priceRange?.min === range.min && activeFilters.priceRange?.max === range.max}
                        onChange={() => handlePriceRangeChange(range.min, range.max)}
                        className="h-4 w-4 cursor-pointer rounded border-stone-300 text-gold-dark accent-gold focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-0"
                      />
                    </div>
                    <span className="ml-3 text-sm font-medium text-stone-700 transition-colors group-hover:text-stone-900">{range.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Materials */}
          <div className="rounded-xl border border-stone-200/70 bg-white/80 p-3 shadow-sm backdrop-blur-sm">
            <button className="group flex w-full items-center justify-between rounded-lg px-1 py-2 transition-colors hover:bg-stone-50/80" onClick={() => toggleSection('materials')}>
              <div className="flex items-center gap-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100">
                  <Shield className="h-3.5 w-3.5 text-stone-700" />
                </div>
                <h3 className={`font-semibold text-stone-900 transition-colors ${font('headings')}`}>Material</h3>
              </div>
              {expandedSections.materials ? (
                <ChevronUp className="h-4 w-4 text-stone-500 transition-colors group-hover:text-gold-dark" />
              ) : (
                <ChevronDown className="h-4 w-4 text-stone-500 transition-colors group-hover:text-gold-dark" />
              )}
            </button>
            
            {expandedSections.materials && (
              <div className="space-y-1 pt-1">
                {filters.materials.map((material) => (
                  <label key={material} className="group -mx-1.5 flex cursor-pointer items-center rounded-lg px-2 py-1.5 transition-colors hover:bg-cream/30">
                    <input
                      type="checkbox"
                      checked={activeFilters.materials.includes(material)}
                      onChange={() => handleMaterialChange(material)}
                      className="h-4 w-4 cursor-pointer rounded border-stone-300 text-gold-dark accent-gold focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-0"
                    />
                    <span className="ml-3 text-sm font-medium text-stone-700 transition-colors group-hover:text-stone-900">{material}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Plating */}
          <div className="rounded-xl border border-stone-200/70 bg-white/80 p-3 shadow-sm backdrop-blur-sm">
            <button className="group flex w-full items-center justify-between rounded-lg px-1 py-2 transition-colors hover:bg-stone-50/80" onClick={() => toggleSection('platings')}>
              <div className="flex items-center gap-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold-light/40">
                  <Star className="h-3.5 w-3.5 text-gold-dark" />
                </div>
                <h3 className={`font-semibold text-stone-900 transition-colors ${font('headings')}`}>Plating</h3>
              </div>
              {expandedSections.platings ? (
                <ChevronUp className="h-4 w-4 text-stone-500 transition-colors group-hover:text-gold-dark" />
              ) : (
                <ChevronDown className="h-4 w-4 text-stone-500 transition-colors group-hover:text-gold-dark" />
              )}
            </button>
            
            {expandedSections.platings && (
              <div className="space-y-1 pt-1">
                {filters.platings.map((plating) => (
                  <label key={plating} className="group -mx-1.5 flex cursor-pointer items-center rounded-lg px-2 py-1.5 transition-colors hover:bg-cream/30">
                    <input
                      type="checkbox"
                      checked={activeFilters.platings.includes(plating)}
                      onChange={() => handlePlatingChange(plating)}
                      className="h-4 w-4 cursor-pointer rounded border-stone-300 text-gold-dark accent-gold focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-0"
                    />
                    <span className="ml-3 text-sm font-medium text-stone-700 transition-colors group-hover:text-stone-900">{plating}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="rounded-xl border border-stone-200/70 bg-white/80 p-3 shadow-sm backdrop-blur-sm">
            <button className="group flex w-full items-center justify-between rounded-lg px-1 py-2 transition-colors hover:bg-stone-50/80" onClick={() => toggleSection('rating')}>
              <div className="flex items-center gap-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100">
                  <Star className="h-3.5 w-3.5 text-gold-dark" />
                </div>
                <h3 className={`font-semibold text-stone-900 transition-colors ${font('headings')}`}>Rating</h3>
              </div>
              {expandedSections.rating ? (
                <ChevronUp className="h-4 w-4 text-stone-500 transition-colors group-hover:text-gold-dark" />
              ) : (
                <ChevronDown className="h-4 w-4 text-stone-500 transition-colors group-hover:text-gold-dark" />
              )}
            </button>
            
            {expandedSections.rating && (
              <div className="space-y-1 pt-1">
                {filters.ratings.map((rating) => (
                  <label key={rating} className="group -mx-1.5 flex cursor-pointer items-center rounded-lg px-2 py-1.5 transition-colors hover:bg-cream/30">
                    <div className="relative flex flex-shrink-0 items-center">
                      <input
                        type="checkbox"
                        checked={activeFilters.rating.includes(rating)}
                        onChange={() => handleRatingChange(rating)}
                        className="h-4 w-4 cursor-pointer border-stone-300 text-gold-dark accent-gold focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-0"
                      />
                    </div>
                    <div className="ml-3">{renderStars(rating)}</div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Availability */}
          <div className="rounded-xl border border-stone-200/70 bg-white/80 p-3 shadow-sm backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100">
                  <Package className="h-3.5 w-3.5 text-stone-700" />
                </div>
                <h3 className={`font-semibold text-stone-900 ${font('headings')}`}>Availability</h3>
              </div>
            </div>
            <div className="space-y-1">
              <label className="group -mx-1.5 flex cursor-pointer items-center rounded-lg px-2 py-1.5 transition-colors hover:bg-cream/30">
                <input
                  type="checkbox"
                  checked={activeFilters.inStock}
                  onChange={(e) => handleInStockChange(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-stone-300 text-gold-dark accent-gold focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-0"
                />
                <span className="ml-3 text-sm font-medium text-stone-700 transition-colors group-hover:text-stone-900">In stock only</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
