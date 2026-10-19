import type { CartItem, NFT, NFTQueryParams, Order, PaginatedResponse, Quote, UserProfile, Wallet } from '@/types'
import { mockNFTs } from '../fixtures/nfts'
import { ethToWei, weiToEth } from '@/lib/money'

interface MockUser extends UserProfile {
  passwordHash: string
}

interface Session { token: string; userId: string; expiresAt: number }
interface StoredState {
  nfts: NFT[]
  users: MockUser[]
  sessions: Session[]
  carts: Record<string, CartItem[]>
  favorites: Record<string, string[]>
  wallets: Record<string, Wallet[]>
  orders: Record<string, Order[]>
  idempotency: Record<string, { fingerprint: string; order: Order }>
  scenarioHits: Record<string, boolean>
}

const STORAGE_KEY = 'kurio_mock_api_v3'
const hashPassword = (value: string) => {
  let hash = 2166136261
  for (const char of value) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
  return `fnv1a:${(hash >>> 0).toString(16)}`
}

const defaultProfile = (id: string, username: string, email: string): MockUser => ({
  id, username, email, displayName: username === 'alpha_collector' ? 'Colecionador Alpha' : 'Colecionador Beta',
  ensName: username.replace(/_collector$/, ''), ensDomain: '.eth', walletNickname: 'Carteira Principal',
  avatarUrl: '/assets/nfts/ape-headphones.jpg', passwordHash: hashPassword('Kurio123!'),
})

class MockDatabase {
  private nfts: NFT[] = []
  private state!: StoredState

  constructor() {
    this.nfts = JSON.parse(JSON.stringify(mockNFTs))
    if (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) this.hydrate()
    else this.reset()
  }

  reset() {
    this.nfts = JSON.parse(JSON.stringify(mockNFTs))
    const alpha = defaultProfile('user_alpha', 'alpha_collector', 'alpha@kurio.test')
    const beta = defaultProfile('user_beta', 'beta_collector', 'beta@kurio.test')
    this.state = {
      nfts: structuredClone(mockNFTs), users: [alpha, beta], sessions: [], carts: {}, favorites: {}, orders: {}, idempotency: {}, scenarioHits: {},
      wallets: {
        user_alpha: [{ id: 'wallet_alpha', nickname: 'MetaMask principal', address: '0xA91F00000000000000000000000000000000E82C', network: 'ethereum', type: 'metamask', isPrimary: true }],
        user_beta: [],
      },
    }
    this.nfts = this.state.nfts
    this.persist()
  }

  hydrate() {
    if (typeof localStorage === 'undefined') return
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      this.state = JSON.parse(raw) as StoredState
      this.state.nfts ||= structuredClone(mockNFTs)
      this.state.scenarioHits ||= {}
      this.nfts = this.state.nfts
    } catch { localStorage.removeItem(STORAGE_KEY) }
  }

  private persist() {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state))
  }

  private publicUser(user: MockUser): UserProfile {
    return { id: user.id, username: user.username, displayName: user.displayName, email: user.email, ensName: user.ensName, ensDomain: user.ensDomain, walletNickname: user.walletNickname, avatarUrl: user.avatarUrl }
  }

  register(username: string, email: string, password: string) {
    this.hydrate()
    if (this.state.users.some((user) => user.email.toLowerCase() === email.toLowerCase())) return null
    const user: MockUser = { ...defaultProfile(`user_${crypto.randomUUID()}`, username, email), passwordHash: hashPassword(password) }
    this.state.users.push(user); this.persist()
    return this.createSession(user)
  }

  login(email: string, password: string) {
    this.hydrate()
    const user = this.state.users.find((item) => item.email.toLowerCase() === email.toLowerCase())
    if (!user || user.passwordHash !== hashPassword(password)) return null
    return this.createSession(user)
  }

  socialLogin(email: string) {
    this.hydrate()
    let user = this.state.users.find((item) => item.email === email)
    if (!user) { user = { ...defaultProfile(`user_${crypto.randomUUID()}`, email.split('@')[0], email), passwordHash: hashPassword(crypto.randomUUID()) }; this.state.users.push(user) }
    return this.createSession(user)
  }

  private createSession(user: MockUser) {
    const session = { token: crypto.randomUUID(), userId: user.id, expiresAt: Date.now() + 60 * 60 * 1000 }
    this.state.sessions = this.state.sessions.filter((item) => item.userId !== user.id)
    this.state.sessions.push(session); this.persist()
    return { token: session.token, user: this.publicUser(user), expiresAt: new Date(session.expiresAt).toISOString() }
  }

  getSession(token?: string) {
    this.hydrate()
    const session = this.state.sessions.find((item) => item.token === token)
    if (!session || session.expiresAt <= Date.now()) return null
    const user = this.state.users.find((item) => item.id === session.userId)
    return user ? { user: this.publicUser(user), expiresAt: new Date(session.expiresAt).toISOString() } : null
  }

  logout(token?: string) { this.hydrate(); this.state.sessions = this.state.sessions.filter((item) => item.token !== token); this.persist() }
  userId(token?: string) { return this.getSession(token)?.user.id }

  updateProfile(userId: string, updates: Partial<UserProfile>) {
    this.hydrate(); const user = this.state.users.find((item) => item.id === userId); if (!user) return null
    Object.assign(user, updates, { id: user.id, email: updates.email?.trim() || user.email }); this.persist(); return this.publicUser(user)
  }

  changePassword(userId: string, currentPassword: string, nextPassword: string) {
    this.hydrate(); const user = this.state.users.find((item) => item.id === userId)
    if (!user || user.passwordHash !== hashPassword(currentPassword)) return false
    user.passwordHash = hashPassword(nextPassword); this.persist(); return true
  }

  getCart(userId: string) { this.hydrate(); return this.state.carts[userId] || [] }
  setCart(userId: string, items: CartItem[]) { this.hydrate(); this.state.carts[userId] = items; this.persist(); return items }
  getFavorites(userId: string) { this.hydrate(); return this.state.favorites[userId] || [] }
  toggleUserFavorite(userId: string, nftId: string) {
    this.hydrate(); const list = this.state.favorites[userId] || []; const active = list.includes(nftId)
    this.state.favorites[userId] = active ? list.filter((id) => id !== nftId) : [...list, nftId]; this.persist(); return !active
  }
  getWallets(userId: string) { this.hydrate(); return this.state.wallets[userId] || [] }
  consumeScenario(key: string) { this.hydrate(); if (this.state.scenarioHits[key]) return false; this.state.scenarioHits[key] = true; this.persist(); return true }
  saveWallet(userId: string, wallet: Omit<Wallet, 'id'> & { id?: string }) {
    this.hydrate(); const list = this.state.wallets[userId] || []; const saved = { ...wallet, id: wallet.id || `wallet_${crypto.randomUUID()}` }
    this.state.wallets[userId] = wallet.isPrimary ? list.map((item) => ({ ...item, isPrimary: false })) : list
    const index = this.state.wallets[userId].findIndex((item) => item.id === saved.id)
    if (index >= 0) this.state.wallets[userId][index] = saved; else this.state.wallets[userId].push(saved)
    this.persist(); return saved
  }

  quote(userId: string, coupon?: string, network = 'ethereum', walletId = '', providedItems?: CartItem[]): Quote {
    const items = providedItems ? structuredClone(providedItems) : this.getCart(userId)
    const subtotal = items.reduce((total, item) => total + ethToWei(item.nft.priceEth) * BigInt(item.quantity), 0n)
    const validCoupon = coupon?.toUpperCase() === '12345'; const discount = validCoupon ? subtotal * 15n / 100n : 0n; const fee = items.length ? ethToWei(network === 'polygon' ? '0.003' : '0.016') : 0n
    return { id: crypto.randomUUID(), items: structuredClone(items), subtotalEth: weiToEth(subtotal), discountEth: weiToEth(discount), networkFeeEth: weiToEth(fee), totalEth: weiToEth(subtotal - discount + fee), coupon: validCoupon ? '12345' : undefined, walletId, network, expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), version: 1 }
  }

  createOrder(userId: string, quote: Quote, key: string, wallet: Wallet) {
    this.hydrate(); const fingerprint = JSON.stringify({ userId, quoteId: quote.id, total: quote.totalEth, walletId: wallet.id, items: quote.items.map((i) => [i.nftId, i.quantity, i.edition]) })
    const prior = this.state.idempotency[key]; if (prior) return prior.fingerprint === fingerprint ? { order: prior.order } : { conflict: true as const }
    const order: Order = { id: `KUR-${Date.now()}`, items: structuredClone(quote.items), subtotalEth: quote.subtotalEth, discountEth: quote.discountEth, networkFeeEth: quote.networkFeeEth, totalEth: quote.totalEth, status: 'pending', transactionHash: undefined, walletId: wallet.id, walletAddress: wallet.address, network: wallet.network, quoteId: quote.id, version: 1, createdAt: new Date().toISOString() }
    this.state.orders[userId] = [...(this.state.orders[userId] || []), order]; this.state.idempotency[key] = { fingerprint, order }; this.persist(); return { order }
  }
  getOrder(userId: string, id: string) {
    this.hydrate(); const order = (this.state.orders[userId] || []).find((item) => item.id === id)
    if (order?.status === 'pending' && Date.now() - new Date(order.createdAt).getTime() >= 900) return this.updateOrderStatus(userId, id, 'confirmed')
    return order
  }
  getOrderByIdempotency(userId: string, key: string) {
    this.hydrate(); const record = this.state.idempotency[key]
    if (!record) return undefined
    try { if (JSON.parse(record.fingerprint).userId !== userId) return undefined } catch { return undefined }
    return this.getOrder(userId, record.order.id)
  }
  updateOrderStatus(userId: string, id: string, status: Order['status']) {
    this.hydrate(); const order = (this.state.orders[userId] || []).find((item) => item.id === id); if (!order || order.status !== 'pending') return order
    order.status = status; order.version += 1
    if (status === 'confirmed') {
      order.transactionHash = `0x${crypto.randomUUID().replace(/-/g, '')}`
      this.state.carts[userId] = (this.state.carts[userId] || []).flatMap((item) => {
        const bought = order.items.find((entry) => entry.nftId === item.nftId && entry.edition === item.edition)
        if (!bought) return [item]
        const remaining = item.quantity - bought.quantity
        return remaining > 0 ? [{ ...item, quantity: remaining }] : []
      })
    }
    this.persist(); return order
  }

  getNFTs(params: NFTQueryParams = {}): PaginatedResponse<NFT> {
    const {
      search = '',
      category,
      network,
      minPrice,
      maxPrice,
      sort = 'recent',
      page = 1,
      limit = 6,
    } = params

    let filtered = [...this.nfts]

    // Category filter
    if (category && category !== 'Todos') {
      filtered = filtered.filter(
        (nft) => nft.category.toLowerCase() === category.toLowerCase(),
      )
    }

    // Network filter
    if (network && network !== 'Todos') {
      filtered = filtered.filter((nft) =>
        nft.network.toLowerCase().includes(network.toLowerCase()),
      )
    }

    // Min Price filter
    if (typeof minPrice === 'number' && !isNaN(minPrice)) {
      filtered = filtered.filter((nft) => parseFloat(nft.priceEth) >= minPrice)
    }

    // Max Price filter
    if (typeof maxPrice === 'number' && !isNaN(maxPrice)) {
      filtered = filtered.filter((nft) => parseFloat(nft.priceEth) <= maxPrice)
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      filtered = filtered.filter(
        (nft) =>
          nft.title.toLowerCase().includes(q) ||
          nft.author.toLowerCase().includes(q) ||
          nft.description?.toLowerCase().includes(q),
      )
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sort) {
        case 'price_asc':
          return parseFloat(a.priceEth) - parseFloat(b.priceEth)
        case 'price_desc':
          return parseFloat(b.priceEth) - parseFloat(a.priceEth)
        case 'popular':
          return (b.likesCount || 0) - (a.likesCount || 0)
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const startIndex = (page - 1) * limit
    const paginated = filtered.slice(startIndex, startIndex + limit)

    return {
      data: paginated,
      total,
      page,
      limit,
      totalPages,
    }
  }

  getNFTById(id: string): NFT | undefined {
    return this.nfts.find((nft) => nft.id === id)
  }

  toggleFavorite(id: string): NFT | undefined {
    const nft = this.nfts.find((item) => item.id === id)
    if (nft) {
      nft.isFavorite = !nft.isFavorite
      nft.likesCount = (nft.likesCount || 0) + (nft.isFavorite ? 1 : -1)
    }
    return nft
  }

  updateNFT(id: string, updates: Partial<NFT>): NFT | undefined {
    const nft = this.nfts.find((item) => item.id === id)
    if (nft) {
      Object.assign(nft, updates)
      this.state.nfts = this.nfts
      for (const [userId, cart] of Object.entries(this.state.carts)) {
        this.state.carts[userId] = cart.map((item) => item.nftId === id ? { ...item, nft: { ...item.nft, ...updates } } : item)
      }
      this.persist()
    }
    return nft
  }
}

export const db = new MockDatabase()
