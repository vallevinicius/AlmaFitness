import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { OrderStatusSelect } from '@/components/admin/order-status-select'

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } })

  if (!order) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 font-serif text-4xl tracking-[-0.05em]">Pedido</h1>
      <p className="mb-8 text-sm text-muted-foreground">{order.createdAt.toLocaleString('pt-BR')}</p>

      <div className="border-t border-border pt-6">
        <h2 className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Cliente</h2>
        <p className="mt-2 text-sm">{order.customerName}</p>
        <p className="text-sm text-muted-foreground">{order.customerEmail} · {order.customerPhone}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {order.street}, {order.number}{order.complement ? ` - ${order.complement}` : ''}<br />
          {order.neighborhood} · {order.city}/{order.state} · CEP {order.cep.replace(/(\d{5})(\d{3})/, '$1-$2')}
        </p>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <h2 className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Itens</h2>
        <div className="mt-3 space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span>{item.quantity}x {item.productName}</span>
              <span>{(Number(item.price) * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
          <span className="uppercase tracking-[0.14em] text-muted-foreground">Subtotal</span>
          <span>{Number(order.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="uppercase tracking-[0.14em] text-muted-foreground">Frete</span>
          <span>{Number(order.shippingCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="uppercase tracking-[0.14em] text-muted-foreground">Total</span>
          <span className="font-serif text-xl">
            {(Number(order.total) + Number(order.shippingCost)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <h2 className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Status</h2>
        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
      </div>
    </div>
  )
}
