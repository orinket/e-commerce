"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export default function useListingTransitionShimmer(
  completionSignal: string,
  minimumDurationMs = 260
) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startedAtRef = useRef(0)
  const waitingForCompletionRef = useRef(false)

  const triggerTransition = useCallback(() => {
    startedAtRef.current = Date.now()
    waitingForCompletionRef.current = true
    setIsTransitioning(true)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isTransitioning || !waitingForCompletionRef.current) return

    const elapsed = Date.now() - startedAtRef.current
    const remaining = Math.max(0, minimumDurationMs - elapsed)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      waitingForCompletionRef.current = false
      setIsTransitioning(false)
      timeoutRef.current = null
    }, remaining)
  }, [completionSignal, isTransitioning, minimumDurationMs])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { isTransitioning, triggerTransition }
}
