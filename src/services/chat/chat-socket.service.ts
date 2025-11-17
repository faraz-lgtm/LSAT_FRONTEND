import { io, Socket } from 'socket.io-client'

class ChatSocketService {
  private socket: Socket | null = null
  private apiBaseUrl: string

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl
  }

  connect(token: string): Socket {
    if (this.socket?.connected) {
      return this.socket
    }

    // Only send JWT token - organizationId is automatically extracted from token by backend
    // Do NOT send X-Organization-Id or X-Organization-Slug headers
    this.socket = io(`${this.apiBaseUrl}/chat`, {
      auth: {
        token: token, // JWT access token contains organizationId
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    this.socket.on('connect', () => {
      console.log('Chat WebSocket connected')
    })

    this.socket.on('disconnect', () => {
      console.log('Chat WebSocket disconnected')
    })

    this.socket.on('connect_error', (error) => {
      console.error('Chat WebSocket connection error:', error)
    })

    return this.socket
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }
}

// Export singleton instance
const BASE_URL = import.meta.env.VITE_SERVER_URL || (import.meta.env.DEV ? 'http://localhost:3000' : 'https://api.betterlsat.com')

export const chatSocketService = new ChatSocketService(BASE_URL)



