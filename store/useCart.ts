'use client'

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  addToCart as addToCartAction,
  removeFromCart as removeFromCartAction,
  updateQuantity as updateQuantityAction,
  clearCart as clearCartAction,
  addToWishlist as addToWishlistAction,
  removeFromWishlist as removeFromWishlistAction,
  moveWishlistToCart as moveWishlistToCartAction,
} from '@/store/slices/cartSlice'
import {
  selectCartItems,
  selectWishlistItems,
  selectCartTotal,
  selectCartCount,
} from '@/store/selectors'
import type { CartItem, WishlistItem } from '@/types/cart'

export function useCart() {
  const dispatch = useAppDispatch()
  const cartItems = useAppSelector(selectCartItems)
  const wishlistItems = useAppSelector(selectWishlistItems)
  const cartTotal = useAppSelector(selectCartTotal)
  const cartCount = useAppSelector(selectCartCount)

  const addToCart = useCallback(
    (
      item: Omit<CartItem, 'quantity'>,
      quantity = 1,
      options?: { silent?: boolean }
    ) => {
      dispatch(addToCartAction({ item, quantity, silent: options?.silent }))
    },
    [dispatch]
  )

  const removeFromCart = useCallback(
    (id: string) => {
      dispatch(removeFromCartAction(id))
    },
    [dispatch]
  )

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      dispatch(updateQuantityAction({ id, quantity }))
    },
    [dispatch]
  )

  const clearCart = useCallback(
    (options?: { silent?: boolean }) => {
      dispatch(clearCartAction(options))
    },
    [dispatch]
  )

  const addToWishlist = useCallback(
    (item: WishlistItem) => {
      dispatch(addToWishlistAction(item))
    },
    [dispatch]
  )

  const removeFromWishlist = useCallback(
    (id: string) => {
      dispatch(removeFromWishlistAction(id))
    },
    [dispatch]
  )

  const moveWishlistToCart = useCallback(
    (id: string) => {
      dispatch(moveWishlistToCartAction(id))
    },
    [dispatch]
  )

  const isInWishlist = useCallback(
    (id: string) => {
      return wishlistItems.some((item) => item.id === id)
    },
    [wishlistItems]
  )

  return {
    cartItems,
    wishlistItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    moveWishlistToCart,
    cartTotal,
    cartCount,
  }
}
