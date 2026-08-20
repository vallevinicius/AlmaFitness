'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    setLoading(false)

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      setError(data.error ?? 'Usuário ou senha inválidos.')
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <form onSubmit={handleSubmit} className="w-full max-w-sm border border-border bg-card p-8">
        <a href="/" className="font-serif text-3xl italic tracking-[-0.06em]">alma<span className="text-terracotta">.</span></a>
        <h1 className="mt-6 text-xs uppercase tracking-[0.18em] text-muted-foreground">Painel administrativo</h1>

        <label className="mt-8 block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor="username">Usuário</label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive"
          autoFocus
          required
        />

        <label className="mt-5 block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor="password">Senha</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive"
          required
        />

        {error && <p className="mt-4 text-xs text-terracotta">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full bg-ink py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
