let currentUserId: string | null = null

export function setCartUserId(id: string | null) {
  currentUserId = id
}

export function getCartStorageKey() {
  return currentUserId ? `orinket-cart-${currentUserId}` : 'orinket-cart'
}

export function getWishlistStorageKey() {
  return currentUserId ? `orinket-wishlist-${currentUserId}` : 'orinket-wishlist'
}
