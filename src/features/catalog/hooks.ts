import { useQuery } from '@tanstack/react-query'
import { fetchNFTs, fetchCategories } from './api'
import type { NFTQueryParams } from '@/types'

export const catalogKeys = {
  all: ['nfts'] as const,
  list: (params: NFTQueryParams) => ['nfts', 'list', params] as const,
  categories: ['categories'] as const,
}

export function useNFTs(params: NFTQueryParams = {}) {
  return useQuery({
    queryKey: catalogKeys.list(params),
    queryFn: ({ signal }) => fetchNFTs(params, signal),
    placeholderData: (previousData) => previousData, // keep previous page while loading
  })
}

export function useCategories() {
  return useQuery({
    queryKey: catalogKeys.categories,
    queryFn: ({ signal }) => fetchCategories(signal),
    staleTime: Infinity,
  })
}
