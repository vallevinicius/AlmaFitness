import Link from 'next/link'
import { prisma } from '@/lib/prisma'

const statusLabels: Record<string, string> = {
  PENDENTE: 'Pendente',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  })

  return (
    <div>
      <h1 className="mb-8 font-serif text-4xl tracking-[-0.05em]">Pedidos</h1>

      {orders.length === 0 ? (
        <p className="border-t border-border py-10 text-sm text-muted-foreground">Nenhum pedido recebido ainda.</p>
      ) : (
        <div className="overflow-x-auto border-t border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <th className="py-3 pr-4 font-medium">Data</th>
                <th className="py-3 pr-4 font-medium">Cliente</th>
                <th className="py-3 pr-4 font-medium">Itens</th>
                <th className="py-3 pr-4 font-medium">Frete</th>
                <th className="py-3 pr-4 font-medium">Total</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium" />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border">
                  <td className="py-3 pr-4 text-muted-foreground">{order.createdAt.toLocaleDateString('pt-BR')}</td>
                  <td className="py-3 pr-4">{order.customerName}</td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} peça(s)
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {Number(order.shippingCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="py-3 pr-4">
                    {(Number(order.total) + Number(order.shippingCost)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{statusLabels[order.status] ?? order.status}</td>
                  <td className="py-3 pr-4">
                    <Link href={`/admin/orders/${order.id}`} className="text-xs uppercase tracking-[0.14em] hover:text-olive">
                      Ver detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
