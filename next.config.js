/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['crypto'],
  webpack: (config) => {
    // Fix for pdfjs-dist - disable canvas
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    }
    return config
  },
  // Skip build-time route analysis
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  
  // Performance and SEO optimizations
  poweredByHeader: false,
  compress: true,
  
  // Image optimization
  images: {
    domains: ['reteach.works', 'lh3.googleusercontent.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Simplified redirects to avoid loops
  async redirects() {
    return [
      // Only legacy URL redirects (safe redirects)
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/#waitlist',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/#waitlist',
        permanent: true,
      },
    ]
  },

  // Headers for security and performance
  // Note: CSP is handled by middleware.ts with nonce support
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }
        ]
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
