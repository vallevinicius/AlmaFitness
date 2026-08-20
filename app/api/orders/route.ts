import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { CUSTOMER_SESSION_COOKIE_NAME, verifyCustomerSessionToken } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'
import { estimateShipping } from '@/lib/shipping'

const MIN_ORDER_QUANTITY = 5

type OrderItemInput = {
  productId?: unknown
  quantity?: unknown
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE_NAME)?.value
  const customerId = token ? await verifyCustomerSessionToken(token) : null

  if (!customerId) {
    return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 })
  }

  const customer = await prisma.customer.findUnique({ where: { id: customerId } })
  if (!customer) {
    return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 })
  }

  const body = await request.json()
  const { cep, street, number, complement, neighborhood, city, state, items } = body

  if (
    typeof cep !== 'string' || !cep.replace(/\D/g, '').match(/^\d{8}$/) ||
    typeof street !== 'string' || !street.trim() ||
    typeof number !== 'string' || !number.trim() ||
    typeof neighborhood !== 'string' || !neighborhood.trim() ||
    typeof city !== 'string' || !city.trim() ||
    typeof state !== 'string' || !state.trim().match(/^[A-Za-z]{2}$/) ||
    !Array.isArray(items) || items.length === 0
  ) {
    return NextResponse.json({ error: 'Dados do pedido inválidos.' }, { status: 400 })
  }

  const validShape = (items as OrderItemInput[]).every(
    (item) =>
      typeof item.productId === 'string' && item.productId &&
      typeof item.quantity === 'number' && Number.isInteger(item.quantity) && item.quantity > 0,
  )

  if (!validShape) {
    return NextResponse.json({ error: 'Itens do pedido inválidos.' }, { status: 400 })
  }

  const totalQuantity = (items as OrderItemInput[]).reduce((sum, item) => sum + (item.quantity as number), 0)
  if (totalQuantity < MIN_ORDER_QUANTITY) {
    return NextResponse.json({ error: `O pedido mínimo é de ${MIN_ORDER_QUANTITY} peças.` }, { status: 400 })
  }

  // Preço e nome vêm sempre do banco, nunca do cliente, para impedir manipulação de valores.
  const productIds = (items as OrderItemInput[]).map((item) => item.productId as string)
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } })
  const productById = new Map(products.map((product) => [product.id, product]))

  if (products.length !== new Set(productIds).size) {
    return NextResponse.json({ error: 'Um ou mais produtos não foram encontrados.' }, { status: 400 })
  }

  const orderItemsData = (items as OrderItemInput[]).map((item) => {
    const product = productById.get(item.productId as string)!
    return {
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: item.quantity as number,
    }
  })

  const total = orderItemsData.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
  const { cost: shippingCost } = estimateShipping(state)

  const order = await prisma.order.create({
    data: {
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      cep: cep.replace(/\D/g, ''),
      street: street.trim(),
      number: number.trim(),
      complement: typeof complement === 'string' && complement.trim() ? complement.trim() : null,
      neighborhood: neighborhood.trim(),
      city: city.trim(),
      state: state.trim().toUpperCase(),
      total,
      shippingCost,
      items: { create: orderItemsData },
    },
  })

  return NextResponse.json({ ok: true, id: order.id, shippingCost }, { status: 201 })
}
