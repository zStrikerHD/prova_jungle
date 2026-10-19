import { ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'

type BoundSocket = ReturnType<typeof toSocketIo>['client']
const clients = new Set<BoundSocket>()
const socketOrigin = (window.location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + window.location.host
const socketLink = ws.link(socketOrigin)

export const socketHandler = socketLink.addEventListener('connection', (connection) => {
  if (!connection.client.url.pathname.startsWith('/socket.io/')) return

  const socket = toSocketIo(connection).client
  connection.client.send('0' + JSON.stringify({
    sid: 'kurio-mock',
    upgrades: [],
    pingInterval: 25_000,
    pingTimeout: 5_000,
  }))
  connection.client.send('40' + JSON.stringify({ sid: 'kurio-mock' }))
  clients.add(socket)
  connection.client.addEventListener('close', () => clients.delete(socket))
})

export function broadcastMockEvent(event: 'nft.updated' | 'order.updated', payload: unknown) {
  clients.forEach((client) => client.emit(event, payload))
}
