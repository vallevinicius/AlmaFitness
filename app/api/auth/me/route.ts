import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { CUSTOMER_SESSION_COOKIE_NAME, verifyCustomerSessionToken } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE_NAME)?.value
  const customerId = token ? await verifyCustomerSessionToken(token) : null

  if (!customerId) {
    return NextResponse.json({ customer: null })
  }

  const customer = await prisma.customer.findUnique({ where: { id: customerId } })

  if (!customer) {
    return NextResponse.json({ customer: null })
  }

  return NextResponse.json({
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
}
