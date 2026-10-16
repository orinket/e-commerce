/** Deterministic mock reviews for PDP (replace with API later). */
export function getMockReviews(productName: string, reviewCount: number) {
  const authors = ["Priya S.", "Ananya K.", "Meera R.", "Kavya M.", "Divya P.", "Neha T."]
  const snippets = [
    "Exactly as shown — finish is beautiful and lightweight for daily wear.",
    "Gifted this and got so many compliments. Packaging felt premium too.",
    "Colour has stayed well after a few weeks. Great value.",
    "Fast delivery and the clasp feels secure. Happy with the purchase.",
  ]
  const n = Math.min(4, Math.max(2, Math.floor((reviewCount || 50) / 40) + 1))
  return Array.from({ length: n }, (_, i) => ({
    id: `${i}`,
    author: authors[i % authors.length],
    rating: 4 + (i % 2) * 0.5,
    date: new Date(Date.now() - (i + 3) * 86400000 * 12).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    }),
    text: `${snippets[i % snippets.length]} ${productName.split(" ").slice(0, 2).join(" ")} looks even better in person.`,
  }))
}

export const PRODUCT_FAQ = [
  {
    q: "Is this jewellery hypoallergenic?",
    a: "Our demi-fine pieces use nickel-free bases and quality plating. If you have severe metal allergies, we recommend checking material notes on this page or consulting your dermatologist.",
  },
  {
    q: "How do I care for gold-plated jewellery?",
    a: "Avoid water, perfume, and sweat when possible. Store in a dry pouch and polish with a soft cloth. See Material & Care for full instructions.",
  },
  {
    q: "Can I return or exchange this item?",
    a: "Yes — unused items in original packaging can be returned within 30 days. See Shipping & Returns for details.",
  },
  {
    q: "Is the colour same as in photos?",
    a: "We photograph in natural light; slight variation can occur by screen. The product you receive matches our catalogue specifications.",
  },
] as const
