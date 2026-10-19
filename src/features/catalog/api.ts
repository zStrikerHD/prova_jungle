import { apiClient } from '@/lib/api/client'
import type { NFT, NFTQueryParams, PaginatedResponse } from '@/types'

export interface CatalogCategory {
  name: string
  count: number
}

export async function fetchNFTs(params: NFTQueryParams = {}, signal?: AbortSignal): Promise<PaginatedResponse<NFT>> {
  const { data } = await apiClient.get<PaginatedResponse<NFT>>('/nfts', { params, signal })
  return data
}

export async function fetchCategories(signal?: AbortSignal): Promise<CatalogCategory[]> {
  const { data } = await apiClient.get<CatalogCategory[]>('/categories', { signal })
  return data
}
