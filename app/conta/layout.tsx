import Link from 'next/link'
import type { ReactNode } from 'react'

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-5 md:px-10">
        <Link href="/" className="font-serif text-2xl italic tracking-[-0.06em]">alma<span className="text-terracotta">.</span></Link>
      </header>
      <main className="mx-auto max-w-xl px-6 py-14 md:px-10">{children}</main>
    </div>
  )
}
