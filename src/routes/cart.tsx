import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { CartList } from '@/features/cart/components/CartList'
import { CartSummary } from '@/features/cart/components/CartSummary'

export const Route = createFileRoute('/cart')({
  component: CartPage,
})

const recommendedNFTs = [
  {
    id: '4',
    title: 'Cosmic Bloom #118',
    priceEth: '1.29',
    imageUrl: '/assets/nfts/ape-bucket-hat.jpg',
  },
  {
    id: '5',
    title: 'Violet Nomad #314',
    priceEth: '1.39',
    imageUrl: '/assets/nfts/ape-bucket-hat.jpg',
  },
  {
    id: '6',
    title: 'Ivory Baron #088',
    priceEth: '1.79',
    imageUrl: '/assets/nfts/ape-turtleneck.jpg',
  },
  {
    id: '7',
    title: 'Golden Beat #207',
    priceEth: '0.99',
    imageUrl: '/assets/nfts/ape-headphones.jpg',
  },
  {
    id: '9',
    title: 'Golden Signal #160',
    priceEth: '0.39',
    imageUrl: '/assets/nfts/ape-headphones.jpg',
  },
]

function CartPage() {
  const [activeDot, setActiveDot] = useState(1) // dot do meio ativo conforme print do Figma

  return (
    <div className="w-full px-6 lg:px-[120px] py-8 sm:py-12 font-mono">
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
        <span className="text-white font-semibold">
          Carrinho
        </span>
      </nav>

      {/* 2. Área Principal do Carrinho */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Tabela de Itens (Esquerda) */}
        <div className="lg:col-span-8">
          <CartList />
        </div>

        {/* Resumo da Carteira (Direita) */}
        <div className="lg:col-span-4">
          <CartSummary />
        </div>
      </div>

      {/* 3. Seção: Colecionadores também viram */}
      <div className="mt-20 pt-10 border-t border-[#2A201A]">
        <h3 className="text-base sm:text-lg font-bold text-[#D97938] tracking-wide mb-6">
          Colecionadores também viram
        </h3>

        {/* Grid de 5 Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {recommendedNFTs.map((item) => (
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
            const isActive = activeDot === idx
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveDot(idx)}
                aria-label={`Página ${idx + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#D97938]'
                    : 'border border-[#D97938] bg-transparent hover:bg-[#D97938]/30'
                }`}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
