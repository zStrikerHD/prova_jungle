import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { apiClient } from '@/lib/api/client'
import { useAuth } from '@/features/auth'
import type { CartItem, NFT } from '@/types'

interface CartContextType { items: CartItem[]; itemCount: number; isSyncing: boolean; syncError: string; addItem: (nft: NFT, quantity?: number, edition?: string) => void; removeItem: (nftId: string) => void; updateQuantity: (nftId: string, quantity: number) => void; clearCart: () => void; completePurchase: (purchased: CartItem[]) => void }
const CartContext = createContext<CartContextType | undefined>(undefined)
const GUEST_KEY = 'kurio_guest_cart_v3'
const readGuest = (): CartItem[] => { try { const value = JSON.parse(localStorage.getItem(GUEST_KEY) || '[]'); return Array.isArray(value) ? value : [] } catch { return [] } }

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isSessionLoading } = useAuth()
  const userId = user?.id
  const [items, setItems] = useState<CartItem[]>(readGuest)
  const [isSyncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState('')
  const activeUser = useRef<string | null>(null)

  useEffect(() => {
    if (isSessionLoading) return
    if (!userId) {
      if (activeUser.current) setItems(readGuest())
      activeUser.current = null; return
    }
    let cancelled = false; queueMicrotask(() => !cancelled && setSyncing(true))
    apiClient.get<CartItem[]>('/cart').then(async ({ data }) => {
      if (cancelled) return
      const guest = readGuest(); const merged = [...data]
      for (const item of guest) {
        const existing = merged.find((entry) => entry.nftId === item.nftId && entry.edition === item.edition)
        if (existing) existing.quantity = Math.min(existing.quantity + item.quantity, item.nft.availableEditions)
        else merged.push(item)
      }
      if (guest.length) await apiClient.put('/cart', { items: merged })
      localStorage.removeItem(GUEST_KEY); activeUser.current = userId; setItems(merged)
    }).finally(() => !cancelled && setSyncing(false))
    return () => { cancelled = true }
  }, [userId, isSessionLoading])

  const commit = useCallback((updater: (current: CartItem[]) => CartItem[]) => {
    setItems((current) => {
      const next = updater(current)
      if (userId) {
        setSyncError('')
        void apiClient.put('/cart', { items: next }).catch(() => {
          setItems(current)
          setSyncError('Não foi possível sincronizar o carrinho. A alteração foi desfeita.')
        })
      }
      else localStorage.setItem(GUEST_KEY, JSON.stringify(next))
      return next
    })
  }, [userId])

  useEffect(() => {
    const listener = (event: Event) => {
      const { resourceId, nft } = (event as CustomEvent<{ resourceId: string; nft: NFT }>).detail
      commit((current) => current.map((item) => item.nftId === resourceId ? { ...item, nft: { ...item.nft, ...nft }, quantity: Math.min(item.quantity, nft.availableEditions) } : item))
    }
    window.addEventListener('kurio:nft-updated', listener)
    return () => window.removeEventListener('kurio:nft-updated', listener)
  }, [commit])

  useEffect(() => {
    if (!userId) return
    const reconcile = () => { void apiClient.get<CartItem[]>('/cart').then(({ data }) => setItems(data)).catch(() => setSyncError('Não foi possível reconciliar o carrinho após a reconexão.')) }
    window.addEventListener('kurio:reconcile-cart', reconcile)
    return () => window.removeEventListener('kurio:reconcile-cart', reconcile)
  }, [userId])

  const addItem = (nft: NFT, quantity = 1, edition = nft.edition) => commit((current) => {
    const next = structuredClone(current); const found = next.find((item) => item.nftId === nft.id && item.edition === edition)
    if (found) found.quantity = Math.min(found.quantity + quantity, nft.availableEditions)
    else next.push({ nftId: nft.id, nft, quantity: Math.min(quantity, nft.availableEditions), edition })
    return next
  })
  const removeItem = (nftId: string) => commit((current) => current.filter((item) => item.nftId !== nftId))
  const updateQuantity = (nftId: string, quantity: number) => commit((current) => quantity <= 0 ? current.filter((item) => item.nftId !== nftId) : current.map((item) => item.nftId === nftId ? { ...item, quantity: Math.min(quantity, item.nft.availableEditions) } : item))
  const clearCart = useCallback(() => commit(() => []), [commit])
  const completePurchase = useCallback((purchased: CartItem[]) => commit((current) => current.flatMap((item) => {
    const bought = purchased.find((entry) => entry.nftId === item.nftId && entry.edition === item.edition)
    if (!bought) return [item]
    const remaining = item.quantity - bought.quantity
    return remaining > 0 ? [{ ...item, quantity: remaining }] : []
  })), [commit])
  return <CartContext.Provider value={{ items, itemCount: items.reduce((sum, item) => sum + item.quantity, 0), isSyncing, syncError, addItem, removeItem, updateQuantity, clearCart, completePurchase }}>{children}</CartContext.Provider>
}

export function useCart() { const value = useContext(CartContext); if (!value) throw new Error('useCart deve ser usado dentro de CartProvider'); return value }
