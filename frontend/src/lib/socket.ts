// frontend/src/lib/socket.ts
import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private listenersbound = false

  connect(serverUrl: string = import.meta.env.VITE_API_BASE_URL) {
    if (this.socket?.connected) {
      console.log('Socket already connected, returning existing connection')
      return this.socket
    }

    console.log('Creating new socket connection...')
    this.socket = io(serverUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 20000,
    })

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id)
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      // Reset listeners bound flag if disconnected unexpectedly
      if (reason !== 'io client disconnect') {
        this.listenersbound = false
      }
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts')
      this.reconnectAttempts = 0
    })

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket reconnection attempt:', attemptNumber)
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      this.handleReconnect()
    })

    return this.socket
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Reconnection attempt ${this.reconnectAttempts}`)
        this.socket?.connect()
      }, 1000 * this.reconnectAttempts)
    }
  }

  // Backend socket events
  joinRoom(payload: { pollId: string; role: string; clientId: string; displayName: string }) {
    this.socket?.emit('join_room', payload)
  }

  startQuestion(payload: { pollId: string; questionId: string }) {
    this.socket?.emit('start_question', payload)
  }

  submitAnswer(payload: { pollId: string; questionId: string; clientId: string; optionId: string }) {
    this.socket?.emit('submit_answer', payload)
  }

  endQuestion(payload: { pollId: string; questionId: string }) {
    this.socket?.emit('end_question', payload)
  }

  kickStudent(payload: { pollId: string; clientId: string }) {
    this.socket?.emit('kick_student', payload)
  }

  createQuestion(payload: { pollId: string; text: string; options: any[]; timeLimit?: number }, callback?: (response: any) => void) {
    this.socket?.emit('teacher:create_question', payload, callback)
  }

  // Event listeners
  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback)
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback)
  }

  disconnect() {
    console.log('Disconnecting socket...')
    this.socket?.disconnect()
    this.socket = null
    this.listenersbound = false
  }

  get isConnected() {
    return this.socket?.connected || false
  }

  get areListenersBound() {
    return this.listenersbound
  }

  setListenersBound(bound: boolean) {
    this.listenersbound = bound
  }

  get socketId() {
    return this.socket?.id
  }
}

export const socketService = new SocketService()
export default socketService