import { http, HttpResponse } from 'msw'
import { nftHandlers } from './nfts'
import { marketplaceHandlers } from './marketplace'
import { socketHandler } from '../socket'

export const handlers = [
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
  }),
  ...nftHandlers,
  ...marketplaceHandlers,
  socketHandler,
]
