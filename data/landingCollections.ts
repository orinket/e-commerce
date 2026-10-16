/** Curated landing pages for homepage “For Every You” and similar promos */

export type CollectionLanding = {
  title: string
  description: string
  productIds: string[]
}

export const collectionLandings: Record<string, CollectionLanding> = {
  office: {
    title: "The Professional",
    description: "Elegant pieces for everyday office style",
    productIds: [
      "necklace-002",
      "bracelet-001",
      "earring-001",
      "necklace-001",
      "bracelet-002",
      "earring-005",
    ],
  },
  evening: {
    title: "The Glamorous",
    description: "Statement pieces for special occasions",
    productIds: [
      "ring-001",
      "necklace-003",
      "earring-003",
      "ring-002",
      "necklace-006",
      "ring-003",
    ],
  },
  casual: {
    title: "The Casual",
    description: "Effortless style for weekend vibes",
    productIds: [
      "bracelet-003",
      "earring-002",
      "necklace-006",
      "bracelet-004",
      "earring-006",
      "necklace-002",
    ],
  },
}

export const giftRecipientCopy: Record<string, { title: string; description: string }> = {
  "for-her": {
    title: "Gifts For Her",
    description:
      "Necklaces, earrings, rings, and more — pieces she'll love every day.",
  },
  "for-him": {
    title: "Gifts For Him",
    description: "Bold chains, bracelets, and rings — crafted for modern men.",
  },
}
