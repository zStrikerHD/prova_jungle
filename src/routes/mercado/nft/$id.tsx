import { useState, useEffect } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Heart, Search, Star, Minus, Plus, Check, ChevronLeft, ShoppingCart } from 'lucide-react'
import { useNFT, useToggleFavorite } from '@/features/nft/hooks'
import { useCart } from '@/features/cart'
import { useNFTs } from '@/features/catalog'

export const Route = createFileRoute('/mercado/nft/$id')({
  component: NftDetailPage,
})

function NftDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data: fetchedNft, isLoading, isError, error, refetch } = useNFT(id)
  const { data: related } = useNFTs({ limit: 15, sort: 'popular' })
  const toggleFavorite = useToggleFavorite()
  const { addItem } = useCart()

  const nft = fetchedNft

  // Estados locais
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedEdition, setSelectedEdition] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isZoomed, setIsZoomed] = useState(false)
  const [copiedShare, setCopiedShare] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details')
  const [collectionPage, setCollectionPage] = useState(0)

  const [prevId, setPrevId] = useState(id)
  if (prevId !== id) {
    setPrevId(id)
    setSelectedImage(null)
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  if (isLoading && !nft) {
    return (
      <div className="min-h-[935px] lg:min-h-[1730px] w-full px-6 lg:px-[120px] py-12 font-mono">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 w-32 bg-[#251B15] rounded animate-pulse mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Gallery Skeleton */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-5 items-start">
            <div className="flex sm:flex-col gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#1C1512] border border-[#2A201A] animate-pulse" />
              ))}
            </div>
            <div className="w-full aspect-square rounded-[24px] bg-[#1C1512] border border-[#2A201A] animate-pulse" />
          </div>

          {/* Details Skeleton */}
          <div className="lg:col-span-5 space-y-6">
            <div className="h-8 w-3/4 bg-[#251B15] rounded animate-pulse" />
            <div className="h-6 w-1/3 bg-[#251B15] rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-[#251B15] rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-[#251B15] rounded animate-pulse" />
            </div>
            <div className="h-12 w-full bg-[#251B15] rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !nft) {
    const notFound = (error as { response?: { status?: number } })?.response?.status === 404
    return (
      <div className="w-full px-6 lg:px-[120px] py-24 text-center font-mono space-y-6">
        <h1 className="text-3xl font-bold text-white">{notFound ? 'NFT não encontrado' : 'Não foi possível carregar o NFT'}</h1>
        <p className="text-sm text-[#A39B95]">{notFound ? `O ativo digital #${id} não foi localizado ou não está disponível.` : 'Houve uma falha de conexão. Tente novamente.'}</p>
        <div>
          {notFound ? <Link
            to="/"
            className="inline-block rounded-xl bg-[#D97938] px-6 py-3 font-bold text-[#140D0A] text-xs uppercase tracking-wider hover:bg-[#E58847] transition-all"
          >
            Voltar ao Mercado
          </Link> : <button type="button" onClick={() => void refetch()} className="rounded-xl bg-[#D97938] px-6 py-3 font-bold text-[#140D0A] text-xs uppercase tracking-wider">Tentar novamente</button>}
        </div>
      </div>
    )
  }

  const activeEdition = selectedEdition || nft.edition

  // Galeria de miniaturas com a imagem principal e ângulos/artes relacionadas
  const galleryThumbnails = [
    nft.imageUrl,
    '/assets/nfts/hero-ape.jpg',
    '/assets/nfts/ape-bucket-hat.jpg',
    '/assets/nfts/ape-turtleneck.jpg',
  ]

  const activeImage = selectedImage || nft.imageUrl

  const handleDecreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  const handleIncreaseQuantity = () => {
    setQuantity((prev) => Math.min(nft.availableEditions, prev + 1))
  }

  const handleBuy = () => {
    if (nft.availableEditions < 1) return
    addItem(nft, quantity, selectedEdition || nft.edition)
    setAddedToCart(true)
    setTimeout(() => {
      navigate({ to: '/cart' })
    }, 400)
  }

  const handleShare = (network: string) => {
    const currentUrl = window.location.href
    if (network === 'copy') {
      navigator.clipboard.writeText(currentUrl)
      setCopiedShare(true)
      setTimeout(() => setCopiedShare(false), 2500)
    } else if (network === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=Confira ${encodeURIComponent(nft.title)} na Kurio!&url=${encodeURIComponent(currentUrl)}`, '_blank')
    } else if (network === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`, '_blank')
    } else if (network === 'email') {
      window.location.href = `mailto:?subject=${encodeURIComponent(nft.title)}&body=${encodeURIComponent(currentUrl)}`
    }
  }

  const editions = ['1/1', '1/10', '1/50', 'ABERTA']

  const relatedItems = (related?.data || []).filter((item) => item.id !== nft.id)
  const collectionPages = Array.from({ length: 3 }, (_, page) => relatedItems.slice(page * 5, page * 5 + 5))

  return (
    <div className="w-full font-mono">
      {toggleFavorite.isError && <p role="alert" className="mx-auto mt-3 max-w-xl rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-center text-xs text-red-200">Não foi possível atualizar o favorito. O estado anterior foi restaurado.</p>}
      
      {/* =======================================================
          LAYOUT MOBILE: Exato do Figma (Mobile / Detalhes do NFT)
         ======================================================= */}
      <div className="block lg:hidden px-3 pt-3 pb-24">
        {/* Card Principal Arredondado */}
        <div className="w-full rounded-[32px] bg-[#1C120D] border border-[#2D1C15] p-4 shadow-2xl space-y-4">
          
          {/* Top Bar: Botão Voltar e Botão Favoritar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate({ to: '/' })}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2A1C16] text-[#E2C7B2] hover:bg-[#38251D] active:scale-95 transition-all cursor-pointer shadow-md"
              aria-label="Voltar"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => toggleFavorite.mutate(nft.id)}
              className={`flex h-10 w-10 items-center justify-center rounded-full bg-[#2A1C16] transition-all active:scale-95 cursor-pointer shadow-md ${
                nft.isFavorite ? 'text-[#D97938]' : 'text-[#C49A6C] hover:text-[#D97938]'
              }`}
              aria-label="Favoritar"
            >
              <Heart className={`h-4 w-4 ${nft.isFavorite ? 'fill-[#D97938]' : 'stroke-current'}`} />
            </button>
          </div>

          {/* Imagem do NFT */}
          <div className="w-full aspect-square overflow-hidden rounded-[24px] bg-[#140D0A] shadow-inner">
            <img
              src={nft.imageUrl}
              alt={nft.title}
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Título e Avaliação */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <h1 className="text-lg font-bold text-white tracking-wide truncate">
              {nft.title}
            </h1>

            <div className="inline-flex items-center gap-1 rounded-full border border-[#D97938]/60 px-2.5 py-0.5 text-xs text-[#FAF4EE] shrink-0">
              <span className="text-[#D97938]">★</span>
              <span className="font-bold">4.8</span>
              <span className="text-[#8C7E74] text-[11px]">(19)</span>
            </div>
          </div>

          {/* Descrição */}
          <p className="text-xs leading-relaxed text-[#A8988C]">
            Um colecionável digital 1/50 finalizado à mão da coleção Kurio Editions, verificado na Ethereum.
          </p>

          {/* Edição */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-white block">
              Edição:
            </span>
            <div className="flex items-center gap-2">
              {['1/10', '1/10', '1/50', 'ABERTA'].map((ed, idx) => {
                const isSelected = activeEdition === ed
                return (
                  <button
                    key={`${ed}-${idx}`}
                    type="button"
                    onClick={() => setSelectedEdition(ed)}
                    className={`rounded-full px-3 py-0.5 text-xs font-mono transition-all cursor-pointer border ${
                      isSelected
                        ? 'border-[#D97938] text-[#D97938] bg-[#D97938]/10'
                        : 'border-[#3A2820] text-[#A39B95] hover:border-[#5A382C]'
                    }`}
                  >
                    {ed}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Metadados */}
          <div className="space-y-1 pt-1 text-xs font-mono">
            <p>
              <span className="text-[#8A7E75]">ID do token: </span>
              <span className="text-[#C4BCB4]">#{nft.id === '1' ? '0042' : String(nft?.id ?? id ?? '1').padStart(4, '0')}</span>
            </p>
            <p>
              <span className="text-[#8A7E75]">Coleção: </span>
              <span className="text-[#C4BCB4]">{nft.id === '1' ? 'Kurio Apes' : (nft.author || 'Kurio Apes')}</span>
            </p>
            <p>
              <span className="text-[#8A7E75]">Atributos: </span>
              <span className="text-[#C4BCB4]">Óculos, Esmeralda, Raro</span>
            </p>
          </div>

          {/* Caixa de Compra / Ação Inferior */}
          <div className="rounded-[24px] bg-[#160E0A] p-4 space-y-3.5 border border-[#2A1C16]/60">
            {/* Linha Quantidade e Preço */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8A7E75]">Qtd.</span>
                <button
                  type="button"
                  onClick={handleDecreaseQuantity}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C87C45] text-[#140D0A] font-bold text-xs hover:bg-[#D97938] active:scale-90 transition-all cursor-pointer"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="h-3 w-3 stroke-[3]" />
                </button>
                <span className="text-sm font-bold text-white px-1 min-w-[16px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncreaseQuantity}
                  disabled={quantity >= nft.availableEditions}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C87C45] text-[#140D0A] font-bold text-xs hover:bg-[#D97938] active:scale-90 transition-all cursor-pointer"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="h-3 w-3 stroke-[3]" />
                </button>
              </div>

              <div className="text-base sm:text-lg font-bold text-[#D97938]">
                {nft.priceEth} ETH
              </div>
            </div>

            {/* Linha de Botões: Comprar NFT + Carrinho */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleBuy}
                disabled={nft.availableEditions < 1}
                className="flex-1 h-[50px] rounded-[18px] bg-[#C87C45] hover:bg-[#D97938] active:scale-95 text-[#140D0A] font-bold text-sm tracking-wide flex items-center justify-center shadow-lg transition-all cursor-pointer"
              >
                {addedToCart ? 'Adicionado!' : 'Comprar NFT'}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (nft.availableEditions > 0) addItem(nft, quantity, activeEdition)
                  setAddedToCart(true)
                  setTimeout(() => setAddedToCart(false), 2000)
                }}
                className="flex h-[50px] w-[50px] items-center justify-center rounded-[18px] bg-[#221611] text-[#C49A6C] hover:text-white hover:border-[#C87C45] active:scale-95 border border-[#2E1E17] transition-all cursor-pointer"
                aria-label="Adicionar ao carrinho"
              >
                <ShoppingCart className="h-5 w-5" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* =======================================================
          LAYOUT DESKTOP: Galeria Completa e Abas
         ======================================================= */}
      <div className="hidden lg:block px-6 lg:px-[120px] py-8 sm:py-12">
        {/* 1. Breadcrumbs */}
        <nav className="mb-8 flex items-center gap-2 text-xs text-[#A39B95]">
          <Link to="/" className="hover:text-white transition-colors">
            Início
          </Link>
          <span className="text-[#5A473C]">/</span>
          <a href="/#mercado" className="hover:text-white transition-colors text-white font-semibold">
            Mercado
          </a>
        </nav>

        {/* 2. Conteúdo Principal em 2 Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        
        {/* Coluna da Esquerda: Miniaturas e Card Principal */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-5 items-start">
          
          {/* Miniaturas Verticais */}
          <div className="flex sm:flex-col gap-3.5 overflow-x-auto sm:overflow-visible w-full sm:w-auto pb-2 sm:pb-0 shrink-0">
            {galleryThumbnails.map((imgUrl, index) => {
              const isActive = activeImage === imgUrl
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedImage(imgUrl)}
                  aria-label={`Visualizar miniatura ${index + 1}`}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 aspect-square rounded-xl overflow-hidden bg-[#1C1512] border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'border-[#D97938] shadow-md shadow-[#D97938]/20 scale-105'
                      : 'border-[#2A201A] hover:border-[#D97938]/60 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${nft.title} miniatura ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              )
            })}
          </div>

          {/* Card Principal da Imagem */}
          <div className="relative aspect-square w-full max-w-[500px] overflow-hidden rounded-[24px] bg-[#1C1512] border border-[#2A201A] p-4 sm:p-5 shadow-2xl shadow-black/80 flex items-center justify-center group">
            <img
              src={activeImage}
              alt={nft.title}
              fetchPriority="high"
              className={`w-full h-full object-cover rounded-2xl transition-all duration-500 ${
                isZoomed ? 'scale-125 cursor-zoom-out' : 'group-hover:scale-102 cursor-zoom-in'
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
            />

            {/* Botão de Zoom no canto superior direito da imagem */}
            <button
              type="button"
              onClick={() => setIsZoomed(!isZoomed)}
              aria-label="Ampliar imagem"
              className="absolute top-7 right-7 w-9 h-9 rounded-full bg-[#140D0A]/85 backdrop-blur-sm border border-[#3A281E] text-white flex items-center justify-center hover:bg-[#D97938] hover:text-[#140D0A] hover:border-[#D97938] transition-all cursor-pointer shadow-lg"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Coluna da Direita: Informações, Edições, Preço e Botões de Compra */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Título */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
            {nft.title}
          </h1>

          {/* Preço e Avaliações */}
          <div className="flex flex-wrap items-baseline gap-4 pt-1">
            <span className="text-2xl sm:text-3xl font-bold text-[#D97938]">
              {nft.priceEth} ETH
            </span>

            <div className="flex items-center gap-1.5 text-xs text-[#A39B95]">
              <div className="flex text-[#D97938]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="text-[#A39B95] text-[11px] sm:text-xs">
                19 avaliações de colecionadores
              </span>
            </div>
          </div>

          {/* Sobre este NFT */}
          <div className="space-y-2 pt-2">
            <h2 className="text-xs font-bold text-white tracking-wider">
              Sobre este NFT:
            </h2>
            <p className="text-xs text-[#A39B95] leading-relaxed">
              {nft.description ||
                'Um colecionável digital finalizado à mão da coleção Kurio Editions, verificado na Ethereum, com arte desbloqueável e acesso para colecionadores.'}
            </p>
          </div>

          {/* Seletor de Edição */}
          <div className="space-y-2.5 pt-2">
            <h2 className="text-xs font-bold text-white tracking-wider">
              Edição:
            </h2>
            <div className="flex flex-wrap items-center gap-2.5">
              {editions.map((ed) => {
                const isSelected = activeEdition === ed
                return (
                  <button
                    key={ed}
                    type="button"
                    onClick={() => setSelectedEdition(ed)}
                    className={`rounded-full px-4 py-1 text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'border-[#D97938] text-[#D97938] bg-[#D97938]/10'
                        : 'border-[#38261C] text-[#8A7E75] hover:text-white hover:border-[#5A382C]'
                    }`}
                  >
                    {ed}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quantidade e Botões de Ação */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            
            {/* Seletor de Quantidade (+ / -) */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleDecreaseQuantity}
                aria-label="Diminuir quantidade"
                className="w-8 h-8 rounded-full bg-[#D97938] hover:bg-[#E58847] active:scale-90 text-[#140D0A] font-bold flex items-center justify-center transition-all cursor-pointer shadow-md"
              >
                <Minus className="w-4 h-4 stroke-[3]" />
              </button>

              <span className="text-sm font-bold text-white px-1 min-w-[20px] text-center">
                {quantity}
              </span>

              <button
                type="button"
                onClick={handleIncreaseQuantity}
                disabled={quantity >= nft.availableEditions}
                aria-label="Aumentar quantidade"
                className="w-8 h-8 rounded-full bg-[#D97938] hover:bg-[#E58847] active:scale-90 text-[#140D0A] font-bold flex items-center justify-center transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Botão Comprar */}
            <button
              type="button"
              onClick={handleBuy}
              disabled={nft.availableEditions < 1}
              className="rounded-xl bg-[#D97938] hover:bg-[#E58847] active:scale-95 px-8 py-3 text-xs sm:text-sm font-bold text-[#140E0A] tracking-wider uppercase shadow-lg shadow-[#D97938]/20 transition-all cursor-pointer"
            >
              {addedToCart ? 'ADICIONADO!' : 'COMPRAR'}
            </button>

            {/* Botão Favoritar */}
            <button
              type="button"
              onClick={() => toggleFavorite.mutate(nft.id)}
              className={`rounded-xl border px-6 py-3 text-xs sm:text-sm font-bold tracking-wider flex items-center gap-2 transition-all cursor-pointer active:scale-95 ${
                nft.isFavorite
                  ? 'border-[#D97938] bg-[#D97938]/15 text-[#D97938]'
                  : 'border-[#D97938]/60 bg-transparent text-[#D97938] hover:bg-[#D97938]/10'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  nft.isFavorite ? 'fill-[#D97938]' : 'stroke-current'
                }`}
              />
              <span>Favoritar</span>
            </button>

          </div>

          {/* Metadados e Especificações */}
          <div className="pt-6 space-y-2.5 border-t border-[#2A201A] text-xs text-[#A39B95]">
            <p>
              <span className="text-[#8A7E75]">ID do token: </span>
              <span className="text-[#C4BCB4]">#{String(nft?.id ?? id ?? '1').padStart(4, '0')}</span>
            </p>
            <p>
              <span className="text-[#8A7E75]">Coleção: </span>
              <span className="text-[#C4BCB4]">{nft.author || 'Kurio Apes'}</span>
            </p>
            <p>
              <span className="text-[#8A7E75]">Atributos: </span>
              <span className="text-[#C4BCB4]">Óculos, Esmeralda, Raro</span>
            </p>

            {/* Compartilhar */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-white font-bold text-xs">
                Compartilhar este NFT:
              </span>
              <div className="flex items-center gap-2.5 text-white">
                {/* LinkedIn */}
                <button
                  type="button"
                  onClick={() => handleShare('linkedin')}
                  aria-label="Compartilhar no LinkedIn"
                  className="hover:text-[#D97938] transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </button>

                {/* Email */}
                <button
                  type="button"
                  onClick={() => handleShare('email')}
                  aria-label="Compartilhar por e-mail"
                  className="hover:text-[#D97938] transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </button>

                {/* Twitter / X */}
                <button
                  type="button"
                  onClick={() => handleShare('twitter')}
                  aria-label="Compartilhar no Twitter / X"
                  className="hover:text-[#D97938] transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>

                {copiedShare && (
                  <span className="text-[11px] text-[#D97938] flex items-center gap-1 font-bold animate-fadeIn">
                    <Check className="w-3 h-3" /> Link copiado!
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3. Seção de Abas: Detalhes do NFT e Avaliações */}
      <div className="mt-16 pt-8 border-t border-[#2A201A]">
        {/* Barra de Abas */}
        <div className="flex items-center gap-8 border-b border-[#2A201A] text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`relative pb-3 font-bold transition-colors cursor-pointer ${
              activeTab === 'details' ? 'text-[#D97938]' : 'text-[#8A7E75] hover:text-white'
            }`}
          >
            Detalhes do NFT
            {activeTab === 'details' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D97938] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`relative pb-3 font-medium transition-colors cursor-pointer ${
              activeTab === 'reviews' ? 'text-[#D97938]' : 'text-[#8A7E75] hover:text-white'
            }`}
          >
            Avaliações de colecionadores (19)
            {activeTab === 'reviews' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D97938] rounded-full" />
            )}
          </button>
        </div>

        {/* Conteúdo da Aba */}
        <div className="pt-6">
          {activeTab === 'details' ? (
            <div className="space-y-6 max-w-4xl text-xs sm:text-sm leading-relaxed text-[#A39B95]">
              <p>
                {nft.title} é uma obra digital {activeEdition} finalizada à mão da coleção Kurio Editions. Cada atributo fica armazenado nos metadados do token e verificado na Ethereum. A obra explora identidade, movimento e luz em um mundo digital sem fronteiras.
              </p>

              <p>
                A propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um registro permanente de procedência registrada na rede. Nova Sato recebe 5% de direitos autorais nas vendas secundárias, apoiando novos trabalhos e lançamentos da comunidade.
              </p>

              <div className="space-y-4 pt-2">
                <div>
                  <span className="text-white font-bold block mb-1">Rede:</span>
                  <p className="text-[#A39B95]">
                    Cunhado na Ethereum com procedência imutável e metadados armazenados no IPFS.
                  </p>
                </div>

                <div>
                  <span className="text-white font-bold block mb-1">Contrato:</span>
                  <p className="text-[#A39B95]">
                    Direitos autorais do criador: 5% nas vendas secundárias, pagos automaticamente pelos mercados compatíveis.
                  </p>
                </div>

                <div>
                  <span className="text-white font-bold block mb-1">Direitos autorais:</span>
                  <p className="text-[#A39B95]">
                    0x7A42...19E8 • Contrato inteligente ERC-721 verificado.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl">
              {[
                {
                  id: 1,
                  author: 'CryptoWhale_88',
                  rating: 5,
                  date: 'Há 2 dias',
                  comment: 'Arte espetacular! Textura impecável e entrega instantânea na rede Ethereum. Uma das melhores peças da Kurio.',
                },
                {
                  id: 2,
                  author: 'Nova_Collector',
                  rating: 5,
                  date: 'Há 5 dias',
                  comment: 'Comprei a edição 1/50 e recebi os metadados IPFS verificados imediatamente. Super recomendo o artista.',
                },
                {
                  id: 3,
                  author: 'ApeVault',
                  rating: 5,
                  date: 'Há 1 semana',
                  comment: 'Design e paleta de cores únicos. Já valorizou bastante desde o mint inicial.',
                },
              ].map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl bg-[#1C1512] border border-[#2A201A] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs sm:text-sm">{rev.author}</span>
                    <span className="text-[11px] text-[#8A7E75]">{rev.date}</span>
                  </div>
                  <div className="flex text-[#D97938]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-[#A39B95] leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Seção: Mais desta coleção */}
      <div className="mt-16 sm:mt-20">
        <h3 className="text-base sm:text-lg font-bold text-[#D97938] tracking-wide mb-6">
          Mais desta coleção
        </h3>

        {/* Grid de 5 Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {collectionPages[collectionPage].map((item) => (
            <Link
              key={item.id}
              to="/mercado/nft/$id"
              params={{ id: item.id }}
              className="group block font-mono text-left cursor-pointer"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#1C1512] p-2 sm:p-2.5 border border-[#2A201A] shadow-md transition-all duration-300 group-hover:border-[#D97938]/60 group-hover:-translate-y-1">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="pt-3 space-y-1">
                <h4 className="text-xs sm:text-sm font-medium text-white tracking-wide truncate group-hover:text-[#D97938] transition-colors">
                  {item.title}
                </h4>
                <div className="text-xs sm:text-sm font-bold text-[#D97938]">
                  {item.priceEth} ETH
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Indicadores de Paginação (Dots) */}
        <div className="flex justify-center items-center gap-2 pt-8">
          {[0, 1, 2].map((idx) => {
            const isActive = collectionPage === idx
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCollectionPage(idx)}
                aria-label={`Página ${idx + 1}`}
                className={`h-6 w-6 rounded-full transition-all cursor-pointer flex items-center justify-center after:block after:h-2.5 after:w-2.5 after:rounded-full ${
                  isActive
                    ? 'after:bg-[#D97938]'
                    : 'after:border after:border-[#D97938] hover:after:bg-[#D97938]/30'
                }`}
              />
            )
          })}
        </div>
      </div>
      </div>

    </div>
  )
}
