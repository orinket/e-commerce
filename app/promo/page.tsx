import type { Metadata } from "next"
import PromoPageContent from "@/components/orinket/PromoPageContent"

export const metadata: Metadata = {
  title: "Offers | ORINKET",
  description: "Shop curated promotions — buy-one-get-one and fixed discount listings.",
}

export default function PromoPage() {
  return <PromoPageContent />
}
