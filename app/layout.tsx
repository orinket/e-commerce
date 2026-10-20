import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { StoreProvider } from '@/store/StoreProvider'
import { AuthProvider } from '@/context/AuthContext'
import { CompareProvider } from '@/context/CompareContext'
import { CurrencyProvider } from '@/context/CurrencyContext'
import { StoreSettingsProvider } from '@/context/StoreSettingsContext'
import { fonts } from '@/lib/fonts'
import BackToTop from '@/components/orinket/BackToTop'
import SpinToWinPopup from '@/components/orinket/SpinToWinPopup'
import CartUserSync from '@/components/orinket/CartUserSync'
import { resolveOrinketBackendOrigin } from '@/lib/publicApi/server/resolveBackendOrigin'
import './globals.css'

const defaultMetadata: Metadata = {
  title: 'ORINKET | Demi-Fine Jewellery | 18k Gold Plated - Shop Now',
  description:
    'Discover everyday demi-fine jewellery at Orinket. Premium 18k thick gold plated pieces that are trendy, lasting, and high on quality. Shop necklaces, bracelets, earrings, and rings.',
  keywords:
    'demi-fine jewellery, gold plated jewelry, 18k gold, necklaces, bracelets, earrings, rings, affordable luxury jewelry',
}

export async function generateMetadata(): Promise<Metadata> {
  const origin = resolveOrinketBackendOrigin()
  if (!origin) return defaultMetadata
  try {
    const res = await fetch(`${origin}/api/public/store-settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(5000),
    })
    const json = (await res.json()) as {
      data?: Array<{
        seoHomepageTitle?: string
        metaTitle?: string
        seoHomepageMetaDescription?: string
        metaDescription?: string
        metaKeywords?: string
      }>
    }
    const s = json?.data?.[0]
    if (!s) return defaultMetadata
    const title = (s.seoHomepageTitle || s.metaTitle || defaultMetadata.title) as string
    const description = (s.seoHomepageMetaDescription ||
      s.metaDescription ||
      defaultMetadata.description) as string
    const kw =
      typeof s.metaKeywords === 'string' && s.metaKeywords.trim()
        ? s.metaKeywords.trim()
        : (defaultMetadata.keywords as string)
    return { title, description, keywords: kw }
  } catch {
    return defaultMetadata
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${fonts.mainVar} font-sans antialiased overflow-x-hidden min-w-0`}>
        <StoreSettingsProvider>
          <AuthProvider>
          <CurrencyProvider>
            <StoreProvider>
              <CompareProvider>
                {children}
                <CartUserSync />
                <BackToTop />
                <SpinToWinPopup />
              </CompareProvider>
            </StoreProvider>
          </CurrencyProvider>
          </AuthProvider>
        </StoreSettingsProvider>
        <Analytics />
      </body>
    </html>
  )
}

