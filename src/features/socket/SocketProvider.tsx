import React, { useEffect, useState } from "react"

import { getSocket } from "../../libs/socket"
import type { SocketStatus } from "./socketContext"
import { SocketContext } from "./socketContext"

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket] = useState(getSocket)
  const [status, setStatus] = useState<SocketStatus>("connecting")

  useEffect(() => {
    socket.connect()

    socket.on("connect", () => {
      setStatus("connected")
    })

    socket.on("disconnect", () => {
      setStatus("disconnected")
    })

    socket.on("connect_error", () => {
      setStatus("error")
    })

    return () => {
      socket.off("connect")
      socket.off("disconnect")
      socket.off("connect_error")
      socket.disconnect()
    }
  }, [socket])

  // Always render children — socket issues must not block the UI
  return <SocketContext.Provider value={{ socket, status }}>{children}</SocketContext.Provider>
}
