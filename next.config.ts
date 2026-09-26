import type { NextConfig } from 'next'
import { staticSecurityHeaders } from './lib/security/csp'

// OpenNext/Cloudflare needs standalone; Vercel must use the default Next output.
const forOpenNext = process.env.OPEN_NEXT_BUILD === '1'

/**
 * Browser lockdown headers — no UI impact.
 * CSP (nonce-based script-src) is set in middleware so Next can stamp scripts.
 * Remaining headers stay here for static asset responses too.
 */
const nextConfig: NextConfig = {
  ...(forOpenNext ? { output: 'standalone' as const } : {}),
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 30,
    qualities: [50, 55, 60, 65, 70, 75],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'framerusercontent.com',
      },
    ],
  },
  trailingSlash: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: staticSecurityHeaders,
      },
      {
        // Brand images are embedded by webmail clients (notification emails).
        source: '/images/:path*',
        headers: [{ key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' }],
      },
    ]
  },
}

export default nextConfig
