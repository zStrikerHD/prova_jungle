import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { HeroSection } from '@/features/catalog/components/HeroSection'
import { SidebarFilters } from '@/features/catalog/components/SidebarFilters'
import { CatalogHeader } from '@/features/catalog/components/CatalogHeader'
import { NFTGrid } from '@/features/catalog/components/NFTGrid'
import { Pagination } from '@/features/catalog/components/Pagination'
import { useNFTs } from '@/features/catalog'
import NFTCollections from '@/features/catalog/components/NFTCollections'
import { NFTOn } from '@/features/catalog/components/NFTOn'

interface HomeSearch { q?: string; category?: string; network?: string; min?: number; max?: number; sort?: 'price_asc' | 'price_desc' | 'recent' | 'popular'; page?: number }

export const Route = createFileRoute('/')({
  validateSearch: (raw: Record<string, unknown>): HomeSearch => ({
    q: typeof raw.q === 'string' ? raw.q : undefined,
    category: typeof raw.category === 'string' ? raw.category : undefined,
    network: typeof raw.network === 'string' ? raw.network : undefined,
    min: Number.isFinite(Number(raw.min)) ? Number(raw.min) : undefined,
    max: Number.isFinite(Number(raw.max)) ? Number(raw.max) : undefined,
    sort: ['price_asc', 'price_desc', 'recent', 'popular'].includes(String(raw.sort)) ? raw.sort as 'price_asc' | 'price_desc' | 'recent' | 'popular' : 'recent',
    page: raw.page === undefined ? undefined : Math.max(1, Number(raw.page) || 1),
  }),
  component: HomePage,
})

function HomePage() {
  const rawSearch = Route.useSearch()
  const search = { q: rawSearch.q || '', category: rawSearch.category || 'Arte digital', network: rawSearch.network || 'Todos', min: rawSearch.min, max: rawSearch.max, sort: rawSearch.sort || 'recent' as const, page: rawSearch.page || 1 }
  const navigate = useNavigate({ from: '/' })
  const [tab, setTab] = useState('Todos os NFTs')
  const updateSearch = (next: Partial<typeof search>) => navigate({ search: (previous) => ({ ...previous, ...next }) })

  const { data, isLoading, isError, isFetching, refetch } = useNFTs({
    search: search.q || undefined,
    category: search.category === 'Todos' ? undefined : search.category,
    network: search.network === 'Todos' ? undefined : search.network,
    minPrice: search.min,
    maxPrice: search.max,
    sort: search.sort,
    page: search.page,
    limit: 9,
  })

  return (
    <div className="w-full px-3 sm:px-6 lg:px-[120px] pt-3 pb-24 sm:py-8 space-y-4 sm:space-y-16">
      {/* 1. Destaque / Hero com Carrossel */}
      <HeroSection />

      {/* 2. Área do Catálogo e Mercado */}
      <section id="mercado" className="pt-2 sm:pt-4">
        <label className="mb-5 block max-w-md text-xs text-[#C4BCB4]">Buscar no mercado
          <input aria-label="Buscar NFTs" value={search.q} onChange={(event) => updateSearch({ q: event.target.value, page: 1 })} className="mt-2 w-full rounded-xl border border-[#2A201A] bg-[#1C1613] px-4 py-3 text-white focus:border-[#D97938] focus:outline-none" placeholder="Nome, artista ou descrição" />
        </label>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-10 items-start">
          
          {/* Coluna da Esquerda: Filtros (Apenas Desktop conforme Figma) */}
          <div className="lg:col-span-1">
            <SidebarFilters
              selectedCollection={search.category}
              onSelectCollection={(col) => {
                updateSearch({ category: col, page: 1 })
              }}
              selectedNetwork={search.network}
              onSelectNetwork={(net) => {
                updateSearch({ network: net, page: 1 })
              }}
              onApplyPriceRange={(min, max) => {
                updateSearch({ min, max, page: 1 })
              }}
            />
          </div>

          {/* Coluna da Direita: Abas, Grade de NFTs e Paginação */}
          <div className="lg:col-span-3 space-y-6">
            <CatalogHeader
              activeTab={tab}
              onTabChange={setTab}
              sortBy={search.sort}
              onSortChange={(s) => {
                updateSearch({ sort: s, page: 1 })
              }}
            />

            <NFTGrid nfts={data?.data} isLoading={isLoading} isError={isError} isFetching={isFetching} onRetry={() => void refetch()} />

            <Pagination
              currentPage={search.page}
              totalPages={data?.totalPages || 1}
              onPageChange={(page) => updateSearch({ page })}
            />
          </div>
          <NFTCollections />  
          <NFTOn />
        </div>
      </section>
    </div>
  )
}
