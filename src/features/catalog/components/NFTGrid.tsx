import { NFTCard } from './NFTCard'
import { Skeleton } from '@/components/shared'
import type { NFT } from '@/types'

interface NFTGridProps {
  nfts?: NFT[]
  isLoading?: boolean
  isError?: boolean
  isFetching?: boolean
  onRetry?: () => void
}

export function NFTGrid({ nfts = [], isLoading, isError, isFetching, onRetry }: NFTGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-full md:w-[258px] space-y-2.5">
            <div className="w-full aspect-square md:w-[258px] md:h-[258px] rounded-2xl bg-[#1C1512] p-2.5 border border-[#2A201A]/60 animate-pulse">
              <Skeleton className="h-full w-full rounded-xl bg-[#251B15]" />
            </div>
            <div className="space-y-1 pt-1">
              <Skeleton className="h-4 w-3/4 rounded bg-[#251B15]" />
              <Skeleton className="h-4 w-1/3 rounded bg-[#251B15]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return <div role="alert" className="rounded-2xl border border-red-500/40 bg-red-950/20 py-12 text-center text-sm text-red-200"><p>Não foi possível carregar os NFTs.</p><button type="button" onClick={onRetry} className="mt-4 rounded-lg bg-[#D97938] px-5 py-2 font-bold text-[#140D0A]">Tentar novamente</button></div>
  }

  if (nfts.length === 0) {
    return (
      <div className="rounded-2xl border border-[#2A201A] bg-[#1A120E] py-16 text-center text-[#998F86] font-mono text-sm">
        Nenhum NFT encontrado para os filtros selecionados.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6" aria-busy={isFetching}>
      {nfts.map((nft) => (
        <NFTCard key={nft.id} nft={nft} />
      ))}
    </div>
  )
}
