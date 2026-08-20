import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { DeleteProductButton } from '@/components/admin/delete-product-button'

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-4xl tracking-[-0.05em]">Produtos</h1>
        <Link
          href="/admin/products/new"
          className="bg-ink px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90"
        >
          Novo produto
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="border-t border-border py-10 text-sm text-muted-foreground">Nenhum produto cadastrado ainda.</p>
      ) : (
        <div className="overflow-x-auto border-t border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <th className="py-3 pr-4 font-medium">Imagem</th>
                <th className="py-3 pr-4 font-medium">Nome</th>
                <th className="py-3 pr-4 font-medium">Categoria</th>
                <th className="py-3 pr-4 font-medium">Cor</th>
                <th className="py-3 pr-4 font-medium">Preço</th>
                <th className="py-3 pr-4 font-medium" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border">
                  <td className="py-3 pr-4">
                    <img src={product.imageUrl} alt={product.name} className="h-14 w-11 object-cover bg-muted" />
                  </td>
                  <td className="py-3 pr-4">{product.name}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{product.category}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{product.color}</td>
                  <td className="py-3 pr-4">
                    {Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-4 text-xs uppercase tracking-[0.14em]">
                      <Link href={`/admin/products/${product.id}/edit`} className="hover:text-olive">Editar</Link>
                      <DeleteProductButton id={product.id} name={product.name} />
                    </div>
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
