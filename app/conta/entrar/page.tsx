'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    setLoading(false)

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      setError(data.error ?? 'Não foi possível entrar.')
      return
    }

    router.push('/conta')
    router.refresh()
  }

  return (
    <div>
      <h1 className="font-serif text-4xl tracking-[-0.05em]">Entrar</h1>
      <form onSubmit={handleSubmit} className="mt-8">
        <div>
          <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive"
            autoFocus
            required
          />
        </div>
        <div className="mt-5">
          <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive"
            required
          />
        </div>

        {error && <p className="mt-4 text-xs text-terracotta">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full bg-ink py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        Não tem conta? <Link href="/conta/cadastro" className="underline underline-offset-4">Criar conta</Link>
      </p>
    </div>
  )
}
