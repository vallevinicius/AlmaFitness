'use client'

import { useRouter } from 'next/navigation'
import { useState, type ChangeEvent, type FormEvent } from 'react'

type ProductFormValues = {
  id?: string
  name: string
  price: string
  category: string
  color: string
  imageUrl: string
}

export function ProductForm({ initialValues }: { initialValues?: ProductFormValues }) {
  const router = useRouter()
  const isEditing = Boolean(initialValues?.id)

  const [values, setValues] = useState<ProductFormValues>(
    initialValues ?? { name: '', price: '', category: '', color: '', imageUrl: '' },
  )
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleChange = (field: keyof ProductFormValues) => (e: ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, [field]: e.target.value }))
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/admin/upload', { method: 'POST', body: formData })
    const data = await response.json()

    setUploading(false)

    if (!response.ok) {
      setError(data.error ?? 'Não foi possível enviar a imagem.')
      return
    }

    setValues((current) => ({ ...current, imageUrl: data.url }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const price = Number(values.price.replace(',', '.'))
    if (
      !values.name.trim() || !values.category.trim() || !values.color.trim() || !values.imageUrl.trim() ||
      !Number.isFinite(price) || price <= 0
    ) {
      setError('Preencha todos os campos com valores válidos.')
      return
    }

    setLoading(true)

    const response = await fetch(
      isEditing ? `/api/admin/products/${initialValues!.id}` : '/api/admin/products',
      {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          price,
          category: values.category,
          color: values.color,
          imageUrl: values.imageUrl,
        }),
      },
    )

    setLoading(false)

    if (!response.ok) {
      setError('Não foi possível salvar o produto.')
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg">
      <div>
        <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor="name">Nome</label>
        <input
          id="name"
          value={values.name}
          onChange={handleChange('name')}
          className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive"
          required
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor="price">Preço (R$)</label>
          <input
            id="price"
            value={values.price}
            onChange={handleChange('price')}
            inputMode="decimal"
            placeholder="298.00"
            className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive"
            required
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor="category">Categoria</label>
          <input
            id="category"
            value={values.category}
            onChange={handleChange('category')}
            placeholder="Vestidos"
            className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive"
            required
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor="color">Cor</label>
        <input
          id="color"
          value={values.color}
          onChange={handleChange('color')}
          placeholder="Cacau"
          className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive"
          required
        />
      </div>

      <div className="mt-5">
        <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor="image">Imagem</label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none file:mr-3 file:cursor-pointer file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-xs file:uppercase file:tracking-[0.14em] file:text-primary-foreground"
        />
        {uploading && <p className="mt-2 text-xs text-muted-foreground">Enviando imagem...</p>}
      </div>

      {values.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={values.imageUrl}
          alt="Pré-visualização"
          className="mt-5 h-48 w-40 object-cover bg-muted"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      )}

      {error && <p className="mt-5 text-xs text-terracotta">{error}</p>}

      <button
        type="submit"
        disabled={loading || uploading}
        className="mt-8 bg-ink px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar produto'}
      </button>
    </form>
  )
}
