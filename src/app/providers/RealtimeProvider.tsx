import { useEffect, useRef, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'
import { disconnectSocket, getSocket } from '@/lib/socket/client'
import type { NFT, Order, PaginatedResponse } from '@/types'
import { apiClient } from '@/lib/api/client'

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth(); const userId = user?.id; const queryClient = useQueryClient(); const versions = useRef(new Map<string, number>())
  useEffect(() => {
    if (!userId) { disconnectSocket(); return }
    versions.current.clear()
    let socket: Awaited<ReturnType<typeof getSocket>> | null = null
    let disposed = false
    const currentUserId = userId
    const onNft = ({ resourceId, version, nft }: { resourceId: string; version: number; nft: NFT }) => {
      if ((versions.current.get(`nft:${resourceId}`) || 0) >= version) return
      versions.current.set(`nft:${resourceId}`, version)
      queryClient.setQueryData(['nft', resourceId], nft)
      queryClient.setQueriesData<PaginatedResponse<NFT>>({ queryKey: ['nfts'] }, (old) => old ? { ...old, data: old.data.map((item) => item.id === resourceId ? { ...item, ...nft } : item) } : old)
      window.dispatchEvent(new CustomEvent('kurio:nft-updated', { detail: { resourceId, version, nft } }))
    }
    const onOrder = ({ userId, resourceId, version, order }: { userId: string; resourceId: string; version: number; order: Order }) => {
      if (userId !== currentUserId || (versions.current.get(`order:${resourceId}`) || 0) >= version) return
      versions.current.set(`order:${resourceId}`, version); queryClient.setQueryData(['order', resourceId], order)
      window.dispatchEvent(new CustomEvent('kurio:order-updated', { detail: order }))
    }
    const reconcile = () => {
      document.documentElement.dataset.socketConnected = 'true'
      delete document.documentElement.dataset.socketError
      void queryClient.invalidateQueries({ queryKey: ['nfts'] }); void queryClient.invalidateQueries({ queryKey: ['nft'] })
      window.dispatchEvent(new CustomEvent('kurio:reconcile-cart'))
      const pendingId = localStorage.getItem('kurio_pending_order')
      if (pendingId) void apiClient.get<Order>(`/orders/${pendingId}`).then(({ data }) => onOrder({ userId: currentUserId, resourceId: data.id, version: data.version, order: data })).catch(() => undefined)
    }
    const onConnectError = (error: Error) => { document.documentElement.dataset.socketError = error.message }
    void getSocket().then((connectedSocket) => {
      if (disposed) return
      socket = connectedSocket
      socket.on('nft.updated', onNft); socket.on('order.updated', onOrder); socket.io.on('reconnect', reconcile); socket.on('connect', reconcile); socket.on('connect_error', onConnectError)
      if (socket.connected) reconcile()
      else socket.connect()
    })
    return () => { disposed = true; delete document.documentElement.dataset.socketConnected; delete document.documentElement.dataset.socketError; socket?.off('nft.updated', onNft); socket?.off('order.updated', onOrder); socket?.io.off('reconnect', reconcile); socket?.off('connect', reconcile); socket?.off('connect_error', onConnectError); disconnectSocket() }
  }, [userId, queryClient])
  return children
}
