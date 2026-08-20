import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { createCustomerSessionToken, CUSTOMER_SESSION_COOKIE_NAME } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const rateLimit = await checkRateLimit(`customer-login:${getClientIp(request)}`, 5, 15 * 60 * 1000)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Muitas tentativas. Tente novamente em ${Math.ceil(rateLimit.retryAfterSeconds / 60)} minuto(s).` },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } },
    )
  }

  const body = await request.json()
  const { email, password } = body

  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    return NextResponse.json({ error: 'Informe e-mail e senha.' }, { status: 400 })
  }

  const customer = await prisma.customer.findUnique({ where: { email: email.trim().toLowerCase() } })

  if (!customer || !(await bcrypt.compare(password, customer.passwordHash))) {
    return NextResponse.json({ error: 'E-mail ou senha inválidos.' }, { status: 401 })
  }

  const token = await createCustomerSessionToken(customer.id)
  const response = NextResponse.json({
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      cep: customer.cep,
      street: customer.street,
      number: customer.number,
      complement: customer.complement ?? '',
      neighborhood: customer.neighborhood,
      city: customer.city,
      state: customer.state,
    },
  })
  response.cookies.set(CUSTOMER_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return response
}
