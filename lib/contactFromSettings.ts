import type { StoreSettings } from "@/lib/storeSettings"

export type StoreContact = {
  brandName: string
  email: string
  phone: string
  address: string
  hours: string
}

export function contactFromSettings(s: StoreSettings | null | undefined): StoreContact {
  return {
    brandName: s?.brandName?.trim() || s?.storeName?.trim() || "Store",
    email: s?.storeEmail?.trim() || "",
    phone: s?.storePhone?.trim() || "",
    address: s?.storeAddress?.trim() || "",
    hours: s?.supportHours?.trim() || "",
  }
}
