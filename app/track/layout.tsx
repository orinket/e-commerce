import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Track Order | ORINKET",
  description: "Track your Orinket order with your order ID — demo tracking for preview.",
}

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children
}
