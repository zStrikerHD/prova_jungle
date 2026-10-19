import { delay, http, HttpResponse } from 'msw'
import { db } from '../db'
import type { CartItem, Quote, UserProfile, Wallet } from '@/types'
import { broadcastMockEvent } from '../socket'
import { sumEth } from '@/lib/money'

const tokenFrom = (request: Request) => request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
const requireUser = (request: Request) => request.headers.get('x-mock-scenario') === 'session-expired' ? undefined : db.userId(tokenFrom(request))
const unauthorized = () => HttpResponse.json({ message: 'Sessão inválida ou expirada.' }, { status: 401 })
const validateCart = (items: CartItem[]) => items.every((item) => Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= item.nft.availableEditions)
const scenario = (request: Request) => request.headers.get('x-mock-scenario') || 'default'

export const marketplaceHandlers = [
  http.post('/api/auth/register', async ({ request }) => {
    await delay(180)
    const body = await request.json() as { username?: string; email?: string; password?: string }
    if (scenario(request) === 'server-error') return HttpResponse.json({ message: 'Serviço temporariamente indisponível.' }, { status: 503 })
    if (!body.username?.trim() || !body.email?.includes('@') || !body.password || body.password.length < 8) {
      return HttpResponse.json({ message: 'Informe usuário, e-mail válido e senha com pelo menos 8 caracteres.' }, { status: 422 })
    }
    const result = db.register(body.username.trim(), body.email.trim(), body.password)
    return result ? HttpResponse.json(result, { status: 201 }) : HttpResponse.json({ message: 'Este e-mail já está cadastrado.' }, { status: 409 })
  }),
  http.post('/api/auth/login', async ({ request }) => {
    await delay(150)
    const body = await request.json() as { email?: string; password?: string; provider?: string }
    const result = body.provider && body.email ? db.socialLogin(body.email) : db.login(body.email || '', body.password || '')
    return result ? HttpResponse.json(result) : HttpResponse.json({ message: 'E-mail ou senha inválidos.' }, { status: 401 })
  }),
  http.get('/api/auth/session', ({ request }) => {
    if (scenario(request) === 'session-expired') return unauthorized()
    const session = db.getSession(tokenFrom(request))
    return session ? HttpResponse.json(session) : unauthorized()
  }),
  http.post('/api/auth/logout', ({ request }) => { db.logout(tokenFrom(request)); return new HttpResponse(null, { status: 204 }) }),

  http.get('/api/cart', ({ request }) => { const id = requireUser(request); return id ? HttpResponse.json(db.getCart(id)) : unauthorized() }),
  http.put('/api/cart', async ({ request }) => {
    const id = requireUser(request); if (!id) return unauthorized()
    const body = await request.json() as { items?: CartItem[] }
    if (!Array.isArray(body.items) || !validateCart(body.items)) return HttpResponse.json({ message: 'Quantidade indisponível.' }, { status: 409 })
    return HttpResponse.json(db.setCart(id, body.items))
  }),
  http.get('/api/favorites', ({ request }) => { const id = requireUser(request); return id ? HttpResponse.json(db.getFavorites(id)) : unauthorized() }),
  http.post('/api/favorites/:nftId', ({ request, params }) => { const id = requireUser(request); return id ? HttpResponse.json({ active: db.toggleUserFavorite(id, String(params.nftId)) }) : unauthorized() }),

  http.get('/api/profile', ({ request }) => { const session = db.getSession(tokenFrom(request)); return session ? HttpResponse.json(session.user) : unauthorized() }),
  http.patch('/api/profile', async ({ request }) => {
    const id = requireUser(request); if (!id) return unauthorized()
    const body = await request.json() as Partial<UserProfile>
    if (!body.displayName?.trim() || !body.username?.trim() || !body.email?.includes('@')) return HttpResponse.json({ message: 'Revise nome, usuário e e-mail.' }, { status: 422 })
    const profile = db.updateProfile(id, body)
    return profile ? HttpResponse.json(profile) : HttpResponse.json({ message: 'Perfil não encontrado.' }, { status: 404 })
  }),
  http.post('/api/profile/password', async ({ request }) => {
    const id = requireUser(request); if (!id) return unauthorized()
    const body = await request.json() as { currentPassword?: string; newPassword?: string }
    if (!body.newPassword || body.newPassword.length < 8) return HttpResponse.json({ message: 'A nova senha deve ter pelo menos 8 caracteres.' }, { status: 422 })
    return db.changePassword(id, body.currentPassword || '', body.newPassword) ? new HttpResponse(null, { status: 204 }) : HttpResponse.json({ message: 'Senha atual incorreta.' }, { status: 422 })
  }),

  http.get('/api/wallets', ({ request }) => { const id = requireUser(request); return id ? HttpResponse.json(db.getWallets(id)) : unauthorized() }),
  http.post('/api/wallets', async ({ request }) => {
    const id = requireUser(request); if (!id) return unauthorized()
    const body = await request.json() as Omit<Wallet, 'id'>
    if (!body.nickname?.trim() || !body.network || !body.type) return HttpResponse.json({ message: 'Revise apelido, rede e tipo da carteira.' }, { status: 422 })
    if (!/^0x[a-fA-F0-9]{40}$/.test(body.address || '')) return HttpResponse.json({ message: 'Endereço de carteira inválido.' }, { status: 422 })
    return HttpResponse.json(db.saveWallet(id, body), { status: 201 })
  }),
  http.put('/api/wallets/:walletId', async ({ request, params }) => {
    const id = requireUser(request); if (!id) return unauthorized()
    const body = await request.json() as Omit<Wallet, 'id'>
    if (!body.nickname?.trim() || !body.network || !body.type || !/^0x[a-fA-F0-9]{40}$/.test(body.address || '')) return HttpResponse.json({ message: 'Revise os dados da carteira.' }, { status: 422 })
    return HttpResponse.json(db.saveWallet(id, { ...body, id: String(params.walletId) }))
  }),

  http.post('/api/quotes', async ({ request }) => {
    const id = requireUser(request)
    const body = await request.json() as { coupon?: string; walletId?: string; network?: string; items?: CartItem[] }
    if (!id && (!Array.isArray(body.items) || !validateCart(body.items))) return unauthorized()
    const wallet = id ? db.getWallets(id).find((item) => item.id === body.walletId && item.network === body.network) || (!body.walletId ? db.getWallets(id).find((item) => item.isPrimary) : undefined) : { id: '', nickname: 'Visitante', address: '', network: 'ethereum', type: 'mock', isPrimary: true }
    if (!wallet) return HttpResponse.json({ message: 'Selecione uma carteira cadastrada e uma rede válida.' }, { status: 422 })
    if (scenario(request) === 'server-error') return HttpResponse.json({ message: 'Falha transitória ao calcular a cotação.' }, { status: 503 })
    if (body.coupon?.toUpperCase() === 'EXPIRED') return HttpResponse.json({ message: 'Cupom expirado.' }, { status: 422 })
    if (body.coupon && body.coupon.toUpperCase() !== '12345') return HttpResponse.json({ message: 'Cupom inválido ou expirado.' }, { status: 422 })
    const quote = db.quote(id || 'guest', body.coupon, wallet.network, wallet.id, id ? undefined : body.items)
    return quote.items.length ? HttpResponse.json(quote) : HttpResponse.json({ message: 'O carrinho está vazio.' }, { status: 409 })
  }),
  http.post('/api/orders', async ({ request }) => {
    const id = requireUser(request); if (!id) return unauthorized()
    const key = request.headers.get('idempotency-key'); if (!key) return HttpResponse.json({ message: 'Chave de idempotência obrigatória.' }, { status: 400 })
    const body = await request.json() as { quote?: Quote }; if (!body.quote || new Date(body.quote.expiresAt).getTime() <= Date.now()) return HttpResponse.json({ message: 'Cotação expirada. Revise os valores.' }, { status: 409 })
    const orderBody = body as typeof body & { walletId?: string; network?: string }
    const wallet = db.getWallets(id).find((item) => item.id === orderBody.walletId && item.network === orderBody.network)
    if (!wallet) return HttpResponse.json({ message: 'Carteira ou rede inválida.' }, { status: 422 })
    const selectedScenario = scenario(request)
    if (selectedScenario === 'wallet-disconnected') return HttpResponse.json({ message: 'A carteira foi desconectada.' }, { status: 409 })
    if (selectedScenario === 'wallet-declined') return HttpResponse.json({ message: 'Conexão recusada pela carteira.' }, { status: 422 })
    if (selectedScenario === 'price-changed' && body.quote.items[0] && db.consumeScenario(`${id}:price-changed`)) {
      const nft = db.updateNFT(body.quote.items[0].nftId, { priceEth: sumEth([body.quote.items[0].nft.priceEth, '0.1']) })
      if (nft) broadcastMockEvent('nft.updated', { resourceId: nft.id, version: Date.now(), nft })
    }
    if (selectedScenario === 'sold-out' && body.quote.items[0] && db.consumeScenario(`${id}:sold-out`)) {
      const nft = db.updateNFT(body.quote.items[0].nftId, { availableEditions: 0 })
      if (nft) broadcastMockEvent('nft.updated', { resourceId: nft.id, version: Date.now(), nft })
    }
    const currentQuote = db.quote(id, body.quote.coupon, wallet.network, wallet.id)
    const snapshot = (quote: Quote) => JSON.stringify(quote.items.map((item) => [item.nftId, item.edition, item.quantity, item.nft.priceEth, item.nft.availableEditions]))
    if (snapshot(currentQuote) !== snapshot(body.quote) || currentQuote.totalEth !== body.quote.totalEth || currentQuote.items.some((item) => item.quantity > item.nft.availableEditions)) return HttpResponse.json({ message: 'Preço ou disponibilidade mudou. Revise a nova cotação.', quote: currentQuote }, { status: 409 })
    const result = db.createOrder(id, body.quote, key, wallet)
    if ('conflict' in result) return HttpResponse.json({ message: 'A chave já foi usada com outro conteúdo.' }, { status: 409 })
    setTimeout(() => {
      const updated = db.updateOrderStatus(id, result.order.id, selectedScenario === 'payment-declined' ? 'declined' : 'confirmed')
      if (updated) broadcastMockEvent('order.updated', { resourceId: updated.id, userId: id, version: updated.version, order: updated })
    }, 900)
    if (selectedScenario === 'order-timeout') return HttpResponse.error()
    return HttpResponse.json(result.order, { status: 201 })
  }),
  http.get('/api/orders/:orderId', ({ request, params }) => {
    const id = requireUser(request); if (!id) return unauthorized(); const order = db.getOrder(id, String(params.orderId))
    return order ? HttpResponse.json(order) : HttpResponse.json({ message: 'Pedido não encontrado.' }, { status: 404 })
  }),
  http.get('/api/order-attempts/:key', ({ request, params }) => {
    const id = requireUser(request); if (!id) return unauthorized(); const order = db.getOrderByIdempotency(id, String(params.key))
    return order ? HttpResponse.json(order) : HttpResponse.json({ message: 'Tentativa não encontrada.' }, { status: 404 })
  }),
  http.post('/api/test/reset', () => { db.reset(); return new HttpResponse(null, { status: 204 }) }),
  http.patch('/api/test/nfts/:nftId', async ({ params, request }) => {
    const body = await request.json() as { priceEth?: string; availableEditions?: number }
    const nft = db.updateNFT(String(params.nftId), body)
    if (!nft) return HttpResponse.json({ message: 'NFT não encontrado.' }, { status: 404 })
    const version = Date.now(); broadcastMockEvent('nft.updated', { resourceId: nft.id, version, nft })
    return HttpResponse.json({ ...nft, version })
  }),
  http.post('/api/test/events/nft.updated', async ({ request }) => {
    const payload = await request.json() as { resourceId: string; version: number; nft: unknown }
    broadcastMockEvent('nft.updated', payload)
    return new HttpResponse(null, { status: 204 })
  }),
]
