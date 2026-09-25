import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'
import payloadConfig from '@payload-config'
import { findManagedRedirect, isRedirectPath } from './lib/redirects'

export async function proxy(request: NextRequest) {
  if (!['GET', 'HEAD'].includes(request.method) || !isRedirectPath(request.nextUrl.pathname, true)) return NextResponse.next()
  // An authenticated preview is resolved separately by the route's private reader.
  if (request.cookies.has('__prerender_bypass')) return NextResponse.next()
  try {
    const payload = await getPayload({ config: payloadConfig })
    const redirect = await findManagedRedirect(payload, request.nextUrl.pathname)
    if (!redirect) return NextResponse.next()
    const response = NextResponse.redirect(new URL(redirect.to, request.url), redirect.status)
    // Managed permanent redirects must remain editable without sticky browser caches.
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch {
    return new NextResponse('<!doctype html><html lang="en-AU"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page unavailable</title><body><main><h1>This page is unavailable</h1><p>Please try again in a moment.</p></main></body></html>', {
      status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Retry-After': '60' },
    })
  }
}

export const config = { matcher: ['/((?!api(?:/|$)|admin(?:/|$)|_next(?:/|$)|media(?:/|$)|assets(?:/|$)|favicon.ico$).*)'] }
