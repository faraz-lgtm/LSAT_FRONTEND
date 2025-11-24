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
      console.log('[chat-socket] WebSocket connected:', {
        id: this.socket?.id,
        connected: this.socket?.connected,
      })
    })

    this.socket.on('disconnect', (reason) => {
      console.log('[chat-socket] WebSocket disconnected:', {
        reason,
        id: this.socket?.id,
      })
    })

    this.socket.on('connect_error', (error) => {
      console.error('[chat-socket] WebSocket connection error:', {
        message: error.message,
        type: error.type,
        description: error.description,
      })
    })

    // Log all incoming events for debugging
    this.socket.onAny((eventName, ...args) => {
      console.log('[chat-socket] Event received:', {
        event: eventName,
        argsCount: args.length,
        args: args.map((arg, index) => ({
          index,
          type: typeof arg,
          isObject: typeof arg === 'object',
          keys: typeof arg === 'object' && arg !== null ? Object.keys(arg) : undefined,
        })),
      })
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



