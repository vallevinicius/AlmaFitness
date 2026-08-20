import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 text-center text-foreground">
      <a href="/" className="font-serif text-4xl italic tracking-[-0.06em]">alma<span className="text-terracotta">.</span></a>
      <p className="mt-10 font-mono text-xs uppercase tracking-[0.2em] text-terracotta">Erro 404</p>
      <h1 className="mt-5 max-w-xl font-serif text-5xl leading-[0.95] tracking-[-0.05em] md:text-7xl">
        Essa peça <em>não está</em> no closet.
      </h1>
      <p className="mt-6 max-w-sm text-sm leading-6 text-muted-foreground">
        A página que você procura não existe ou foi movida. Que tal voltar para a coleção?
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex items-center gap-3 bg-ink px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90"
      >
        Voltar para a loja <ArrowRight size={15} />
      </Link>
    </main>
  )
}
