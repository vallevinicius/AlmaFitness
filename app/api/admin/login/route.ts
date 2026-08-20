import { createHash, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

function safeCompare(a: string, b: string) {
  const hashA = createHash('sha256').update(a).digest()
  const hashB = createHash('sha256').update(b).digest()
  return timingSafeEqual(hashA, hashB)
}

export async function POST(request: NextRequest) {
  const rateLimit = await checkRateLimit(`admin-login:${getClientIp(request)}`, 5, 15 * 60 * 1000)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Muitas tentativas. Tente novamente em ${Math.ceil(rateLimit.retryAfterSeconds / 60)} minuto(s).` },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } },
    )
  }

  const { username, password } = await request.json()

  const validUsername = typeof username === 'string' && safeCompare(username, process.env.ADMIN_USERNAME ?? '')
  const validPassword = typeof password === 'string' && safeCompare(password, process.env.ADMIN_PASSWORD ?? '')

  if (!validUsername || !validPassword) {
    return NextResponse.json({ error: 'Usuário ou senha inválidos' }, { status: 401 })
  }

  const token = await createSessionToken()
  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  })
  return response
}
