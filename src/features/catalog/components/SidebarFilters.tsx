import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useCategories } from '@/features/catalog/hooks'

const networkList = ['Ethereum', 'Polygon', 'Solana']

interface SidebarFiltersProps {
  selectedCollection?: string
  onSelectCollection?: (name: string) => void
  selectedNetwork?: string
  onSelectNetwork?: (network: string) => void
  onApplyPriceRange?: (min: number, max: number) => void
}

export function SidebarFilters({
  selectedCollection = 'Arte digital',
  onSelectCollection,
  selectedNetwork = 'Todos',
  onSelectNetwork,
  onApplyPriceRange,
}: SidebarFiltersProps) {
  const { data: rawCollectionList } = useCategories()
  const collectionList = Array.isArray(rawCollectionList) ? rawCollectionList : []
  const [minPrice, setMinPrice] = useState(0.02)
  const [maxPrice, setMaxPrice] = useState(12.3)

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    if (val <= maxPrice) {
      setMinPrice(val)
    }
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    if (val >= minPrice) {
      setMaxPrice(val)
    }
  }

  const handleApply = () => {
    onApplyPriceRange?.(minPrice, maxPrice)
  }

  // Porcentagem visual do slider
  const minPercent = ((minPrice - 0.02) / (12.3 - 0.02)) * 100
  const maxPercent = ((maxPrice - 0.02) / (12.3 - 0.02)) * 100

  return (
    <aside className="w-full lg:w-[260px] space-y-8 font-mono text-xs select-none">
      {/* 1. Coleções */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white tracking-wider">Coleções</h2>
        <ul className="min-h-[214px] space-y-2.5">
          {collectionList.map((collection) => {
            const isSelected = selectedCollection === collection.name
            return (
              <li key={collection.name}>
                <button
                  type="button"
                  onClick={() => onSelectCollection?.(isSelected ? 'Todos' : collection.name)}
                  className="flex w-full items-center justify-between py-0.5 text-left transition-colors group cursor-pointer"
                >
                  <span
                    className={`${
                      isSelected ? 'text-[#D97938] font-bold' : 'text-[#C4BCB4] group-hover:text-white'
                    }`}
                  >
                    {collection.name}
                  </span>
                  <span className="text-[10px] text-[#A39B95]">{collection.count}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* 2. Faixa de Preço Interativa */}
      <div className="space-y-4 pt-2">
        <h2 className="text-sm font-bold text-white tracking-wider">Faixa de preço</h2>

        {/* Dual Range Slider container */}
        <div className="relative pt-3 pb-2">
          {/* Background track */}
          <div className="h-1 w-full rounded-full bg-[#382B23]" />

          {/* Active colored bar */}
          <div
            className="absolute top-3 h-1 bg-[#D97938] rounded-full pointer-events-none"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />

          {/* Invisible inputs on top for smooth dragging */}
          <input
            type="range"
            min="0.02"
            max="12.30"
            step="0.05"
            value={minPrice}
            onChange={handleMinChange}
            aria-label="Preço mínimo"
            className="absolute top-2 w-full appearance-none bg-transparent pointer-events-auto cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D97938] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#140D0A] [&::-webkit-slider-thumb]:shadow-md"
          />
          <input
            type="range"
            min="0.02"
            max="12.30"
            step="0.05"
            value={maxPrice}
            onChange={handleMaxChange}
            aria-label="Preço máximo"
            className="absolute top-2 w-full appearance-none bg-transparent pointer-events-auto cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D97938] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#140D0A] [&::-webkit-slider-thumb]:shadow-md"
          />
        </div>

        <p className="text-[#A39B95] text-[11px] pt-1">
          Preço: {minPrice.toFixed(2).replace('.', ',')} - {maxPrice.toFixed(2).replace('.', ',')} ETH
        </p>

        <button
          type="button"
          onClick={handleApply}
          className="rounded-lg bg-[#D97938] px-5 py-2 font-bold text-black shadow-md hover:bg-[#E58847] active:scale-95 transition-all text-xs cursor-pointer"
        >
          Aplicar
        </button>
      </div>

      {/* 3. Rede */}
      <div className="space-y-4 pt-2">
        <h2 className="text-sm font-bold text-white tracking-wider">Rede</h2>
        <ul className="space-y-2.5">
          {networkList.map((netName) => {
            const isSelected = selectedNetwork === netName
            return (
              <li key={netName}>
                <button
                  type="button"
                  onClick={() => onSelectNetwork?.(isSelected ? 'Todos' : netName)}
                  className="flex w-full items-center justify-between py-0.5 text-left transition-colors group cursor-pointer"
                >
                  <span
                    className={`${
                      isSelected ? 'text-[#D97938] font-bold' : 'text-[#C4BCB4] group-hover:text-white'
                    }`}
                  >
                    {netName}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* 4. NFT em Destaque / Oferta Limitada */}
      <div className="pt-4 space-y-3">
        <div>
          <span className="text-[11px] font-bold text-[#D97938] tracking-widest uppercase block">
            NFT EM DESTAQUE
          </span>
          <span className="text-sm font-bold text-white tracking-wider">
            OFERTA LIMITADA
          </span>
        </div>

        <Link
          to="/mercado/nft/$id"
          params={{ id: '2' }}
          className="aspect-square w-full overflow-hidden rounded-2xl border border-[#2A201A] bg-[#1C1613] block cursor-pointer group"
        >
          <img
            src="/assets/nfts/ape-bucket-hat.jpg"
            alt="NFT em Destaque"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
      </div>
    </aside>
  )
}
