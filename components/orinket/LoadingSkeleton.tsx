'use client'

import { useState, useEffect } from 'react'

interface LoadingSkeletonProps {
  count?: number
  className?: string
}

export default function LoadingSkeleton({ count = 8, className = '' }: LoadingSkeletonProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 ${className}`}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="aspect-square bg-gray-100"></div>
            <div className="p-6 space-y-4">
              <div className="h-6 bg-gray-100 rounded"></div>
              <div className="h-4 bg-gray-100 rounded w-3/4"></div>
              <div className="h-8 bg-gray-100 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index} 
          className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm entrance-animation entrance-delay-{index % 4 + 1}"
        >
          {/* Product Image Skeleton */}
          <div className="relative aspect-square overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 shimmer"></div>
            <div className="absolute top-4 left-4 w-16 h-6 bg-gray-200 rounded-full"></div>
            <div className="absolute top-4 right-4 w-10 h-10 bg-gray-200 rounded-full"></div>
          </div>

          {/* Product Info Skeleton */}
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded shimmer"></div>
              <div className="h-4 bg-gray-100 rounded w-3/4 shimmer"></div>
            </div>
            
            {/* Price Skeleton */}
            <div className="flex items-center gap-3">
              <div className="h-8 bg-gray-200 rounded w-20 shimmer"></div>
              <div className="h-5 bg-gray-100 rounded w-16 shimmer"></div>
            </div>

            {/* Rating Skeleton */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-gray-100 rounded shimmer"></div>
                ))}
              </div>
              <div className="h-4 bg-gray-100 rounded w-12 shimmer"></div>
            </div>

            {/* Meta Tags Skeleton */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex gap-2">
                <div className="h-6 bg-gray-100 rounded-full px-2 shimmer"></div>
                <div className="h-6 bg-gray-100 rounded-full px-2 shimmer"></div>
              </div>
              <div className="h-6 bg-gray-100 rounded-full px-2 shimmer"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Individual product card skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm entrance-animation">
      {/* Product Image Skeleton */}
      <div className="relative aspect-square overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 shimmer"></div>
        <div className="absolute top-4 left-4 w-16 h-6 bg-gray-200 rounded-full"></div>
        <div className="absolute top-4 right-4 w-10 h-10 bg-gray-200 rounded-full"></div>
      </div>

      {/* Product Info Skeleton */}
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded shimmer"></div>
          <div className="h-4 bg-gray-100 rounded w-3/4 shimmer"></div>
        </div>
        
        {/* Price Skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-8 bg-gray-200 rounded w-20 shimmer"></div>
          <div className="h-5 bg-gray-100 rounded w-16 shimmer"></div>
        </div>

        {/* Rating Skeleton */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-100 rounded shimmer"></div>
            ))}
          </div>
          <div className="h-4 bg-gray-100 rounded w-12 shimmer"></div>
        </div>

        {/* Meta Tags Skeleton */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex gap-2">
            <div className="h-6 bg-gray-100 rounded-full px-2 shimmer"></div>
            <div className="h-6 bg-gray-100 rounded-full px-2 shimmer"></div>
          </div>
          <div className="h-6 bg-gray-100 rounded-full px-2 shimmer"></div>
        </div>
      </div>
    </div>
  )
}

// Button skeleton
export function ButtonSkeleton({ width = 'w-full', height = 'h-12' }: { width?: string, height?: string }) {
  return (
    <div className={`${width} ${height} bg-gray-200 rounded-lg shimmer`}></div>
  )
}

// Text skeleton for various sizes
export function TextSkeleton({ lines = 1, className = '' }: { lines?: number, className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div 
          key={index} 
          className={`h-4 bg-gray-100 rounded shimmer ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        ></div>
      ))}
    </div>
  )
}

