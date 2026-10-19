import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchNFTById, toggleFavoriteNFT } from './api'
import { catalogKeys } from '@/features/catalog/hooks'
import type { NFT, PaginatedResponse } from '@/types'

export const nftKeys = {
  detail: (id: string) => ['nft', id] as const,
}

export function useNFT(id: string) {
  return useQuery({
    queryKey: nftKeys.detail(id),
    queryFn: ({ signal }) => fetchNFTById(id, signal),
    enabled: !!id,
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => toggleFavoriteNFT(id),
    // Optimistic update implementation with rollback
    onMutate: async (id: string) => {
      // Cancel outgoing queries so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: nftKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: catalogKeys.all })

      // Snapshot previous value for single NFT
      const previousNFT = queryClient.getQueryData<NFT>(nftKeys.detail(id))
      const previousLists = queryClient.getQueriesData<PaginatedResponse<NFT>>({ queryKey: catalogKeys.all })

      // Optimistically update single NFT detail cache
      if (previousNFT) {
        queryClient.setQueryData<NFT>(nftKeys.detail(id), {
          ...previousNFT,
          isFavorite: !previousNFT.isFavorite,
          likesCount: (previousNFT.likesCount || 0) + (previousNFT.isFavorite ? -1 : 1),
        })
      }

      // Optimistically update all catalog lists in cache
      queryClient.setQueriesData<PaginatedResponse<NFT>>(
        { queryKey: catalogKeys.all },
        (oldData) => {
          if (!oldData || !Array.isArray(oldData.data)) return oldData
          return {
            ...oldData,
            data: oldData.data.map((item) =>
              item.id === id
                ? {
                    ...item,
                    isFavorite: !item.isFavorite,
                    likesCount: (item.likesCount || 0) + (item.isFavorite ? -1 : 1),
                  }
                : item,
            ),
          }
        },
      )

      return { previousNFT, previousLists }
    },
    // If mutation fails, rollback using the context snapshot
    onError: (_err, id, context) => {
      if (context?.previousNFT) {
        queryClient.setQueryData(nftKeys.detail(id), context.previousNFT)
      }
      context?.previousLists.forEach(([key, value]) => queryClient.setQueryData(key, value))
    },
    // Settle / synchronize with server response
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: nftKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: catalogKeys.all })
    },
  })
}
