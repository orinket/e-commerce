import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { giftRecipientCopy } from "@/data/landingCollections"

const RECIPIENTS = ["for-her", "for-him"] as const

type Props = { params: Promise<{ recipient: string }> }

export function generateStaticParams() {
  return RECIPIENTS.map((recipient) => ({ recipient }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { recipient } = await params
  const copy = giftRecipientCopy[recipient]
  if (!copy) return { title: "Gifts | ORINKET" }
  return {
    title: `${copy.title} | ORINKET`,
    description: copy.description,
  }
}

/** Same PLP shell as other promo links (filters, sort, grid). */
export default async function GiftsRecipientPage({ params }: Props) {
  const { recipient } = await params
  if (recipient === "for-him") permanentRedirect("/promo?recipient=him")
  if (recipient === "for-her") permanentRedirect("/promo?recipient=her")
  notFound()
}
