import { cookies } from 'next/headers'
import { Storefront } from '@/components/storefront'
import { CUSTOMER_SESSION_COOKIE_NAME, verifyCustomerSessionToken } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'

export default async function Page() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })

  const formattedProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    price: Number(product.price),
    category: product.category,
    color: product.color,
    image: product.imageUrl,
  }))

  const cookieStore = await cookies()
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE_NAME)?.value
  const customerId = token ? await verifyCustomerSessionToken(token) : null
  const customer = customerId ? await prisma.customer.findUnique({ where: { id: customerId } }) : null

  const initialCustomer = customer
    ? {
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
      }
    : null

  return <Storefront products={formattedProducts} initialCustomer={initialCustomer} />
}
