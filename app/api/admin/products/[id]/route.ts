import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { name, price, category, color, imageUrl } = body

  if (
    typeof name !== 'string' || !name.trim() ||
    typeof category !== 'string' || !category.trim() ||
    typeof color !== 'string' || !color.trim() ||
    typeof imageUrl !== 'string' || !imageUrl.trim() ||
    typeof price !== 'number' || !Number.isFinite(price) || price <= 0
  ) {
    return NextResponse.json({ error: 'Preencha todos os campos corretamente.' }, { status: 400 })
  }

  const product = await prisma.product.update({
    where: { id },
    data: { name: name.trim(), price, category: category.trim(), color: color.trim(), imageUrl: imageUrl.trim() },
  })

  return NextResponse.json(product)
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
