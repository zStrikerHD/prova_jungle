import { http, HttpResponse, delay } from 'msw'
import { db } from '../db'
import { mockCategories } from '../fixtures/nfts'
import type { NFTQueryParams } from '@/types'

export const nftHandlers = [
  // List NFTs with search, filter, sort, pagination
  http.get('/api/nfts', async ({ request }) => {
    // Artificial latency to exercise shimmer skeletons (item 8 do desafio)
    const scenario = request.headers.get('x-mock-scenario')
    if (scenario === 'network-error') return HttpResponse.error()
    if (scenario === 'server-error') return HttpResponse.json({ message: 'Catálogo temporariamente indisponível.' }, { status: 503 })
    const requestUrl = new URL(request.url)
    const searchTerm = requestUrl.searchParams.get('search') || ''
    const latency = scenario === 'slow' ? 1500 : scenario === 'variable-latency' ? 100 + (searchTerm.length * 137) % 900 : scenario === 'out-of-order' ? Math.max(100, 1000 - searchTerm.length * 150) : 30
    await delay(latency)

    const url = requestUrl
    const minPriceRaw = url.searchParams.get('minPrice')
    const maxPriceRaw = url.searchParams.get('maxPrice')

    const params: NFTQueryParams = {
      search: url.searchParams.get('search') || undefined,
      category: url.searchParams.get('category') || undefined,
      network: url.searchParams.get('network') || undefined,
      minPrice: minPriceRaw !== null ? parseFloat(minPriceRaw) : undefined,
      maxPrice: maxPriceRaw !== null ? parseFloat(maxPriceRaw) : undefined,
      sort: (url.searchParams.get('sort') as NFTQueryParams['sort']) || 'recent',
      page: Number(url.searchParams.get('page')) || 1,
      limit: Number(url.searchParams.get('limit')) || 6,
    }

    const result = db.getNFTs(params)
    if (scenario === 'empty') { result.data = []; result.total = 0; result.totalPages = 1 }
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    const userId = db.userId(token)
    const favorites = userId ? db.getFavorites(userId) : []
    result.data = result.data.map((nft) => ({ ...nft, isFavorite: favorites.includes(nft.id) }))
    return HttpResponse.json(result)
  }),

  // Categories list
  http.get('/api/categories', async () => {
    const allNfts = db.getNFTs({ page: 1, limit: Number.MAX_SAFE_INTEGER }).data
    return HttpResponse.json(mockCategories.map((name) => ({
      name,
      count: name === 'Todos' ? allNfts.length : allNfts.filter((nft) => nft.category === name).length,
    })))
  }),

  // Get NFT by ID
  http.get('/api/nfts/:id', async ({ params, request }) => {
    const scenario = request.headers.get('x-mock-scenario')
    if (scenario === 'network-error') return HttpResponse.error()
    if (scenario === 'server-error') return HttpResponse.json({ message: 'Detalhe temporariamente indisponível.' }, { status: 503 })
    await delay(scenario === 'slow' ? 1500 : 30)
    const id = params.id as string
    const nft = db.getNFTById(id)

    if (!nft) {
      return HttpResponse.json(
        { message: `NFT com id #${id} não encontrado` },
        { status: 404 },
      )
    }

    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    const userId = db.userId(token)
    return HttpResponse.json({ ...nft, isFavorite: userId ? db.getFavorites(userId).includes(nft.id) : false })
  }),

  // Toggle favorite
  http.post('/api/nfts/:id/favorite', async ({ params, request }) => {
    await delay(150)
    if (request.headers.get('x-mock-scenario') === 'favorite-error') return HttpResponse.json({ message: 'Não foi possível atualizar o favorito.' }, { status: 503 })
    const id = params.id as string
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    const userId = db.userId(token)
    if (!userId) return HttpResponse.json({ message: 'Autenticação obrigatória.' }, { status: 401 })
    const nft = db.getNFTById(id)

    if (!nft) {
      return HttpResponse.json(
        { message: 'NFT não encontrado para favoritar' },
        { status: 404 },
      )
    }

    const active = db.toggleUserFavorite(userId, id)
    return HttpResponse.json({ ...nft, isFavorite: active, likesCount: Math.max(0, (nft.likesCount || 0) + (active ? 1 : -1)) })
  }),
]
