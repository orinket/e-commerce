/**
 * Orinket — display currency & FX vs USD.
 *
 * - Catalog/cart numbers stay in STORAGE_CURRENCY (INR).
 * - Live FX: Frankfurter API → `/api/exchange-rates` → CurrencyProvider updates `unitsPerUsd`.
 * - Fallback when API fails: FALLBACK_UNITS_PER_USD (edit here as backup only).
 */

export const STORAGE_CURRENCY = "INR" as const

/** Backup rates if live API fails (units of each currency per 1 USD). */
export const FALLBACK_UNITS_PER_USD = {
  USD: 1,
  INR: 83,
  GBP: 0.79,
  EUR: 0.92,
} as const

export type SupportedCurrency = keyof typeof FALLBACK_UNITS_PER_USD

export type UnitsPerUsd = Record<SupportedCurrency, number>

/** What shoppers see site-wide. */
export const ACTIVE_DISPLAY_CURRENCY: SupportedCurrency = "INR"  // Change For Dynamic Currency

const localeByCurrency: Record<SupportedCurrency, string> = {
  INR: "en-IN",
  USD: "en-US",
  GBP: "en-GB",
  EUR: "en-GB",
}

export function getDisplayLocale(code: SupportedCurrency = ACTIVE_DISPLAY_CURRENCY): string {
  return localeByCurrency[code]
}

export type FormatPriceOptions = {
  locale?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

export type CreateCurrencyFormattersOptions = {
  /** From General Settings; `OTHER` uses USD FX. */
  displayCurrency?: SupportedCurrency | "OTHER"
  /** When display currency is not INR, multiply converted prices by (1 + pct/100). */
  nonInrMarkupPercent?: number
}

function defaultMaxFractionDigits(code: SupportedCurrency): number {
  if (code === "INR") return 0
  return 2
}

function resolveDisplayCode(
  raw: SupportedCurrency | "OTHER" | undefined
): SupportedCurrency {
  if (raw === "OTHER") return "USD"
  if (raw === "USD" || raw === "EUR" || raw === "GBP" || raw === "INR") return raw
  return ACTIVE_DISPLAY_CURRENCY
}

/**
 * Build all formatters for a given USD cross table (live or fallback).
 * Use via `useCurrency()` in client UI, or `staticCurrency` for non-React / SSR-safe defaults.
 */
export function createCurrencyFormatters(
  units: UnitsPerUsd,
  formatOptions?: CreateCurrencyFormattersOptions
) {
  const display = resolveDisplayCode(formatOptions?.displayCurrency)
  const markupPct = Number(formatOptions?.nonInrMarkupPercent ?? 0) || 0

  function storageAmountToUsd(amountInStorage: number): number {
    if (STORAGE_CURRENCY === "INR") {
      return amountInStorage / units.INR
    }
    if (STORAGE_CURRENCY === "USD") {
      return amountInStorage
    }
    throw new Error(`Unsupported STORAGE_CURRENCY: ${String(STORAGE_CURRENCY)}`)
  }

  function usdToDisplay(usd: number): number {
    return usd * units[display]
  }

  function convertFromStorage(amountInStorage: number): number {
    let v = usdToDisplay(storageAmountToUsd(amountInStorage))
    if (display !== "INR" && markupPct > 0) {
      v *= 1 + markupPct / 100
    }
    return v
  }

  function formatPrice(amountInStorage: number, options?: FormatPriceOptions): string {
    const value = convertFromStorage(amountInStorage)
    const maxFrac = options?.maximumFractionDigits ?? defaultMaxFractionDigits(display)
    const minFrac = options?.minimumFractionDigits ?? 0
    const locale = options?.locale ?? getDisplayLocale(display)
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: display,
      minimumFractionDigits: minFrac,
      maximumFractionDigits: maxFrac,
    }).format(value)
  }

  function priceBucketLabel(minInStorage: number, maxInStorage: number): string {
    if (!Number.isFinite(maxInStorage) || maxInStorage >= Number.MAX_SAFE_INTEGER / 2) {
      return `Over ${formatPrice(minInStorage)}`
    }
    if (minInStorage <= 0) {
      return `Under ${formatPrice(maxInStorage)}`
    }
    return `${formatPrice(minInStorage)} – ${formatPrice(maxInStorage)}`
  }

  function formatPromoLine(p: {
    type: "percent" | "fixed"
    value: number
    minOrder?: number
  }): string {
    if (p.type === "percent") {
      return `${p.value}% off your order`
    }
    const line = `${formatPrice(p.value)} off`
    if (p.minOrder != null) {
      return `${line} on orders above ${formatPrice(p.minOrder)}`
    }
    return line
  }

  function minimumOrderError(minOrderInStorage: number): string {
    return `Minimum order of ${formatPrice(minOrderInStorage)} required for this code`
  }

  function getTopBannerDesktopText(): string {
    const f = formatPrice
    return `BUY 2 AT ${f(1898)} | USE CODE : EXTRA100 | BUY 3 AT ${f(2999)} | BUY 4 AT ${f(3499)} | BUY 6 AT ${f(4999)}`
  }

  function getTopBannerMobileText(): string {
    return `BUY 2 AT ${formatPrice(1898)} | USE CODE: EXTRA100`
  }

  function getSecondaryBannerText(): string {
    return `FREE STUDS worth ${formatPrice(1495)} on orders above ${formatPrice(2999)}`
  }

  return {
    unitsPerUsd: units,
    formatPrice,
    formatMoney: formatPrice,
    formatPromoLine,
    minimumOrderError,
    priceBucketLabel,
    getTopBannerDesktopText,
    getTopBannerMobileText,
    getSecondaryBannerText,
    convertFromStorage,
  }
}

/** SSR / API fallback — uses static backup rates only. */
export const staticCurrency = createCurrencyFormatters({ ...FALLBACK_UNITS_PER_USD })
