'use client'

import { useState, type ChangeEvent } from 'react'
import { fetchAddressByCep, type AddressValues } from '@/lib/cep'

const formatCep = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
}

export function AddressFields({
  values,
  onChange,
  idPrefix,
}: {
  values: AddressValues
  onChange: (values: AddressValues) => void
  idPrefix: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleField = (field: keyof AddressValues) => (e: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...values, [field]: e.target.value })
  }

  const handleCepChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...values, cep: formatCep(e.target.value) })
  }

  const handleCepBlur = async () => {
    const digits = values.cep.replace(/\D/g, '')
    if (digits.length !== 8) return

    setError('')
    setLoading(true)
    const address = await fetchAddressByCep(digits)
    setLoading(false)

    if (!address) {
      setError('CEP não encontrado.')
      return
    }

    onChange({ ...values, ...address })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor={`${idPrefix}-cep`}>CEP</label>
        <input
          id={`${idPrefix}-cep`}
          value={values.cep}
          onChange={handleCepChange}
          onBlur={handleCepBlur}
          inputMode="numeric"
          maxLength={9}
          placeholder="00000-000"
          className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive"
          required
        />
        {loading && <p className="mt-1 text-xs text-muted-foreground">Buscando endereço...</p>}
        {error && <p className="mt-1 text-xs text-terracotta">{error}</p>}
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4">
        <div>
          <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor={`${idPrefix}-street`}>Rua</label>
          <input id={`${idPrefix}-street`} value={values.street} onChange={handleField('street')} className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive" required />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor={`${idPrefix}-number`}>Número</label>
          <input id={`${idPrefix}-number`} value={values.number} onChange={handleField('number')} className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive" required />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor={`${idPrefix}-complement`}>Complemento (opcional)</label>
        <input id={`${idPrefix}-complement`} value={values.complement} onChange={handleField('complement')} className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive" />
      </div>

      <div className="grid grid-cols-[2fr_1fr_1fr] gap-4">
        <div>
          <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor={`${idPrefix}-neighborhood`}>Bairro</label>
          <input id={`${idPrefix}-neighborhood`} value={values.neighborhood} onChange={handleField('neighborhood')} className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive" required />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor={`${idPrefix}-city`}>Cidade</label>
          <input id={`${idPrefix}-city`} value={values.city} onChange={handleField('city')} className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive" required />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor={`${idPrefix}-state`}>UF</label>
          <input id={`${idPrefix}-state`} value={values.state} onChange={handleField('state')} maxLength={2} className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm uppercase outline-none focus:border-olive" required />
        </div>
      </div>
    </div>
  )
}
