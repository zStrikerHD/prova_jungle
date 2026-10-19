import { apiClient } from '@/lib/api/client'
import type { NFT } from '@/types'

export async function fetchNFTById(id: string, signal?: AbortSignal): Promise<NFT> {
  const { data } = await apiClient.get<NFT>(`/nfts/${id}`, { signal })
  return data
}

export async function toggleFavoriteNFT(id: string): Promise<NFT> {
  const { data } = await apiClient.post<NFT>(`/nfts/${id}/favorite`)
  return data
}
