import Link from 'next/link'
import type { ReactNode } from 'react'
import { LogoutButton } from '@/components/admin/logout-button'

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-6 py-4 md:px-10">
        <Link href="/admin" className="flex items-baseline gap-2">
          <span className="font-serif text-2xl italic tracking-[-0.06em]">alma<span className="text-terracotta">.</span></span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Admin</span>
        </Link>
        <nav className="flex items-center gap-6 text-xs uppercase tracking-[0.14em]">
          <Link href="/admin" className="hover:text-olive">Produtos</Link>
          <Link href="/admin/orders" className="hover:text-olive">Pedidos</Link>
          <Link href="/" className="hover:text-olive">Ver loja</Link>
          <LogoutButton />
        </nav>
      </header>
      <main className="mx-auto max-w-[1200px] px-6 py-10 md:px-10">{children}</main>
    </div>
  )
}
