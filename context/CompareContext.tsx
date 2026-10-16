"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

const STORAGE_KEY = "orinket_compare"
const MAX_ITEMS = 4

interface CompareContextType {
  compareIds: string[]
  compareCount: number
  /** Returns true if the id was added; false if duplicate or list full. */
  addToCompare: (id: string) => boolean
  removeFromCompare: (id: string) => void
  clearCompare: () => void
  isInCompare: (id: string) => boolean
  canAddMore: boolean
}

const CompareContext = createContext<CompareContextType | undefined>(undefined)

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as string[]
        if (Array.isArray(parsed)) setCompareIds(parsed.slice(0, MAX_ITEMS))
      }
    } catch {
      setCompareIds([])
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareIds))
    } catch {
      /* ignore */
    }
  }, [compareIds, mounted])

  const addToCompare = useCallback((id: string): boolean => {
    let added = false
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev
      if (prev.length >= MAX_ITEMS) return prev
      added = true
      return [...prev, id]
    })
    return added
  }, [])

  const removeFromCompare = useCallback((id: string) => {
    setCompareIds((prev) => prev.filter((x) => x !== id))
  }, [])

  const clearCompare = useCallback(() => setCompareIds([]), [])

  const isInCompare = useCallback(
    (id: string) => compareIds.includes(id),
    [compareIds]
  )

  const canAddMore = compareIds.length < MAX_ITEMS

  const value = useMemo(
    () => ({
      compareIds,
      compareCount: compareIds.length,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isInCompare,
      canAddMore,
    }),
    [compareIds, addToCompare, removeFromCompare, clearCompare, isInCompare, canAddMore]
  )

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  )
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error("useCompare must be used within CompareProvider")
  return ctx
}
