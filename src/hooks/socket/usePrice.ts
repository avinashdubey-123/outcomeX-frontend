// src/hooks/usePrice.ts

import { useEffect, useState } from "react"

import { useSocket } from "@/features/socket/socketContext"

type PriceData = {
  optionGroupId: string
  price: string
  createdAt: string
}

export const usePrice = (optionGroupId: string) => {
  const socketCtx = useSocket()
  const socket = socketCtx?.socket ?? null

  const [price, setPrice] = useState<PriceData>()

  useEffect(() => {
    if (!optionGroupId || !socket) return

    socket.emit("subscribePrice", { optionGroupId })

    const handlePriceUpdate = (data: PriceData) => {
      if (data.optionGroupId === optionGroupId) {
        setPrice(data)
      }
    }

    socket.on("priceUpdated", handlePriceUpdate)

    return () => {
      socket.off("priceUpdated", handlePriceUpdate)
    }
  }, [optionGroupId, socket])

  return { price }
}
