'use client'

import Link from 'next/link'
import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { ArrowRight, Heart, Menu, Minus, Plus, Search, ShoppingBag, Sparkles, User, X } from 'lucide-react'
import { AddressFields } from '@/components/address-fields'
import { emptyAddress, type AddressValues } from '@/lib/cep'
import { estimateShipping } from '@/lib/shipping'

type Product = {
  id: string
  name: string
  price: number
  category: string
  color: string
  image: string
}

type CartItem = {
  productId: string
  name: string
  price: number
  image: string
  quantity: number
}

type Customer = { id: string; name: string; email: string; phone: string } & AddressValues

type LoginValues = { email: string; password: string }
type SignupAccountValues = { name: string; email: string; password: string; phone: string }

const categories = [
  { label: 'Movimento', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=85' },
  { label: 'Essenciais', image: 'https://images.unsplash.com/photo-1713201435382-bb915a39be16?auto=format&fit=crop&w=900&q=85' },
  { label: 'Para sair', image: 'https://images.unsplash.com/photo-1625585675064-7b8cdcd0ca49?auto=format&fit=crop&w=900&q=85' },
]

const currency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const MIN_ORDER_QUANTITY = 5

export function Storefront({ products, initialCustomer }: { products: Product[]; initialCustomer: Customer | null }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [favorites, setFavorites] = useState<string[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState('Todos')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [customer, setCustomer] = useState<Customer | null>(initialCustomer)
  const [deliveryAddress, setDeliveryAddress] = useState<AddressValues>(initialCustomer ?? emptyAddress)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [orderSuccess, setOrderSuccess] = useState(false)

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [loginValues, setLoginValues] = useState<LoginValues>({ email: '', password: '' })
  const [signupAccount, setSignupAccount] = useState<SignupAccountValues>({ name: '', email: '', password: '', phone: '' })
  const [signupAddress, setSignupAddress] = useState<AddressValues>(emptyAddress)

  const shippingEstimate = useMemo(
    () => deliveryAddress.state.trim() ? estimateShipping(deliveryAddress.state) : null,
    [deliveryAddress.state],
  )

  const colorOptions = useMemo(() => ['Todos', ...Array.from(new Set(products.map((p) => p.color)))], [products])

  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase()) || product.category.toLowerCase().includes(query.toLowerCase())
    const matchesColor = selectedColor === 'Todos' || product.color === selectedColor
    return matchesQuery && matchesColor
  }), [products, query, selectedColor])

  const toggleFavorite = (id: string) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const addToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id)
      if (existing) {
        return current.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...current, { productId: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 }]
    })
    setCartOpen(true)
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart((current) => current
      .map((item) => item.productId === productId ? { ...item, quantity: item.quantity + delta } : item)
      .filter((item) => item.quantity > 0))
  }

  const removeFromCart = (productId: string) => setCart((current) => current.filter((item) => item.productId !== productId))

  const closeCart = () => {
    setCartOpen(false)
    setCheckoutOpen(false)
    setOrderSuccess(false)
    setAuthError('')
  }

  const handleLoginChange = (field: keyof LoginValues) => (e: ChangeEvent<HTMLInputElement>) => {
    setLoginValues((current) => ({ ...current, [field]: e.target.value }))
  }

  const handleSignupAccountChange = (field: keyof SignupAccountValues) => (e: ChangeEvent<HTMLInputElement>) => {
    setSignupAccount((current) => ({ ...current, [field]: e.target.value }))
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginValues),
    })
    const data = await response.json().catch(() => ({}))

    setAuthLoading(false)

    if (!response.ok) {
      setAuthError(data.error ?? 'Não foi possível entrar.')
      return
    }

    setCustomer(data.customer)
    setDeliveryAddress(data.customer)
  }

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...signupAccount, ...signupAddress }),
    })
    const data = await response.json().catch(() => ({}))

    setAuthLoading(false)

    if (!response.ok) {
      setAuthError(data.error ?? 'Não foi possível criar a conta.')
      return
    }

    setCustomer(data.customer)
    setDeliveryAddress(data.customer)
  }

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault()
    setOrderError('')

    if (!deliveryAddress.cep.trim() || !deliveryAddress.street.trim() || !deliveryAddress.number.trim() || !deliveryAddress.city.trim() || !deliveryAddress.state.trim()) {
      setOrderError('Preencha o endereço de entrega completo.')
      return
    }

    setPlacingOrder(true)

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...deliveryAddress,
        items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      }),
    })

    setPlacingOrder(false)

    if (!response.ok) {
      setOrderError('Não foi possível concluir o pedido. Tente novamente.')
      return
    }

    setOrderSuccess(true)
    setCart([])
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="bg-olive px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground">Frete grátis nas compras acima de R$ 399</div>
      <header className="relative z-20 border-b border-border bg-background/95 px-5 py-5 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6">
          <button className="md:hidden" aria-label="Abrir menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
          <nav className={`${menuOpen ? 'flex' : 'hidden'} absolute left-0 top-full w-full flex-col gap-5 border-b border-border bg-background px-6 py-6 text-xs uppercase tracking-[0.18em] md:static md:flex md:w-auto md:flex-row md:border-0 md:bg-transparent md:p-0`}>
            <a href="#shop" className="hover:text-olive">Novidades</a><a href="#shop" className="hover:text-olive">Coleções</a><a href="#story" className="hover:text-olive">Alma</a>
          </nav>
          <a href="#top" className="font-serif text-3xl italic tracking-[-0.06em]">alma<span className="text-terracotta">.</span></a>
          <div className="flex items-center gap-4">
            <button aria-label="Buscar" onClick={() => setSearchOpen(!searchOpen)}><Search size={19} strokeWidth={1.5} /></button>
            <Link aria-label={customer ? 'Minha conta' : 'Entrar'} href={customer ? '/conta' : '/conta/entrar'}><User size={19} strokeWidth={1.5} /></Link>
            <button className="relative" aria-label="Sacola" onClick={() => setCartOpen(true)}><ShoppingBag size={19} strokeWidth={1.5} />{cartCount > 0 && <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-terracotta text-[9px] text-primary-foreground">{cartCount}</span>}</button>
          </div>
        </div>
        {searchOpen && <div className="mx-auto mt-5 flex max-w-[1400px] items-center gap-3 border-t border-border pt-4"><Search size={16} /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Busque por peça ou categoria" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" /><button onClick={() => { setQuery(''); setSearchOpen(false) }}><X size={16} /></button></div>}
      </header>

      <section id="top" className="relative mx-4 mt-4 min-h-[620px] overflow-hidden bg-ink text-primary-foreground md:mx-8 md:min-h-[680px]">
        <img src="https://images.unsplash.com/photo-1763403921315-f2ef8697199f?auto=format&fit=crop&w=1800&q=90" alt="Grupo de mulheres se movendo em um estúdio iluminado, vestindo peças Alma" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/30 to-transparent" />
        <div className="relative flex min-h-[620px] flex-col justify-between p-7 md:min-h-[680px] md:p-16">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em]"><span>Coleção 04 · 2026</span><span className="hidden md:block">mantenha a sua ALMA</span></div>
          <div className="max-w-2xl"><p className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-sage"><Sparkles size={14} /> A nova liberdade de vestir</p><h1 className="max-w-2xl font-serif text-6xl leading-[0.88] tracking-[-0.06em] md:text-9xl">Vista o que <em>te move.</em></h1><p className="mt-7 max-w-sm text-sm leading-6 text-primary-foreground/75">Peças que acompanham todas as suas versões, com intenção, conforto e um toque de beleza inesperada.</p><a href="#shop" className="mt-8 inline-flex items-center gap-3 border border-primary-foreground/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.17em] transition-colors hover:bg-primary-foreground hover:text-ink">Explorar coleção <ArrowRight size={15} /></a></div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-8 px-5 py-16 md:grid-cols-3 md:px-10 md:py-24">
        {[['01', 'Design que respira', 'Modelagens que respeitam seu corpo e deixam o movimento acontecer.'], ['02', 'Feito com intenção', 'Materiais escolhidos para durar, sentir e viver muitas histórias.'], ['03', 'Para todos os dias', 'Do primeiro café ao último compromisso, sem trocar de pele.']].map(([number, title, text]) => <div key={number} className="border-t border-border pt-5"><span className="font-mono text-xs text-terracotta">{number}</span><h2 className="mt-8 font-serif text-3xl tracking-[-0.04em]">{title}</h2><p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">{text}</p></div>)}
      </section>

      <section className="bg-sage px-5 py-16 md:px-10 md:py-24"><div className="mx-auto max-w-[1400px]"><div className="mb-10 flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-[0.2em] text-olive">Escolha seu caminho</p><h2 className="mt-3 font-serif text-5xl tracking-[-0.06em]">Feito para agora.</h2></div><a href="#shop" className="hidden text-xs uppercase tracking-[0.15em] underline underline-offset-4 md:block">Ver tudo</a></div><div className="grid gap-3 md:grid-cols-3">{categories.map((category) => <a href="#shop" key={category.label} className="group relative h-[360px] overflow-hidden bg-olive md:h-[460px]"><img src={category.image} alt={category.label} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-ink/20" /><span className="absolute bottom-6 left-6 font-serif text-3xl italic text-primary-foreground">{category.label}</span><ArrowRight className="absolute bottom-7 right-6 text-primary-foreground" size={21} /></a>)}</div></div></section>

      <section id="shop" className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-24"><div className="mb-9 flex flex-wrap items-end justify-between gap-5"><div><p className="text-[10px] uppercase tracking-[0.2em] text-terracotta">Peças favoritas</p><h2 className="mt-3 font-serif text-5xl tracking-[-0.06em]">A curadoria Alma</h2></div><div className="flex items-center gap-5 text-xs uppercase tracking-[0.14em]"><select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} aria-label="Filtrar por cor" className="border-b border-border bg-transparent py-2 outline-none">{colorOptions.map((color) => <option key={color}>{color}</option>)}</select><span className="text-muted-foreground">{visibleProducts.length} peças</span></div></div><div className="grid gap-x-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">{visibleProducts.map((product) => <article key={product.id} className="group"><div className="relative aspect-[3/4] overflow-hidden bg-muted"><img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /><button aria-label={`Favoritar ${product.name}`} onClick={() => toggleFavorite(product.id)} className="absolute right-4 top-4 rounded-full bg-background/85 p-2 transition-transform hover:scale-110"><Heart size={17} fill={favorites.includes(product.id) ? 'currentColor' : 'none'} className={favorites.includes(product.id) ? 'text-terracotta' : ''} /></button><button onClick={() => addToCart(product)} className="absolute bottom-0 left-0 w-full translate-y-full bg-ink py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-transform group-hover:translate-y-0">Adicionar à sacola</button></div><div className="flex items-start justify-between pt-4"><div><h3 className="font-serif text-xl">{product.name}</h3><p className="mt-1 text-xs text-muted-foreground">{product.category} · {product.color}</p></div><span className="text-sm">{currency(product.price)}</span></div></article>)}</div>{visibleProducts.length === 0 && <p className="border-t border-border py-10 text-sm text-muted-foreground">Nenhuma peça encontrada. Tente outra busca.</p>}</section>

      <section id="story" className="grid bg-ink text-primary-foreground md:grid-cols-2"><div className="flex flex-col justify-center p-8 md:p-20"><p className="text-[10px] uppercase tracking-[0.2em] text-sage">Manifesto Alma</p><h2 className="mt-5 max-w-lg font-serif text-5xl leading-[0.95] tracking-[-0.05em] md:text-7xl">Menos pressa. <em>Mais presença.</em></h2><p className="mt-7 max-w-md text-sm leading-7 text-primary-foreground/70">A Alma nasceu da vontade de desacelerar o vestir. Criamos pequenas coleções, produzidas em ritmo humano, para você construir um guarda-roupa que tenha a sua cara e o seu tempo.</p><a href="#newsletter" className="mt-8 flex w-fit items-center gap-3 text-xs uppercase tracking-[0.16em] text-sage">Conheça nossa história <ArrowRight size={15} /></a></div><img src="https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1200&q=85" alt="Araras com roupas selecionadas no ateliê Alma" className="h-[500px] w-full object-cover md:h-[680px]" /></section>

      <section className="bg-terracotta px-5 py-14 text-primary-foreground md:px-10 md:py-20"><div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/70">Só até domingo</p><h2 className="mt-3 max-w-xl font-serif text-5xl leading-none tracking-[-0.06em] md:text-7xl">Seu primeiro passo começa aqui.</h2></div><div className="md:text-right"><p className="mb-5 text-sm text-primary-foreground/80">15% off na primeira compra</p><a href="#shop" className="inline-flex items-center gap-3 bg-ink px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground">Usar meu desconto <ArrowRight size={15} /></a></div></div></section>

      <footer id="newsletter" className="bg-background px-5 py-14 md:px-10 md:py-20"><div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-[1.4fr_1fr_1fr]"><div><a href="#top" className="font-serif text-4xl italic tracking-[-0.06em]">alma<span className="text-terracotta">.</span></a><p className="mt-5 max-w-xs text-sm leading-6 text-muted-foreground">Roupas para estar inteira em tudo o que você faz.</p><form className="mt-8 flex max-w-sm border-b border-foreground/50 pb-3" onSubmit={(e) => e.preventDefault()}><input placeholder="Seu melhor e-mail" aria-label="Seu melhor e-mail" type="email" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" /><button aria-label="Assinar newsletter"><ArrowRight size={18} /></button></form></div><div><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Navegue</p><div className="mt-5 flex flex-col gap-3 text-sm"><a href="#shop">Novidades</a><a href="#shop">Coleções</a><a href="#story">Nossa história</a><a href="#newsletter">Contato</a></div></div><div><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Siga a Alma</p><div className="mt-5 flex gap-5 text-sm"><a href="#newsletter">Instagram</a><a href="#newsletter">Pinterest</a></div><p className="mt-10 text-xs text-muted-foreground">© 2026 Alma Studio. Feito no Brasil.</p></div></div></footer>

      {cartOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <button aria-label="Fechar sacola" onClick={closeCart} className="absolute inset-0 bg-ink/40" />
          <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-background p-6 md:p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl tracking-[-0.04em]">Sua sacola</h2>
              <button aria-label="Fechar" onClick={closeCart}><X size={20} /></button>
            </div>

            {orderSuccess ? (
              <div className="mt-10 flex flex-1 flex-col items-center justify-center text-center">
                <p className="font-serif text-2xl">Pedido realizado!</p>
                <p className="mt-3 text-sm text-muted-foreground">Entraremos em contato para confirmar a entrega.</p>
                <button onClick={closeCart} className="mt-8 bg-ink px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground">Continuar comprando</button>
              </div>
            ) : cart.length === 0 ? (
              <p className="mt-10 text-sm text-muted-foreground">Sua sacola está vazia.</p>
            ) : !checkoutOpen ? (
              <>
                <div className="mt-8 flex-1 space-y-6 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex gap-4">
                      <img src={item.image} alt={item.name} className="h-24 w-20 object-cover bg-muted" />
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <p className="font-serif text-lg">{item.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{currency(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button aria-label="Diminuir quantidade" onClick={() => updateQuantity(item.productId, -1)} className="border border-border p-1"><Minus size={13} /></button>
                          <span className="text-sm">{item.quantity}</span>
                          <button aria-label="Aumentar quantidade" onClick={() => updateQuantity(item.productId, 1)} className="border border-border p-1"><Plus size={13} /></button>
                          <button onClick={() => removeFromCart(item.productId)} className="ml-auto text-xs uppercase tracking-[0.12em] text-terracotta">Remover</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t border-border pt-5">
                  <div className="flex items-center justify-between text-sm"><span>Total</span><span className="font-serif text-xl">{currency(cartTotal)}</span></div>
                  {cartCount < MIN_ORDER_QUANTITY && (
                    <p className="mt-3 text-xs text-terracotta">
                      Pedido mínimo de {MIN_ORDER_QUANTITY} peças. Adicione mais {MIN_ORDER_QUANTITY - cartCount} peça{MIN_ORDER_QUANTITY - cartCount > 1 ? 's' : ''} para continuar.
                    </p>
                  )}
                  <button
                    onClick={() => setCheckoutOpen(true)}
                    disabled={cartCount < MIN_ORDER_QUANTITY}
                    className="mt-5 w-full bg-ink py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-40"
                  >
                    Finalizar pedido
                  </button>
                </div>
              </>
            ) : !customer ? (
              <div className="mt-8 flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                  <p className="text-sm text-muted-foreground">Entre ou crie uma conta para concluir seu pedido.</p>

                  <div className="mt-5 flex gap-6 border-b border-border text-xs uppercase tracking-[0.14em]">
                    <button onClick={() => { setAuthMode('login'); setAuthError('') }} className={`pb-3 ${authMode === 'login' ? 'border-b-2 border-ink' : 'text-muted-foreground'}`}>Entrar</button>
                    <button onClick={() => { setAuthMode('signup'); setAuthError('') }} className={`pb-3 ${authMode === 'signup' ? 'border-b-2 border-ink' : 'text-muted-foreground'}`}>Criar conta</button>
                  </div>

                  {authMode === 'login' ? (
                    <form onSubmit={handleLogin} className="mt-5 space-y-4">
                      <div>
                        <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor="cart-login-email">E-mail</label>
                        <input id="cart-login-email" type="email" value={loginValues.email} onChange={handleLoginChange('email')} className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive" required />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor="cart-login-password">Senha</label>
                        <input id="cart-login-password" type="password" value={loginValues.password} onChange={handleLoginChange('password')} className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive" required />
                      </div>
                      {authError && <p className="text-xs text-terracotta">{authError}</p>}
                      <button type="submit" disabled={authLoading} className="w-full bg-ink py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-50">
                        {authLoading ? 'Entrando...' : 'Entrar'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleSignup} className="mt-5 space-y-4">
                      <div>
                        <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor="cart-signup-name">Nome</label>
                        <input id="cart-signup-name" value={signupAccount.name} onChange={handleSignupAccountChange('name')} className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive" required />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor="cart-signup-email">E-mail</label>
                        <input id="cart-signup-email" type="email" value={signupAccount.email} onChange={handleSignupAccountChange('email')} className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive" required />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor="cart-signup-password">Senha</label>
                        <input id="cart-signup-password" type="password" minLength={6} value={signupAccount.password} onChange={handleSignupAccountChange('password')} className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive" required />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor="cart-signup-phone">Telefone</label>
                        <input id="cart-signup-phone" value={signupAccount.phone} onChange={handleSignupAccountChange('phone')} className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive" required />
                      </div>
                      <AddressFields values={signupAddress} onChange={setSignupAddress} idPrefix="cart-signup" />
                      {authError && <p className="text-xs text-terracotta">{authError}</p>}
                      <button type="submit" disabled={authLoading} className="w-full bg-ink py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-50">
                        {authLoading ? 'Criando conta...' : 'Criar conta'}
                      </button>
                    </form>
                  )}
                </div>
                <button type="button" onClick={() => setCheckoutOpen(false)} className="mt-4 text-xs uppercase tracking-[0.14em] text-muted-foreground underline underline-offset-4">Voltar à sacola</button>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="mt-8 flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                  <p className="text-sm text-muted-foreground">Pedido de <span className="text-foreground">{customer.name}</span></p>
                  <div className="mt-5">
                    <AddressFields values={deliveryAddress} onChange={setDeliveryAddress} idPrefix="delivery" />
                  </div>
                </div>

                {orderError && <p className="mt-4 text-xs text-terracotta">{orderError}</p>}

                <div className="mt-6 border-t border-border pt-5">
                  <div className="flex items-center justify-between text-sm text-muted-foreground"><span>Subtotal</span><span>{currency(cartTotal)}</span></div>
                  <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Frete estimado</span>
                    <span>{shippingEstimate ? `${currency(shippingEstimate.cost)} · ${shippingEstimate.estimatedDays}` : 'Informe o CEP'}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm"><span>Total</span><span className="font-serif text-xl">{currency(cartTotal + (shippingEstimate?.cost ?? 0))}</span></div>
                  <button type="button" onClick={() => setCheckoutOpen(false)} className="mt-4 text-xs uppercase tracking-[0.14em] text-muted-foreground underline underline-offset-4">Voltar à sacola</button>
                  <button type="submit" disabled={placingOrder} className="mt-3 w-full bg-ink py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-50">
                    {placingOrder ? 'Enviando...' : 'Confirmar pedido'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
