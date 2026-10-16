"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@/context/AuthContext"
import { useAppDispatch } from "@/store/hooks"
import { hydrateCart } from "@/store/slices/cartSlice"
import { setCartUserId, getCartStorageKey, getWishlistStorageKey } from "@/store/cartUserKey"
import type { WishlistItem } from "@/types/cart"

function migrateWishlistItems(parsed: WishlistItem[]): WishlistItem[] {
  return parsed.map((item, i) => ({
    ...item,
    addedAt: item.addedAt ?? Date.now() - (parsed.length - 1 - i) * 3600000,
  }))
}

export default function CartUserSync() {
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const prevUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    const userId = user?.id ?? null
    if (userId === prevUserIdRef.current) return
    prevUserIdRef.current = userId

    // Point storage keys to this user (or guest)
    setCartUserId(userId)

    // Load this user's saved cart/wishlist
    try {
      const savedCart = localStorage.getItem(getCartStorageKey())
      const savedWishlist = localStorage.getItem(getWishlistStorageKey())
      const wishlistItems = savedWishlist
        ? migrateWishlistItems(JSON.parse(savedWishlist) as WishlistItem[])
        : []
      dispatch(
        hydrateCart({
          cartItems: savedCart ? JSON.parse(savedCart) : [],
          wishlistItems,
        })
      )
    } catch {
      dispatch(hydrateCart({ cartItems: [], wishlistItems: [] }))
    }
  }, [user, dispatch])

  return null
}
