'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Excluir "${name}"? Essa ação não pode ser desfeita.`)) return

    setLoading(true)
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    setLoading(false)
    router.refresh()
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="text-terracotta hover:opacity-70 disabled:opacity-40">
      {loading ? 'Excluindo...' : 'Excluir'}
    </button>
  )
}
