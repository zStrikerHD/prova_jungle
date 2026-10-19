import { useState, type MouseEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import type { NFT } from '@/types'

interface NFTCardProps {
  nft: NFT
}

export function NFTCard({ nft }: NFTCardProps) {
  const [isFavorite, setIsFavorite] = useState(nft.isFavorite || false)

  // Badge RARO para cards raros conforme Figma
  const isRare =
    nft.id === '3' ||
    nft.id === '6' ||
    nft.title?.toLowerCase().includes('baron') ||
    nft.category?.toLowerCase().includes('raro')

  // Exibir ícone de coração conforme o print (Emerald Ape tem o ícone ativo/visível)
  const showHeartIcon = nft.id === '1' || isFavorite

  const handleToggleFavorite = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  return (
    <Link
      to="/mercado/nft/$id"
      params={{ id: nft.id }}
      className="group block font-mono text-left cursor-pointer w-full"
    >
      {/* Moldura da Imagem com fundo escuro #1E1410 e cantos arredondados (conforme Figma Screenshot 1) */}
      <div className="w-full rounded-[20px] bg-[#1E1410] border border-[#2D1D16] p-2 sm:p-2.5 shadow-md transition-all duration-300 group-hover:border-[#D97938]/60 group-hover:-translate-y-1">
        
        {/* Contêiner da Imagem */}
        <div className="relative w-full aspect-square overflow-hidden rounded-[16px] bg-[#140D0A]">
          {/* Badge RARO no canto superior esquerdo com recorte encaixado */}
          {isRare && (
            <span className="absolute top-0 left-0 z-10 rounded-br-[8px] bg-[#D97938] px-2.5 py-1 text-[10px] font-bold text-[#140D0A] uppercase tracking-wider shadow-sm">
              RARO
            </span>
          )}

          {/* Botão de Coração Circular no canto superior direito (apenas para cards favoritos conforme Figma) */}
          {showHeartIcon && (
            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-md transition-all cursor-pointer ${
                isFavorite
                  ? 'bg-[#D97938] text-[#140D0A]'
                  : 'bg-black/40 text-[#C49A6C] hover:bg-[#D97938] hover:text-[#140D0A]'
              }`}
              aria-label="Favoritar NFT"
            >
              <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : 'stroke-[1.8]'}`} />
            </button>
          )}

          <img
            src={nft.imageUrl}
            alt={nft.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </div>

      {/* Tipografia Externa do Card: Nome e Preço abaixo da moldura (conforme Figma Screenshot 1) */}
      <div className="pt-2 px-1 space-y-0.5">
        <h4 className="text-xs sm:text-[13px] font-normal text-white/95 tracking-wide truncate group-hover:text-[#D97938] transition-colors">
          {nft.title}
        </h4>
        <div className="text-xs sm:text-[13px] font-bold text-[#D97938]">
          {nft.priceEth} ETH
        </div>
      </div>
    </Link>
  )
}
