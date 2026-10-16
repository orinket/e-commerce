'use client'

import { useEffect, useState } from 'react'

export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up')
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollThreshold = 50

      // Determine if we're scrolled past threshold
      setIsScrolled(currentScrollY > scrollThreshold)

      // Determine scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
        // Scrolling down and past threshold
        setScrollDirection('down')
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setScrollDirection('up')
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return { scrollDirection, isScrolled }
}
