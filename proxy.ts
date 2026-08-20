import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth'
import { CUSTOMER_SESSION_COOKIE_NAME, verifyCustomerSessionToken } from '@/lib/customer-auth'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (pathname === '/admin/login') return NextResponse.next()

    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
    const isValid = token ? await verifySessionToken(token) : false

    if (!isValid) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    return NextResponse.next()
  }

  if (pathname.startsWith('/conta') || pathname === '/api/orders') {
    if (pathname === '/conta/entrar' || pathname === '/conta/cadastro') return NextResponse.next()

    const token = request.cookies.get(CUSTOMER_SESSION_COOKIE_NAME)?.value
    const customerId = token ? await verifyCustomerSessionToken(token) : null

    if (!customerId) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/conta/entrar', request.url))
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/products/:path*',
    '/api/admin/orders/:path*',
    '/api/admin/upload',
    '/conta/:path*',
    '/api/orders',
  ],
}
