import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/account/logout-button'
import { CUSTOMER_SESSION_COOKIE_NAME, verifyCustomerSessionToken } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'

const statusLabels: Record<string, string> = {
  PENDENTE: 'Pendente',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
}

export default async function AccountPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE_NAME)?.value
  const customerId = token ? await verifyCustomerSessionToken(token) : null

  if (!customerId) redirect('/conta/entrar')

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { orders: { orderBy: { createdAt: 'desc' }, include: { items: true } } },
  })

  if (!customer) redirect('/conta/entrar')

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-4xl tracking-[-0.05em]">Olá, {customer.name.split(' ')[0]}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{customer.email}</p>
        </div>
        <LogoutButton />
      </div>

      <h2 className="mt-12 text-xs uppercase tracking-[0.14em] text-muted-foreground">Meus pedidos</h2>

      {customer.orders.length === 0 ? (
        <p className="mt-4 border-t border-border py-10 text-sm text-muted-foreground">Você ainda não fez nenhum pedido.</p>
      ) : (
        <div className="mt-4 divide-y divide-border border-t border-border">
          {customer.orders.map((order) => (
            <div key={order.id} className="py-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{order.createdAt.toLocaleDateString('pt-BR')}</span>
                <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{statusLabels[order.status] ?? order.status}</span>
              </div>
              <div className="mt-3 space-y-1">
                {order.items.map((item) => (
                  <p key={item.id} className="text-sm">{item.quantity}x {item.productName}</p>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Entrega: {order.street}, {order.number}{order.complement ? ` - ${order.complement}` : ''} · {order.city}/{order.state}
              </p>
              <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                <span>Frete: {Number(order.shippingCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                <span className="font-serif text-lg text-foreground">
                  {(Number(order.total) + Number(order.shippingCost)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
