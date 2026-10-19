export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

export interface UserProfile {
  id: string
  username: string
  displayName: string
  email: string
  ensName: string
  ensDomain: string
  walletNickname: string
  avatarUrl: string
}

export interface NFT {
  id: string
  title: string
  description?: string
  imageUrl: string
  priceEth: string
  author: string
  authorAvatar: string
  edition: string
  totalEditions: number
  availableEditions: number
  category: string
  network: string
  isFavorite?: boolean
  likesCount?: number
  createdAt: string
}

export interface NFTQueryParams {
  search?: string
  category?: string
  network?: string
  minPrice?: number
  maxPrice?: number
  sort?: 'price_asc' | 'price_desc' | 'recent' | 'popular'
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CartItem {
  nftId: string
  nft: NFT
  quantity: number
  edition: string
}

export interface Wallet {
  id: string
  nickname: string
  address: string
  network: string
  type: string
  isPrimary: boolean
}

export interface Quote {
  id: string
  items: CartItem[]
  subtotalEth: string
  discountEth: string
  networkFeeEth: string
  totalEth: string
  coupon?: string
  walletId: string
  network: string
  expiresAt: string
  version: number
}

export type OrderStatus = 'pending' | 'confirmed' | 'declined'

export interface Order {
  id: string
  items: CartItem[]
  subtotalEth: string
  discountEth: string
  networkFeeEth: string
  totalEth: string
  status: OrderStatus
  transactionHash?: string
  walletId: string
  walletAddress: string
  network: string
  quoteId: string
  version: number
  createdAt: string
}
