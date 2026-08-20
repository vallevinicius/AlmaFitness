import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const VALID_STATUSES = ['PENDENTE', 'CONCLUIDO', 'CANCELADO']

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status } = await request.json()

  if (typeof status !== 'string' || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Status inválido.' }, { status: 400 })
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status: status as 'PENDENTE' | 'CONCLUIDO' | 'CANCELADO' },
  })

  return NextResponse.json(order)
}
