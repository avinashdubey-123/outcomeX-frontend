import type { Socket } from "socket.io-client"
import { io } from "socket.io-client"

let socket: Socket | null = null

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || "http://192.180.1.190:3008", {
      transports: ["websocket"], // avoid polling
      autoConnect: false, // we control when to connect
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
  }
  return socket
}
