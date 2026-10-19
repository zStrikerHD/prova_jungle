import { ChevronDown } from 'lucide-react'

export type SortOption = 'recent' | 'price_asc' | 'price_desc' | 'popular'

interface CatalogHeaderProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
  sortBy?: SortOption
  onSortChange?: (sort: SortOption) => void
}

export function CatalogHeader({
  activeTab = 'Todos os NFTs',
  onTabChange,
  sortBy = 'recent',
  onSortChange,
}: CatalogHeaderProps) {
  const tabs = ['Todos os NFTs', 'Novos lançamentos', 'Em alta']

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A201A]/60 pb-3 font-mono text-xs">
      {/* Abas de Navegação do Catálogo */}
      <div className="flex items-center gap-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab
          return (
            <div key={tab} className="relative py-1">
              <button
                type="button"
                onClick={() => onTabChange?.(tab)}
                className={`transition-colors font-medium ${
                  isActive ? 'text-[#D97938] font-bold' : 'text-[#998F86] hover:text-white'
                }`}
              >
                {tab}
              </button>
              {isActive && (
                <span className="absolute -bottom-3 left-0 right-0 h-[2px] bg-[#D97938] rounded-full" />
              )}
            </div>
          )
        })}
      </div>

      {/* Ordenação (Desktop) */}
      <div className="flex items-center gap-2 text-[#C4BCB4]">
        <span>Ordenar por:</span>
        <div className="relative inline-block">
          <select
            aria-label="Ordenar catálogo"
            value={sortBy}
            onChange={(e) => onSortChange?.(e.target.value as SortOption)}
            className="appearance-none bg-transparent pr-6 py-0.5 text-white font-semibold cursor-pointer focus:outline-none hover:text-[#D97938] transition-colors"
          >
            <option value="recent" className="bg-[#140D0A]">Listados recentemente</option>
            <option value="price_asc" className="bg-[#140D0A]">Menor preço</option>
            <option value="price_desc" className="bg-[#140D0A]">Maior preço</option>
            <option value="popular" className="bg-[#140D0A]">Mais populares</option>
          </select>
          <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none text-[#C4BCB4]" />
        </div>
      </div>
    </div>
  )
}
