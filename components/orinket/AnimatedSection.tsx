'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedSectionProps {
  children: React.ReactNode
  animation?: 'fadeIn' | 'slideUp' | 'slideInLeft' | 'slideInRight' | 'scaleIn'
  delay?: number
  className?: string
  threshold?: number
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  animation = 'slideUp',
  delay = 0,
  className = '',
  threshold = 0.1
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    let didShow = false
    const reveal = () => {
      if (didShow) return
      didShow = true
      setTimeout(() => setIsVisible(true), delay)
    }

    if (!('IntersectionObserver' in window)) {
      reveal()
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal()
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    // Safety: if observer misses on first paint, still show content.
    const fallbackTimer = window.setTimeout(reveal, 1200 + delay)

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      window.clearTimeout(fallbackTimer)
      if (ref.current) {
        observer.unobserve(ref.current)
      }
      observer.disconnect()
    }
  }, [delay, threshold])

  const getAnimationClass = () => {
    if (!isVisible) return 'opacity-0 pointer-events-none'
    
    switch (animation) {
      case 'fadeIn':
        return 'animate-fadeIn'
      case 'slideUp':
        return 'animate-slideUp'
      case 'slideInLeft':
        return 'animate-slideInLeft'
      case 'slideInRight':
        return 'animate-slideInRight'
      case 'scaleIn':
        return 'animate-scaleIn'
      default:
        return 'animate-slideUp'
    }
  }

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${getAnimationClass()} ${className}`}
    >
      {children}
    </div>
  )
}

export default AnimatedSection

