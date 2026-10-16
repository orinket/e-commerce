'use client'

import { useEffect, useRef, useState } from 'react'

export const useScrollReveal = () => {
  const [revealedElements, setRevealedElements] = useState<Set<string>>(new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elementId = entry.target.getAttribute('data-scroll-id')
            if (elementId) {
              setRevealedElements((prev) => new Set([...prev, elementId]))
            }
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    const elements = document.querySelectorAll('.scroll-reveal')
    elements.forEach((element) => {
      const elementId = element.getAttribute('data-scroll-id') || Math.random().toString(36)
      element.setAttribute('data-scroll-id', elementId)
      observerRef.current?.observe(element)
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  const isRevealed = (elementId: string) => revealedElements.has(elementId)

  return { isRevealed }
}
