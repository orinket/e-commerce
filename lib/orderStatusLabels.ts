/** Canonical display labels for all order statuses returned by the backend. */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  return_requested: "Return Requested",
  returned: "Returned",
  refunded: "Refunded",
}

export function labelForOrderStatus(status: string): string {
  const k = status?.trim().toLowerCase()
  return (k && ORDER_STATUS_LABELS[k]) || status || "Unknown"
}
