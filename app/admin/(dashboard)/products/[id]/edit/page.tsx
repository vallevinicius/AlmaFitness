import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductForm } from '@/components/admin/product-form'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id } })

  if (!product) notFound()

  return (
    <div>
      <h1 className="mb-8 font-serif text-4xl tracking-[-0.05em]">Editar produto</h1>
      <ProductForm
        initialValues={{
          id: product.id,
          name: product.name,
          price: Number(product.price).toString(),
          category: product.category,
          color: product.color,
          imageUrl: product.imageUrl,
        }}
      />
    </div>
  )
}
