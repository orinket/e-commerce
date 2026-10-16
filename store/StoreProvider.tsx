'use client'

import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { hydrateCart } from '@/store/slices/cartSlice'
import { PublicPageApiCoordinator } from '@/components/orinket/PublicPageApiCoordinator'
import { getCartStorageKey, getWishlistStorageKey } from '@/store/cartUserKey'
import type { WishlistItem } from '@/types/cart'

function migrateWishlistItems(parsed: WishlistItem[]): WishlistItem[] {
  return parsed.map((item, i) => ({
    ...item,
    addedAt: item.addedAt ?? Date.now() - (parsed.length - 1 - i) * 3600000,
  }))
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(getCartStorageKey())
      const savedWishlist = localStorage.getItem(getWishlistStorageKey())
      const wishlistItems = savedWishlist
        ? migrateWishlistItems(JSON.parse(savedWishlist) as WishlistItem[])
        : undefined
      store.dispatch(
        hydrateCart({
          cartItems: savedCart ? JSON.parse(savedCart) : undefined,
          wishlistItems,
        })
      )
    } catch {
      /* ignore corrupt storage */
    }

    const unsub = store.subscribe(() => {
      const { cartItems, wishlistItems } = store.getState().cart
      localStorage.setItem(getCartStorageKey(), JSON.stringify(cartItems))
      localStorage.setItem(getWishlistStorageKey(), JSON.stringify(wishlistItems))
    })

    return unsub
  }, [])

  return (
    <Provider store={store}>
      <PublicPageApiCoordinator />
      {children}
    </Provider>
  )
}
