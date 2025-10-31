import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Generate a random nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // Clone the request headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  // Create response with nonce header
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Determine environment
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Set CSP header with nonce
  // Note: 'unsafe-eval' is needed for Next.js dev mode and React Server Components
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' ${isDevelopment ? "'unsafe-eval'" : "'strict-dynamic'"} https://accounts.google.com https://www.googletagmanager.com https://www.google-analytics.com https://unpkg.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https: blob:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' http://localhost:8000 https://api.reteach.works https://reteach.works https://reteach-production.up.railway.app https://www.google-analytics.com https://analytics.google.com;
    frame-src 'self' https://accounts.google.com;
    worker-src 'self' blob: https://unpkg.com;
    object-src 'none';
    base-uri 'self';
  `.replace(/\s{2,}/g, ' ').trim()

  response.headers.set('Content-Security-Policy', cspHeader)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
