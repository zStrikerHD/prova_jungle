import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronDown, ChevronLeft, MoreVertical, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'
import { useCart } from '@/features/cart'
import { apiClient } from '@/lib/api/client'
import { formatEth, multiplyEth, percentEth, sumEth } from '@/lib/money'
import type { Order, Quote, Wallet } from '@/types'

export function CheckoutPage() {
  const { user } = useAuth()
  const { items, completePurchase } = useCart()

  // Form states (Coluna esquerda)
  const [displayName, setDisplayName] = useState(user?.displayName || 'Colecionador Alpha')
  const [username, setUsername] = useState(user?.username || 'alpha_collector')
  const [network, setNetwork] = useState('ethereum')
  const [profileName, setProfileName] = useState(user?.username || 'alpha_collector')
  const [walletAddress, setWalletAddress] = useState('')
  const [secondaryAddressOrEns, setSecondaryAddressOrEns] = useState('')
  const [walletType, setWalletType] = useState('metamask')
  const [referralCode, setReferralCode] = useState('')
  const [email, setEmail] = useState(user?.email || 'contato@email.com')
  const [ensName, setEnsName] = useState(user?.ensName || 'alpha')
  const [ensDomain, setEnsDomain] = useState('.eth')
  const [isEnsOpen, setIsEnsOpen] = useState(false)
  const [useOtherWallet, setUseOtherWallet] = useState(false)
  const [collectorNote, setCollectorNote] = useState('')

  // Promo code state
  const [showPromoInput, setShowPromoInput] = useState(false)
  const [promoCode, setPromoCode] = useState(() => sessionStorage.getItem('kurio_coupon') || '')
  const [discountPercent, setDiscountPercent] = useState(0)

  // Wallet payment method selection
  const { data: wallets = [], isLoading: isLoadingWallets } = useQuery({
    queryKey: ['wallets', user?.id],
    queryFn: async () => (await apiClient.get<Wallet[]>('/wallets')).data,
    enabled: !!user,
  })
  const [selectedConnectedWallet, setSelectedConnectedWallet] = useState('')
  const [selectedMobileProvider, setSelectedMobileProvider] = useState<'walletconnect' | 'metamask' | 'coinbase'>('coinbase')

  // Confirmation modal state
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [quote, setQuote] = useState<Quote | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [actionError, setActionError] = useState('')
  const [isProcessing, setProcessing] = useState(false)
  const idempotencyKey = useRef(crypto.randomUUID())
  const settledOrders = useRef(new Set<string>())
  const confirmationRef = useRef<HTMLDivElement>(null)
  const attemptStorageKey = user ? `kurio_pending_attempt:${user.id}` : 'kurio_pending_attempt'

  const finishConfirmedOrder = useCallback((confirmed: Order) => {
    if (settledOrders.current.has(confirmed.id)) return
    settledOrders.current.add(confirmed.id)
    localStorage.removeItem('kurio_pending_order')
    localStorage.removeItem(attemptStorageKey)
    sessionStorage.removeItem('kurio_coupon')
    setOrder(confirmed)
    setIsConfirmationOpen(true)
    completePurchase(confirmed.items)
    setActionError('')
  }, [attemptStorageKey, completePurchase])

  const selectedWallet = wallets.find((wallet) => wallet.id === selectedConnectedWallet) || wallets.find((wallet) => wallet.isPrimary) || wallets[0]
  const selectedWalletMethod = selectedWallet?.type || selectedMobileProvider
  const setSelectedWalletMethod = (type: string) => {
    const match = wallets.find((wallet) => wallet.type === type)
    if (match) { setSelectedConnectedWallet(match.id); setNetwork(match.network) }
  }

  useEffect(() => {
    const listener = (event: Event) => {
      const updated = (event as CustomEvent<Order>).detail
      if (updated.id !== order?.id || updated.version <= (order?.version || 0)) return
      setOrder(updated)
      if (updated.status === 'confirmed') finishConfirmedOrder(updated)
      if (updated.status === 'declined') { localStorage.removeItem('kurio_pending_order'); localStorage.removeItem(attemptStorageKey); setActionError('Pagamento recusado. Seus itens permanecem no carrinho.') }
    }
    window.addEventListener('kurio:order-updated', listener)
    return () => window.removeEventListener('kurio:order-updated', listener)
  }, [order?.id, order?.version, finishConfirmedOrder, attemptStorageKey])

  useEffect(() => {
    const pendingId = localStorage.getItem('kurio_pending_order')
    if (!pendingId) return
    apiClient.get<Order>(`/orders/${pendingId}`).then(({ data }) => {
      setOrder(data)
      if (data.status === 'confirmed') finishConfirmedOrder(data)
      if (data.status === 'declined') { localStorage.removeItem('kurio_pending_order'); localStorage.removeItem(attemptStorageKey); setActionError('Pagamento recusado. Seus itens permanecem no carrinho.') }
    }).catch(() => undefined)
  }, [finishConfirmedOrder, attemptStorageKey])

  useEffect(() => {
    const attemptKey = localStorage.getItem(attemptStorageKey)
    if (!attemptKey || localStorage.getItem('kurio_pending_order')) return
    apiClient.get<Order>(`/order-attempts/${attemptKey}`).then(({ data }) => {
      setOrder(data)
      localStorage.setItem('kurio_pending_order', data.id)
      if (data.status === 'confirmed') finishConfirmedOrder(data)
      else if (data.status === 'declined') { localStorage.removeItem(attemptStorageKey); setActionError('Pagamento recusado. Seus itens permanecem no carrinho.') }
      else setActionError('Pedido recuperado e aguardando confirmação da carteira…')
    }).catch(() => localStorage.removeItem(attemptStorageKey))
  }, [attemptStorageKey, finishConfirmedOrder])

  useEffect(() => {
    if (!order || order.status !== 'pending') return
    const reconcile = () => {
      void apiClient.get<Order>('/orders/' + order.id).then(({ data }) => {
        setOrder(data)
        if (data.status === 'confirmed') finishConfirmedOrder(data)
        if (data.status === 'declined') {
          localStorage.removeItem('kurio_pending_order')
          localStorage.removeItem(attemptStorageKey)
          setActionError('Pagamento recusado. Seus itens permanecem no carrinho.')
        }
      }).catch(() => undefined)
    }
    const timer = window.setInterval(reconcile, 750)
    return () => window.clearInterval(timer)
  }, [order, attemptStorageKey, finishConfirmedOrder])

  useEffect(() => {
    if (!isConfirmationOpen) return
    const dialog = confirmationRef.current
    const previous = document.activeElement as HTMLElement | null
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button, a[href]') || [])
    queueMicrotask(() => focusable()[0]?.focus())
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsConfirmationOpen(false)
      if (event.key !== 'Tab') return
      const elements = focusable(); if (!elements.length) return
      const first = elements[0]; const last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown); previous?.focus() }
  }, [isConfirmationOpen])

  useEffect(() => {
    const changed = () => { if (quote) { setQuote(null); setActionError('Preço ou disponibilidade alterados. Revise uma nova cotação antes de confirmar.') } }
    window.addEventListener('kurio:nft-updated', changed)
    return () => window.removeEventListener('kurio:nft-updated', changed)
  }, [quote])

  // Determinar NFTs a exibir
  const receiptItems = order?.items || items
  const displayItems =
    receiptItems.length > 0
      ? receiptItems.map((item) => {
          return {
            id: item.nft.id,
            title: item.nft.title,
            tokenId: String(item.nft.id || '1').padStart(4, '0'),
            quantity: item.quantity,
            unitPrice: item.nft.priceEth,
            subtotal: multiplyEth(item.nft.priceEth, item.quantity),
            imageUrl: item.nft.imageUrl,
          }
        })
      : []

  const subtotal = order?.subtotalEth || quote?.subtotalEth || sumEth(displayItems.map((item) => item.subtotal))
  const networkFee = order?.networkFeeEth || quote?.networkFeeEth || (items.length ? '0.016' : '0')
  const discountAmount = order?.discountEth || quote?.discountEth || percentEth(subtotal, discountPercent)
  const total = order?.totalEth || quote?.totalEth || sumEth([subtotal, networkFee, `-${discountAmount}`])

  const handleApplyPromo = async (e: FormEvent) => {
    e.preventDefault(); setActionError('')
    try {
      if (!selectedWallet) { setActionError('Selecione uma carteira cadastrada.'); return }
      const { data } = await apiClient.post<Quote>('/quotes', { coupon: promoCode, walletId: selectedWallet.id, network: selectedWallet.network })
      setQuote(data); setDiscountPercent(data.coupon ? 15 : 0)
    } catch (error) {
      setActionError((error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Não foi possível validar o cupom.')
    }
  }

  const handleConfirmPurchase = async () => {
    setActionError('')
    if (!displayName.trim() || !username.trim() || !/^\S+@\S+\.\S+$/.test(email)) { setActionError('Revise os campos obrigatórios do colecionador.'); return }
    if (!items.length) { setActionError('Seu carrinho está vazio.'); return }
    if (!selectedWallet) { setActionError('Cadastre e selecione uma carteira antes de continuar.'); return }
    setProcessing(true)
    try {
      if (!quote) {
        const { data } = await apiClient.post<Quote>('/quotes', { coupon: promoCode || undefined, walletId: selectedWallet.id, network: selectedWallet.network })
        setQuote(data); setDiscountPercent(data.coupon ? 15 : 0)
        setActionError('Valores atualizados. Revise o total e confirme novamente.')
        return
      }
      localStorage.setItem(attemptStorageKey, idempotencyKey.current)
      const { data } = await apiClient.post<Order>('/orders', { quote, walletId: selectedWallet.id, network: selectedWallet.network }, { headers: { 'Idempotency-Key': idempotencyKey.current } })
      setOrder(data)
      localStorage.setItem('kurio_pending_order', data.id)
      if (data.status === 'confirmed') finishConfirmedOrder(data)
      else {
        setActionError('Pedido enviado e aguardando confirmação da carteira…')
        window.setTimeout(async () => {
          try {
            const response = await apiClient.get<Order>(`/orders/${data.id}`)
            setOrder(response.data)
            if (response.data.status === 'confirmed') finishConfirmedOrder(response.data)
            if (response.data.status === 'declined') { localStorage.removeItem('kurio_pending_order'); localStorage.removeItem(attemptStorageKey); setActionError('Pagamento recusado. Seus itens permanecem no carrinho.') }
          } catch { /* A reconciliação será repetida após refresh/reconexão. */ }
        }, 1400)
      }
    } catch (error) {
      const response = (error as { response?: { data?: { message?: string; quote?: Quote } } })?.response?.data
      if (response?.quote) setQuote(response.quote)
      setActionError(response?.message || 'Falha ao processar o pedido. Tente novamente; a mesma tentativa será recuperada sem duplicar a compra.')
    } finally { setProcessing(false) }
  }

  return (
    <div className="w-full font-mono">
      {actionError && <div role="status" aria-live="polite" className="mx-auto mt-3 max-w-3xl rounded-lg border border-[#D97938]/50 bg-[#241612] px-4 py-3 text-xs text-[#F0B083]">{actionError}</div>}
      {/* =======================================================
          LAYOUT MOBILE: Exato do Figma (Mobile / Pagamento - 358 Fill × 832 Fill)
         ======================================================= */}
      <div className="block lg:hidden w-full max-w-[390px] mx-auto px-4 pt-3 pb-8 space-y-6">
        
        {/* Header com botão voltar circular e título */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2A1C16] text-[#E2C7B2] hover:bg-[#38251D] active:scale-95 transition-all cursor-pointer shadow-md"
            aria-label="Voltar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
            Pagamento com carteira
          </h1>
        </div>

        {/* Seção 1: Carteira conectada */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white tracking-wide">
              Carteira conectada
            </span>
            <button
              type="button"
              className="text-xs text-[#D97938] hover:text-[#E58847] hover:underline cursor-pointer"
            >
              Trocar carteira
            </button>
          </div>

          <div className="space-y-2.5" role="radiogroup" aria-label="Carteiras cadastradas">
            {isLoadingWallets && <p className="text-xs text-[#998F86]">Carregando carteirasâ€¦</p>}
            {!isLoadingWallets && !wallets.length && <Link to="/carteiras" className="block rounded-xl border border-[#D97938] p-4 text-center text-xs text-[#D97938]">Cadastrar carteira</Link>}
            {wallets.map((wallet) => (
              <label key={wallet.id} className={`rounded-[18px] bg-[#1E1410] border p-4 flex items-start gap-3 cursor-pointer transition-all ${selectedWallet?.id === wallet.id ? 'border-[#D97938]/60 shadow-md shadow-[#D97938]/10' : 'border-[#2D1C16] hover:border-[#3A2820]'}`}>
                <input type="radio" name="connectedWalletMobile" value={wallet.id} checked={selectedWallet?.id === wallet.id} onChange={() => { setSelectedConnectedWallet(wallet.id); setNetwork(wallet.network); setQuote(null) }} className="mt-1 accent-[#D97938]" />
                <span className="space-y-1 min-w-0">
                  <strong className="block text-sm text-white">{wallet.nickname}{wallet.isPrimary ? ' (principal)' : ''}</strong>
                  <span className="block truncate text-xs text-[#C49A6C]">{wallet.address}</span>
                  <span className="block text-xs capitalize text-[#C49A6C]">Rede {wallet.network}</span>
                </span>
              </label>
            ))}
            {/* Card 1: Reserva */}
            <div className="hidden"
              onClick={() => setSelectedConnectedWallet('reserva')}
              data-class-name={`rounded-[18px] bg-[#1E1410] border p-4 flex items-start justify-between cursor-pointer transition-all ${
                selectedConnectedWallet === 'reserva'
                  ? 'border-[#D97938]/60 shadow-md shadow-[#D97938]/10'
                  : 'border-[#2D1C16] hover:border-[#3A2820]'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#D97938] mt-1">
                  {selectedConnectedWallet === 'reserva' && (
                    <span className="h-2 w-2 rounded-full bg-[#D97938]" />
                  )}
                </span>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white tracking-wide">
                    Reserva
                  </h4>
                  <p className="text-xs text-[#C49A6C]">
                    nova.kurio.eth
                  </p>
                  <p className="text-xs text-[#C49A6C]">
                    Rede Polygon
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="text-[#8A7E75] hover:text-white p-1"
                aria-label="Mais opções"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            {/* Card 2: Principal */}
            <div className="hidden"
              onClick={() => setSelectedConnectedWallet('principal')}
              data-class-name={`rounded-[18px] bg-[#1E1410] border p-4 flex items-start justify-between cursor-pointer transition-all ${
                selectedConnectedWallet === 'principal'
                  ? 'border-[#D97938]/60 shadow-md shadow-[#D97938]/10'
                  : 'border-[#2D1C16] hover:border-[#3A2820]'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#4A3428] mt-1">
                  {selectedConnectedWallet === 'principal' && (
                    <span className="h-2 w-2 rounded-full bg-[#D97938]" />
                  )}
                </span>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white tracking-wide">
                    Principal
                  </h4>
                  <p className="text-xs text-[#C49A6C]">
                    0xA91F...E82C
                  </p>
                  <p className="text-xs text-[#C49A6C]">
                    Rede principal Ethereum
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="text-[#8A7E75] hover:text-white p-1"
                aria-label="Mais opções"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Seção 2: Carteira e rede */}
        <div className="space-y-3">
          <span className="text-sm font-bold text-white tracking-wide block">
            Carteira e rede
          </span>

          <div className="space-y-2.5">
            {/* Opção 1: WalletConnect */}
            <div
              onClick={() => setSelectedMobileProvider('walletconnect')}
              className={`h-[56px] rounded-[16px] bg-[#1E1410] border px-4 flex items-center justify-between cursor-pointer transition-all ${
                selectedMobileProvider === 'walletconnect'
                  ? 'border-[#D97938]/60'
                  : 'border-[#2D1C16] hover:border-[#3A2820]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2A1C16] text-[#D97938] font-bold text-xs">
                  W
                </div>
                <span className="text-xs sm:text-sm font-medium text-white">
                  WalletConnect
                </span>
              </div>
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#4A3428]">
                {selectedMobileProvider === 'walletconnect' && (
                  <span className="h-2 w-2 rounded-full bg-[#D97938]" />
                )}
              </span>
            </div>

            {/* Opção 2: MetaMask */}
            <div
              onClick={() => setSelectedMobileProvider('metamask')}
              className={`h-[56px] rounded-[16px] bg-[#1E1410] border px-4 flex items-center justify-between cursor-pointer transition-all ${
                selectedMobileProvider === 'metamask'
                  ? 'border-[#D97938]/60'
                  : 'border-[#2D1C16] hover:border-[#3A2820]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2A1C16] text-[#D97938] font-bold text-xs">
                  M
                </div>
                <span className="text-xs sm:text-sm font-medium text-white">
                  MetaMask
                </span>
              </div>
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#4A3428]">
                {selectedMobileProvider === 'metamask' && (
                  <span className="h-2 w-2 rounded-full bg-[#D97938]" />
                )}
              </span>
            </div>

            {/* Opção 3: Coinbase Wallet (Selected no print) */}
            <div
              onClick={() => setSelectedMobileProvider('coinbase')}
              className={`h-[56px] rounded-[16px] bg-[#1E1410] border px-4 flex items-center justify-between cursor-pointer transition-all ${
                selectedMobileProvider === 'coinbase'
                  ? 'border-[#D97938]/60'
                  : 'border-[#2D1C16] hover:border-[#3A2820]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2A1C16] text-[#D97938]">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="6" width="18" height="13" rx="3" />
                    <circle cx="16" cy="12" r="1.5" fill="currentColor" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-medium text-white">
                  Coinbase Wallet
                </span>
              </div>
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#D97938]">
                {selectedMobileProvider === 'coinbase' && (
                  <span className="h-2 w-2 rounded-full bg-[#D97938]" />
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Linha do Total */}
        <div className="flex items-baseline justify-end gap-3 pt-2">
          <span className="text-sm font-medium text-[#FAF4EE]">
            Total:
          </span>
          <span className="text-lg font-bold text-[#D97938]">
            {items.length > 0 ? `${formatEth(total)} ETH` : '0.000 ETH'}
          </span>
        </div>

        {/* Botão Confirmar Compra */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleConfirmPurchase}
            disabled={isProcessing || !items.length}
            className="w-full h-[52px] rounded-[20px] bg-[#C87C45] hover:bg-[#D97938] active:scale-98 text-[#140D0A] font-bold text-sm tracking-wide transition-all shadow-lg cursor-pointer flex items-center justify-center"
          >
            {isProcessing ? 'Processando…' : quote ? 'Confirmar valores e comprar' : 'Revisar valores'}
          </button>
        </div>

      </div>

      {/* =======================================================
          LAYOUT DESKTOP: Form Completo e Resumo
         ======================================================= */}
      <div className="hidden lg:block px-6 lg:px-[120px] py-8 sm:py-12">
        {/* 1. Breadcrumbs */}
        <nav className="mb-8 flex items-center gap-2 text-xs text-[#A39B95]">
          <Link to="/" className="hover:text-white transition-colors">
            Início
          </Link>
          <span className="text-[#5A473C]">/</span>
          <Link to="/mercado/nft/$id" params={{ id: '1' }} className="hover:text-white transition-colors">
            Mercado
          </Link>
          <span className="text-[#5A473C]">/</span>
          <span className="text-white font-semibold">Pagamento</span>
        </nav>

        {/* 2. Container Principal de Pagamento: 1200px máx, grid de 2 colunas */}
        <div className="mx-auto w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* ========================================================
              COLUNA ESQUERDA: PERFIL DO COLECIONADOR (FORMULÁRIO)
             ======================================================== */}
          <div className="lg:col-span-7 space-y-6">
          <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
            Perfil do colecionador
          </h1>

          <div className="space-y-4">
            {/* Linha 1: Nome de exibição* + Nome de usuário* */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-[#C4BCB4] font-medium flex items-center gap-1">
                  <span>Nome de exibição</span>
                  <span className="text-[#D97938]">*</span>
                </label>
                <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 focus-within:border-[#D97938] transition-colors">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nome de exibição"
                    className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#C4BCB4] font-medium flex items-center gap-1">
                  <span>Nome de usuário</span>
                  <span className="text-[#D97938]">*</span>
                </label>
                <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 focus-within:border-[#D97938] transition-colors">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nome de usuário"
                    className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Linha 2: Rede * + Nome do perfil* */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-[#C4BCB4] font-medium flex items-center gap-1">
                  <span>Rede</span>
                  <span className="text-[#D97938]">*</span>
                </label>
                <div className="relative rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 focus-within:border-[#D97938] transition-colors">
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="w-full bg-transparent text-xs text-white outline-none appearance-none pr-8 cursor-pointer"
                  >
                    <option value="" className="bg-[#170E0B] text-[#7A6D64]">
                      Selecione uma rede
                    </option>
                    <option value="ethereum" className="bg-[#170E0B] text-white">
                      Ethereum (Mainnet)
                    </option>
                    <option value="polygon" className="bg-[#170E0B] text-white">
                      Polygon
                    </option>
                    <option value="arbitrum" className="bg-[#170E0B] text-white">
                      Arbitrum
                    </option>
                    <option value="optimism" className="bg-[#170E0B] text-white">
                      Optimism
                    </option>
                    <option value="solana" className="bg-[#170E0B] text-white">
                      Solana
                    </option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A6D64]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#C4BCB4] font-medium flex items-center gap-1">
                  <span>Nome do perfil</span>
                  <span className="text-[#D97938]">*</span>
                </label>
                <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 focus-within:border-[#D97938] transition-colors">
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Nome do perfil"
                    className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Linha 3: Endereço da carteira* + ENS ou carteira secundária */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs text-[#C4BCB4] font-medium flex items-center gap-1">
                  <span>Endereço da carteira</span>
                  <span className="text-[#D97938]">*</span>
                </label>
                <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 focus-within:border-[#D97938] transition-colors">
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Endereço 0x da carteira"
                    className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 focus-within:border-[#D97938] transition-colors">
                  <input
                    type="text"
                    value={secondaryAddressOrEns}
                    onChange={(e) => setSecondaryAddressOrEns(e.target.value)}
                    placeholder="ENS ou carteira secundária (opcional)"
                    className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Linha 4: Tipo de carteira* + Código de indicação* */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-[#C4BCB4] font-medium flex items-center gap-1">
                  <span>Tipo de carteira</span>
                  <span className="text-[#D97938]">*</span>
                </label>
                <div className="relative rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 focus-within:border-[#D97938] transition-colors">
                  <select
                    value={walletType}
                    onChange={(e) => setWalletType(e.target.value)}
                    className="w-full bg-transparent text-xs text-white outline-none appearance-none pr-8 cursor-pointer"
                  >
                    <option value="" className="bg-[#170E0B] text-[#7A6D64]">
                      Selecione uma carteira
                    </option>
                    <option value="metamask" className="bg-[#170E0B] text-white">
                      MetaMask
                    </option>
                    <option value="coinbase" className="bg-[#170E0B] text-white">
                      Coinbase Wallet
                    </option>
                    <option value="walletconnect" className="bg-[#170E0B] text-white">
                      WalletConnect
                    </option>
                    <option value="phantom" className="bg-[#170E0B] text-white">
                      Phantom
                    </option>
                    <option value="rainbow" className="bg-[#170E0B] text-white">
                      Rainbow
                    </option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A6D64]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#C4BCB4] font-medium flex items-center gap-1">
                  <span>Código de indicação</span>
                  <span className="text-[#D97938]">*</span>
                </label>
                <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 focus-within:border-[#D97938] transition-colors">
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Código de indicação"
                    className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Linha 5: E-mail* + Nome ENS * */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-[#C4BCB4] font-medium flex items-center gap-1">
                  <span>E-mail</span>
                  <span className="text-[#D97938]">*</span>
                </label>
                <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 focus-within:border-[#D97938] transition-colors">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contato@email.com"
                    className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#C4BCB4] font-medium flex items-center gap-1">
                  <span>Nome ENS</span>
                  <span className="text-[#D97938]">*</span>
                </label>
                <div className="relative rounded-[8px] border border-[#38261E] bg-[#170E0B] px-3 py-2.5 flex items-center gap-2 focus-within:border-[#D97938] transition-colors">
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsEnsOpen(!isEnsOpen)}
                      className="flex items-center gap-1 bg-[#241612] border border-[#38261E] px-2 py-1 rounded text-xs text-[#D97938] font-bold hover:border-[#D97938] transition-colors cursor-pointer"
                    >
                      <span>{ensDomain}</span>
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    {isEnsOpen && (
                      <div className="absolute left-0 top-full mt-1 w-24 rounded-lg bg-[#241612] border border-[#38261E] py-1 shadow-xl z-20">
                        {['.eth', '.crypto', '.nft'].map((dom) => (
                          <button
                            key={dom}
                            type="button"
                            onClick={() => {
                              setEnsDomain(dom)
                              setIsEnsOpen(false)
                            }}
                            className="w-full px-3 py-1 text-left text-xs text-white hover:bg-[#38261E] transition-colors cursor-pointer"
                          >
                            {dom}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={ensName}
                    onChange={(e) => setEnsName(e.target.value)}
                    placeholder="Nome ENS"
                    className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Checkbox: Usar outra carteira? */}
            <div className="pt-2">
              <label className="flex items-center gap-2.5 text-xs text-[#C4BCB4] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useOtherWallet}
                  onChange={(e) => setUseOtherWallet(e.target.checked)}
                  className="accent-[#D97938] h-4 w-4 rounded cursor-pointer"
                />
                <span>Usar outra carteira?</span>
              </label>
            </div>

            {/* Observação do colecionador (opcional) */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs text-[#C4BCB4] font-medium">
                Observação do colecionador (opcional)
              </label>
              <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] p-3 focus-within:border-[#D97938] transition-colors">
                <textarea
                  value={collectorNote}
                  onChange={(e) => setCollectorNote(e.target.value)}
                  placeholder="Instruções especiais ou detalhes sobre a transação..."
                  rows={4}
                  className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            COLUNA DIREITA: SEUS NFTS & RESUMO DE PAGAMENTO
           ======================================================== */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-[#38261E] bg-[#1C130E] p-6 sm:p-7 shadow-xl space-y-5">
            {/* Cabeçalho */}
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Seus NFTs
              </h2>
              <div className="mt-4 flex items-center justify-between pb-2 border-b border-[#2A1E17] text-[11px] text-[#8A7E75] font-medium uppercase tracking-wider">
                <span>NFTs</span>
                <span>Subtotal</span>
              </div>
            </div>

            {/* Lista de NFTs */}
            <div className="divide-y divide-[#2A1E17] max-h-72 overflow-y-auto pr-1">
              {displayItems.map((nft) => (
                <div key={nft.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 truncate">
                    <img
                      src={nft.imageUrl}
                      alt={nft.title}
                      className="h-10 w-10 rounded-lg object-cover bg-[#170E0B] border border-[#38261E] shrink-0"
                    />
                    <div className="space-y-0.5 truncate">
                      <p className="text-xs font-bold text-white truncate">
                        {nft.title}
                      </p>
                      <p className="text-[10px] text-[#8A7E75]">
                        ID do token: #{nft.tokenId}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-[#998F86] mr-2">
                      (x {nft.quantity})
                    </span>
                    <span className="text-xs font-bold text-white">
                      {nft.subtotal} ETH
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Código Promocional */}
            <div className="pt-2 text-xs">
              {!showPromoInput ? (
                <p className="text-[#998F86]">
                  Tem um código promocional?{' '}
                  <button
                    type="button"
                    onClick={() => setShowPromoInput(true)}
                    className="text-[#D97938] hover:underline cursor-pointer font-bold"
                  >
                    Aplique aqui
                  </button>
                </p>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => { setPromoCode(e.target.value); setQuote(null) }}
                    placeholder="Código (ex: 12345)"
                    className="flex-1 rounded-[8px] border border-[#38261E] bg-[#170E0B] px-3 py-1.5 text-xs text-white placeholder-[#7A6D64] outline-none uppercase"
                  />
                  <button
                    type="submit"
                    className="rounded-[8px] bg-[#D97938] px-3 py-1.5 text-xs font-bold text-[#140D0A] uppercase hover:bg-[#E58847] cursor-pointer"
                  >
                    Aplicar
                  </button>
                </form>
              )}
            </div>

            {/* Discriminação de Preços */}
            <div className="space-y-2 pt-2 border-t border-[#2A1E17] text-xs">
              <div className="flex justify-between text-[#C4BCB4]">
                <span>Subtotal</span>
                <span className="text-white font-medium">
                  {formatEth(subtotal, 2)} ETH
                </span>
              </div>

              <div className="flex justify-between text-[#C4BCB4]">
                <span>Desconto do lançamento</span>
                <span className="text-white font-medium">
                  {discountPercent > 0
                    ? `(-) ${formatEth(discountAmount, 2)} ETH (-${discountPercent}%)`
                    : '(-) 00.00'}
                </span>
              </div>

              <div className="flex justify-between items-start text-[#C4BCB4]">
                <div>
                  <span>Taxa de rede</span>
                  <span className="text-[10px] text-[#8A7E75] block">
                    Taxa estimada
                  </span>
                </div>
                <span className="text-white font-medium">
                  {formatEth(networkFee)} ETH
                </span>
              </div>

              {/* Total */}
              <div className="pt-3 border-t border-[#2A1E17] flex justify-between items-center">
                <span className="font-bold text-sm text-white">Total</span>
                <span className="font-bold text-lg text-white">
                  {formatEth(total)} ETH
                </span>
              </div>
            </div>

            {/* Carteira e rede */}
            <div className="space-y-3 pt-3">
              <h3 className="text-xs font-bold text-white tracking-wide">
                Carteira e rede
              </h3>

              {/* Pills demonstrativas */}
              <div className="rounded-lg border border-[#38261E] bg-[#170E0B] px-3 py-2 text-[10px] text-[#A39B95] tracking-wider text-center">
                METAMASK • WALLETCONNECT • COINBASE
              </div>

              {/* Opções de Carteira */}
              <div className="space-y-2">
                {wallets.map((wallet) => (
                  <label key={wallet.id} className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedWallet?.id === wallet.id ? 'border-[#D97938] bg-[#241612]' : 'border-[#38261E] bg-[#170E0B] hover:border-[#4D3328]'}`}>
                    <input type="radio" name="walletPaymentRegistered" checked={selectedWallet?.id === wallet.id} onChange={() => { setSelectedConnectedWallet(wallet.id); setNetwork(wallet.network); setQuote(null) }} className="mt-0.5 accent-[#D97938] h-4 w-4" />
                    <span className="min-w-0 text-xs text-white"><strong className="block">{wallet.nickname}</strong><span className="block truncate text-[#998F86]">{wallet.address} · {wallet.network}</span></span>
                  </label>
                ))}
                {!wallets.length && <Link to="/carteiras" className="block rounded-lg border border-[#D97938] p-3 text-center text-xs text-[#D97938]">Cadastrar uma carteira</Link>}
                <label
                  onClick={() => setSelectedWalletMethod('metamask')}
                  className={`hidden w-full items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedWalletMethod === 'metamask'
                      ? 'border-[#D97938] bg-[#241612]'
                      : 'border-[#38261E] bg-[#170E0B] hover:border-[#4D3328]'
                  }`}
                >
                  <input
                    type="radio"
                    name="walletPayment"
                    checked={selectedWalletMethod === 'metamask'}
                    onChange={() => setSelectedWalletMethod('metamask')}
                    className="accent-[#D97938] h-4 w-4 cursor-pointer"
                  />
                  <span className="text-xs text-white font-medium">MetaMask</span>
                </label>

                <label
                  onClick={() => setSelectedWalletMethod('coinbase')}
                  className={`hidden w-full items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedWalletMethod === 'coinbase'
                      ? 'border-[#D97938] bg-[#241612]'
                      : 'border-[#38261E] bg-[#170E0B] hover:border-[#4D3328]'
                  }`}
                >
                  <input
                    type="radio"
                    name="walletPayment"
                    checked={selectedWalletMethod === 'coinbase'}
                    onChange={() => setSelectedWalletMethod('coinbase')}
                    className="accent-[#D97938] h-4 w-4 cursor-pointer"
                  />
                  <span className="text-xs text-white font-medium">Coinbase Wallet</span>
                </label>
              </div>
            </div>

            {/* Botão Confirmar Compra */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirmPurchase}
                disabled={isProcessing || !items.length}
                className="w-full rounded-[8px] bg-[#D97938] hover:bg-[#E58847] active:scale-[0.99] py-3.5 text-xs font-bold text-[#140D0A] uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                {isProcessing ? 'Processando…' : quote ? 'Confirmar valores e comprar' : 'Revisar valores'}
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* ========================================================
          MODAL DE CONFIRMAÇÃO DE PEDIDO (Desktop / Confirmação de Pedido)
         ======================================================== */}
      {isConfirmationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-label="Confirmação do pedido">
          <div ref={confirmationRef} className="relative my-8 w-full max-w-[578px] rounded-[16px] bg-[#241612] border border-[#38261E] shadow-2xl overflow-hidden font-mono text-left animate-in zoom-in-95 duration-200">
            {/* Botão Fechar */}
            <button
              onClick={() => setIsConfirmationOpen(false)}
              className="absolute top-5 right-5 text-[#8A7E75] hover:text-white transition-colors cursor-pointer z-10"
              aria-label="Fechar modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 sm:p-9 space-y-6">
              {/* Ícone Envelope com cartão "THANK YOU" */}
              <div className="flex justify-center pt-2">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <svg
                    className="w-16 h-16 text-[#D97938]"
                    viewBox="0 0 64 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Cartão saindo com THANK YOU */}
                    <path
                      d="M20 28V12C20 10.8954 20.8954 10 22 10H42C43.1046 10 44 10.8954 44 12V28"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <text
                      x="32"
                      y="19"
                      fontSize="5"
                      fontWeight="bold"
                      fill="currentColor"
                      textAnchor="middle"
                      stroke="none"
                      letterSpacing="0.5"
                    >
                      THANK
                    </text>
                    <text
                      x="32"
                      y="25"
                      fontSize="5"
                      fontWeight="bold"
                      fill="currentColor"
                      textAnchor="middle"
                      stroke="none"
                      letterSpacing="0.5"
                    >
                      YOU
                    </text>
                    {/* Envelope */}
                    <rect
                      x="10"
                      y="24"
                      width="44"
                      height="30"
                      rx="4"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="#241612"
                    />
                    {/* Aba do envelope */}
                    <path
                      d="M10 26L32 40L54 26"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>

              {/* Título Principal */}
              <h2 className="text-center text-sm sm:text-base font-bold text-white tracking-wide">
                Seus NFTs agora estão na sua carteira
              </h2>

              {/* Resumo da transação (4 colunas com bordas) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 rounded-xl border border-[#38261E] bg-[#170E0B] divide-y sm:divide-y-0 sm:divide-x divide-[#38261E] p-3 text-xs">
                <div className="p-2 space-y-1">
                  <span className="text-[10px] text-[#8A7E75] uppercase block">
                    ID da transação
                  </span>
                  <span className="text-white font-medium truncate block">
                    {order?.transactionHash ? `${order.transactionHash.slice(0, 8)}…${order.transactionHash.slice(-4)}` : '—'}
                  </span>
                </div>

                <div className="p-2 space-y-1">
                  <span className="text-[10px] text-[#8A7E75] uppercase block">
                    Data
                  </span>
                  <span className="text-white font-medium block">
                    {order ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(order.createdAt)) : '—'}
                  </span>
                </div>

                <div className="p-2 space-y-1">
                  <span className="text-[10px] text-[#8A7E75] uppercase block">
                    Total
                  </span>
                  <span className="text-white font-bold block">
                    {formatEth(total)} ETH
                  </span>
                </div>

                <div className="p-2 space-y-1">
                  <span className="text-[10px] text-[#8A7E75] uppercase block">
                    Carteira
                  </span>
                  <span className="text-white font-medium capitalize block">
                    {order?.walletAddress ? `${order.walletAddress.slice(0, 6)}â€¦${order.walletAddress.slice(-4)}` : 'â€”'}
                  </span>
                </div>
              </div>

              {/* Detalhes da transação */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-white tracking-wide">
                  Detalhes da transação
                </h3>

                {/* Cabeçalho da tabela de itens */}
                <div className="grid grid-cols-12 pb-2 border-b border-[#38261E] text-[10px] text-[#8A7E75] font-medium uppercase tracking-wider">
                  <div className="col-span-6">NFTs</div>
                  <div className="col-span-3 text-center">Edições</div>
                  <div className="col-span-3 text-right">Subtotal</div>
                </div>

                {/* Lista de itens comprados */}
                <div className="divide-y divide-[#38261E] max-h-56 overflow-y-auto pr-1">
                  {displayItems.map((nft) => (
                    <div
                      key={nft.id}
                      className="grid grid-cols-12 py-3 items-center text-xs"
                    >
                      {/* Coluna 1: Imagem + Info */}
                      <div className="col-span-6 flex items-center gap-3 truncate">
                        <img
                          src={nft.imageUrl}
                          alt={nft.title}
                          className="h-10 w-10 rounded-lg object-cover bg-[#170E0B] border border-[#38261E] shrink-0"
                        />
                        <div className="space-y-0.5 truncate">
                          <p className="font-bold text-white truncate text-xs">
                            {nft.title}
                          </p>
                          <p className="text-[10px] text-[#8A7E75]">
                            ID do token: #{nft.tokenId}
                          </p>
                        </div>
                      </div>

                      {/* Coluna 2: Edições */}
                      <div className="col-span-3 text-center text-[11px] text-[#998F86]">
                        (x {nft.quantity})
                      </div>

                      {/* Coluna 3: Subtotal */}
                      <div className="col-span-3 text-right font-bold text-white text-xs">
                        {nft.subtotal} ETH
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totais abaixo dos itens */}
                <div className="pt-3 border-t border-[#38261E] space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#8A7E75]">
                    <span>Taxa de rede</span>
                    <span className="text-white font-medium">
                      {formatEth(networkFee)} ETH
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-white pt-1">
                    <span>Total</span>
                    <span>{formatEth(total)} ETH</span>
                  </div>
                </div>
              </div>

              {/* Texto de confirmação */}
              <p className="text-center text-[11px] text-[#8A7E75] leading-relaxed max-w-md mx-auto pt-2">
                Transação confirmada na Ethereum. A propriedade foi transferida para sua carteira conectada e registrada na rede.
              </p>

              {/* Botão Ver no Etherscan */}
              <div className="pt-1 flex justify-center">
                <a
                  href={order?.transactionHash ? `${order.network === 'polygon' ? 'https://polygonscan.com/tx/' : 'https://etherscan.io/tx/'}${order.transactionHash}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-[8px] bg-[#D97938] hover:bg-[#E58847] active:scale-[0.99] px-8 py-3 text-xs font-bold text-[#140D0A] uppercase tracking-wider transition-all shadow-md text-center"
                >
                  Ver no Etherscan
                </a>
              </div>
            </div>

            {/* Linha de borda laranja na parte inferior (conforme Figma) */}
            <div className="h-[3px] w-full bg-[#D97938]" />
          </div>
        </div>
      )}
    </div>
  )
}
