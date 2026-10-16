export interface CartItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  quantity: number
  variant?: string
  /** When set, cart quantity cannot exceed this (synced from catalog). */
  stockLeft?: number
}

export interface WishlistItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  /** Unix ms when saved; optional for older saved wishlists. */
  addedAt?: number
  stockLeft?: number
}
