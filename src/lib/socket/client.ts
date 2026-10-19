import type { Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin

let socket: Socket | null = null
let socketPromise: Promise<Socket> | null = null

export function getSocket(): Promise<Socket> {
  if (socket) return Promise.resolve(socket)
  if (!socketPromise) {
    socketPromise = import('socket.io-client').then(({ io }) => {
      socket = io(SOCKET_URL, {
        autoConnect: false,
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })
      return socket
    })
  }
  return socketPromise
}

export function disconnectSocket() {
  socket?.disconnect()
}
