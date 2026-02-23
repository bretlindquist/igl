import { NextResponse } from 'next/server'

export function middleware() {
  const res = NextResponse.next()

  // Prevent iOS Home Screen installs from pinning stale HTML documents.
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  res.headers.set('Pragma', 'no-cache')
  res.headers.set('Expires', '0')

  return res
}

export const config = {
  // Apply only to app/document routes. Skip API and static assets.
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
}
