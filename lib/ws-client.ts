
import { toast } from 'sonner'

let socket: WebSocket | null = null
let listeners: ((msg: any) => void)[] = []
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAY = 3000 
let reconnectTimeout: NodeJS.Timeout | null = null

export function connectWS(url: string) {
  if (socket) return socket
  
  const wsUrl = url.startsWith('ws://') || url.startsWith('wss://') 
    ? url 
    : `ws://${url}/chat`
  
  try {
    console.log('Connecting to WebSocket:', wsUrl)
    socket = new WebSocket(wsUrl)

    socket.onopen = () => {
      console.log("WebSocket connected successfully")
      toast.success("Connected to chat server")
      reconnectAttempts = 0 
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
        reconnectTimeout = null
      }
      listeners.forEach((cb) => cb({ type: 'connection', status: 'connected' }))
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('Received WebSocket message:', data.type)
        listeners.forEach((cb) => cb(data))
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
        toast.error("Error receiving message")
      }
    }

    socket.onerror = (error) => {
      console.error("WebSocket error:", error)
      toast.error("Connection error occurred")
      
      listeners.forEach((cb) => cb({ type: 'error', message: 'Connection error occurred' }))
    }

    socket.onclose = (event) => {
      console.log(`WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason}`)
      socket = null
      toast.error("Disconnected from chat server")
      
      
      listeners.forEach((cb) => cb({ type: 'connection', status: 'disconnected' }))
      

      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++
        console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`)
        toast.info(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`)
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout)
        }
        reconnectTimeout = setTimeout(() => {
          console.log('Reconnecting...')
          connectWS(url)
        }, RECONNECT_DELAY)
      } else {
        console.error("Max reconnection attempts reached")
        toast.error("Failed to connect to chat server")
        listeners.forEach((cb) => cb({ type: 'error', message: 'Connection failed after max attempts' }))
      }
    }

    return socket
  } catch (error) {
    console.error("Error creating WebSocket connection:", error)
    toast.error("Failed to connect to chat server")
    return null
  }
}

export function sendWSMessage(message: any) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    try {
      console.log('Sending WebSocket message:', message.type)
      socket.send(JSON.stringify(message))
    } catch (error) {
      console.error("Error sending WebSocket message:", error)
      toast.error("Failed to send message")
      if (!reconnectTimeout) {
        connectWS(process.env.NEXT_PUBLIC_WS_URL || "localhost:4000")
      }
    }
  } else {
    console.warn("WebSocket is not connected")
    toast.error("Not connected to chat server")
    if (!reconnectTimeout) {
      connectWS(process.env.NEXT_PUBLIC_WS_URL || "localhost:4000")
    }
  }
}

export function subscribeWS(cb: (msg: any) => void) {
  listeners.push(cb)
  return () => {
    listeners = listeners.filter((l) => l !== cb)
  }
}

export function disconnectWS() {
  if (socket) {
    socket.close()
    socket = null
  }
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
    reconnectTimeout = null
  }
} 