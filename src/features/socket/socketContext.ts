import { createContext, useContext } from "react"
import type { Socket } from "socket.io-client"

export type SocketStatus = "connecting" | "connected" | "disconnected" | "error"

export interface SocketContextValue {
  socket: Socket
  status: SocketStatus
}

export const SocketContext = createContext<SocketContextValue | null>(null)

// Returns null when socket is unavailable — callers must handle the null case
export const useSocket = (): SocketContextValue | null => useContext(SocketContext)
