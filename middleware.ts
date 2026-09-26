import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { buildContentSecurityPolicy } from '@/lib/security/csp'

function applyCsp(response: NextResponse, nonce: string): NextResponse {
  response.headers.set(
    'Content-Security-Policy',
    buildContentSecurityPolicy(nonce, process.env.NODE_ENV === 'development'),
  )
  return response
}

export async function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  // Next reads CSP from the *request* to stamp script nonces during render.
  requestHeaders.set(
    'Content-Security-Policy',
    buildContentSecurityPolicy(nonce, process.env.NODE_ENV === 'development'),
  )

  const req = new NextRequest(request.url, { headers: requestHeaders })
  const { pathname } = req.nextUrl
  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginRoute =
    pathname === '/admin/login' || pathname === '/admin/login/'

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    if (isAdminRoute && !isLoginRoute) {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/login/'
      url.searchParams.set('error', 'config')
      return applyCsp(NextResponse.redirect(url), nonce)
    }
    return applyCsp(
      NextResponse.next({ request: { headers: requestHeaders } }),
      nonce,
    )
  }

  if (!isAdminRoute) {
    return applyCsp(
      NextResponse.next({ request: { headers: requestHeaders } }),
      nonce,
    )
  }

  const { supabaseResponse, user } = await updateSession(req)

  if (isAdminRoute && !isLoginRoute && !user) {
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login/'
    url.searchParams.set('next', pathname)
    return applyCsp(NextResponse.redirect(url), nonce)
  }

  if (isLoginRoute && user) {
    const url = req.nextUrl.clone()
    url.pathname = '/admin/dashboard/'
    return applyCsp(NextResponse.redirect(url), nonce)
  }

  return applyCsp(supabaseResponse, nonce)
}

export const config = {
  matcher: [
    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
