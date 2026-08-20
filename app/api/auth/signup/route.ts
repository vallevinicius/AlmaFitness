import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { createCustomerSessionToken, CUSTOMER_SESSION_COOKIE_NAME } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const rateLimit = await checkRateLimit(`signup:${getClientIp(request)}`, 5, 60 * 60 * 1000)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Muitas tentativas. Tente novamente em ${Math.ceil(rateLimit.retryAfterSeconds / 60)} minuto(s).` },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } },
    )
  }

  const body = await request.json()
  const { name, email, password, phone, cep, street, number, complement, neighborhood, city, state } = body

  if (
    typeof name !== 'string' || !name.trim() ||
    typeof email !== 'string' || !email.trim() ||
    typeof password !== 'string' || password.length < 6 ||
    typeof phone !== 'string' || !phone.trim() ||
    typeof cep !== 'string' || !cep.replace(/\D/g, '').match(/^\d{8}$/) ||
    typeof street !== 'string' || !street.trim() ||
    typeof number !== 'string' || !number.trim() ||
    typeof neighborhood !== 'string' || !neighborhood.trim() ||
    typeof city !== 'string' || !city.trim() ||
    typeof state !== 'string' || !state.trim().match(/^[A-Za-z]{2}$/)
  ) {
    return NextResponse.json({ error: 'Preencha todos os campos corretamente (senha com pelo menos 6 caracteres).' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()

  const existing = await prisma.customer.findUnique({ where: { email: normalizedEmail } })
  if (existing) {
    return NextResponse.json({ error: 'Já existe uma conta com esse e-mail.' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const customer = await prisma.customer.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      phone: phone.trim(),
      cep: cep.replace(/\D/g, ''),
      street: street.trim(),
      number: number.trim(),
      complement: typeof complement === 'string' && complement.trim() ? complement.trim() : null,
      neighborhood: neighborhood.trim(),
      city: city.trim(),
      state: state.trim().toUpperCase(),
    },
  })

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
