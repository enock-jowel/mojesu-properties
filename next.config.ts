import type { NextConfig } from 'next'

// OpenNext/Cloudflare needs standalone; Vercel must use the default Next output.
const forOpenNext = process.env.OPEN_NEXT_BUILD === '1'

/**
 * Browser lockdown headers — no UI impact.
 * CSP allowlist matches real third-party usage (Unsplash, Flaticon, Supabase, YouTube embeds).
 * 'unsafe-inline' / 'unsafe-eval' are required for Next.js App Router hydration today.
 */
const ContentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  // Next hydration still needs 'unsafe-inline'. Avoid 'unsafe-eval' (real XSS win).
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://cdn-uicons.flaticon.com",
  "font-src 'self' data: https://cdn-uicons.flaticon.com",
  "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co https://i.ytimg.com https://framerusercontent.com https://lh3.googleusercontent.com https://*.googleusercontent.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://places.googleapis.com",
  "frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com",
  "media-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  'upgrade-insecure-requests',
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value:
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  // Allow WhatsApp / external confirmations to open without breaking popups.
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
]

const nextConfig: NextConfig = {
  ...(forOpenNext ? { output: 'standalone' as const } : {}),
  // Stop advertising the stack to scanners / casual fingerprinting.
  poweredByHeader: false,
  eslint: {
    // Deploy builds must not fail on local ESLint plugin resolution quirks.
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  images: {
    // Next 15 defaults to [75] only; cards/gallery use 65/70.
    qualities: [50, 55, 60, 65, 70, 75],
    remotePatterns: [
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
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
