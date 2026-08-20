'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { AddressFields } from '@/components/address-fields'
import { emptyAddress, type AddressValues } from '@/lib/cep'

type AccountValues = { name: string; email: string; password: string; phone: string }

export default function SignupPage() {
  const router = useRouter()
  const [values, setValues] = useState<AccountValues>({ name: '', email: '', password: '', phone: '' })
  const [address, setAddress] = useState<AddressValues>(emptyAddress)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (field: keyof AccountValues) => (e: ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, [field]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, ...address }),
    })

    setLoading(false)

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      setError(data.error ?? 'Não foi possível criar a conta.')
      return
    }

    router.push('/conta')
    router.refresh()
  }

  return (
    <div>
      <h1 className="font-serif text-4xl tracking-[-0.05em]">Criar conta</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor="name">Nome</label>
          <input id="name" value={values.name} onChange={handleChange('name')} className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive" autoFocus required />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor="email">E-mail</label>
          <input id="email" type="email" value={values.email} onChange={handleChange('email')} className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive" required />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor="password">Senha</label>
          <input id="password" type="password" minLength={6} value={values.password} onChange={handleChange('password')} className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive" required />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor="phone">Telefone</label>
          <input id="phone" value={values.phone} onChange={handleChange('phone')} className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive" required />
        </div>

        <AddressFields values={address} onChange={setAddress} idPrefix="signup" />

        {error && <p className="text-xs text-terracotta">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-50"
        >
          {loading ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        Já tem conta? <Link href="/conta/entrar" className="underline underline-offset-4">Entrar</Link>
      </p>
    </div>
  )
}
