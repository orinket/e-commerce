"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/** Amazon-style: brief "Added" / success state on a button, then resets. */
export function useTimedAdded(durationMs = 2200) {
  const [added, setAdded] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pulse = useCallback(() => {
    setAdded(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setAdded(false), durationMs)
  }, [durationMs])

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    []
  )

  return { added, pulse }
}

/** Short error / info line on a control (e.g. "Compare list full"). */
export function useTimedHint(durationMs = 2200) {
  const [hint, setHint] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback(
    (message: string) => {
      setHint(message)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setHint(null), durationMs)
    },
    [durationMs]
  )

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    []
  )

  return { hint, show }
}
