/** @type {import('next').NextConfig} */
const nextConfig = {
  /** Next 16: required when `webpack()` is present so default Turbopack build/dev can run. */
  turbopack: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  /** Fewer tiny chunks (helps `npm run dev:webpack` if Webpack ChunkLoadError appears). */
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  /**
   * Only used when you run `npm run dev:webpack` (not Turbopack).
   * Longer timeout for slow disk / AV scanning of `_next/static/chunks/*`.
   */
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.output = { ...config.output, chunkLoadTimeout: 300_000 }
    }
    return config
  },
}

export default nextConfig
