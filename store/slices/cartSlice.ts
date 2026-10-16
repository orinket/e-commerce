import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CartItem, WishlistItem } from '@/types/cart'

interface CartState {
  cartItems: CartItem[]
  wishlistItems: WishlistItem[]
}

const initialState: CartState = {
  cartItems: [],
  wishlistItems: [],
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    hydrateCart: (
      state,
      action: PayloadAction<Partial<Pick<CartState, 'cartItems' | 'wishlistItems'>>>
    ) => {
      if (action.payload.cartItems) state.cartItems = action.payload.cartItems
      if (action.payload.wishlistItems) state.wishlistItems = action.payload.wishlistItems
    },
    addToCart: (
      state,
      action: PayloadAction<{
        item: Omit<CartItem, 'quantity'>
        quantity?: number
        silent?: boolean
      }>
    ) => {
      const { item, quantity = 1 } = action.payload
      const max =
        item.stockLeft != null && item.stockLeft >= 0 ? item.stockLeft : Number.POSITIVE_INFINITY
      const existing = state.cartItems.find((i) => i.id === item.id)
      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, max)
        if (item.stockLeft != null) existing.stockLeft = item.stockLeft
      } else {
        state.cartItems.push({ ...item, quantity: Math.min(quantity, max) })
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter((i) => i.id !== action.payload)
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload
      if (quantity < 1) {
        state.cartItems = state.cartItems.filter((i) => i.id !== id)
        return
      }
      const item = state.cartItems.find((i) => i.id === id)
      if (item) {
        const max =
          item.stockLeft != null && item.stockLeft >= 0 ? item.stockLeft : Number.POSITIVE_INFINITY
        item.quantity = Math.min(quantity, max)
      }
    },
    clearCart: (state, _action: PayloadAction<{ silent?: boolean } | undefined>) => {
      state.cartItems = []
    },
    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      if (state.wishlistItems.some((i) => i.id === action.payload.id)) return
      state.wishlistItems.push({
        ...action.payload,
        addedAt: action.payload.addedAt ?? Date.now(),
      })
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.wishlistItems = state.wishlistItems.filter((i) => i.id !== action.payload)
    },
    moveWishlistToCart: (state, action: PayloadAction<string>) => {
      const id = action.payload
      const item = state.wishlistItems.find((i) => i.id === id)
      if (!item) return
      state.wishlistItems = state.wishlistItems.filter((i) => i.id !== id)
      const existing = state.cartItems.find((i) => i.id === id)
      const max =
        item.stockLeft != null && item.stockLeft >= 0 ? item.stockLeft : Number.POSITIVE_INFINITY
      if (existing) {
        existing.quantity = Math.min(existing.quantity + 1, max)
        if (item.stockLeft != null) existing.stockLeft = item.stockLeft
      } else {
        state.cartItems.push({
          id: item.id,
          name: item.name,
          price: item.price,
          originalPrice: item.originalPrice,
          image: item.image,
          quantity: Math.min(1, max),
          stockLeft: item.stockLeft,
        })
      }
    },
  },
})

export const {
  hydrateCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  addToWishlist,
  removeFromWishlist,
  moveWishlistToCart,
} = cartSlice.actions

export const cartReducer = cartSlice.reducer
