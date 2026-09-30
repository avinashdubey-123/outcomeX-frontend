// src/hooks/socket/useOrderBook.ts

import { useEffect, useMemo, useState } from "react"

import { useGetOrderBookQuery } from "@/features/api/orderBook/orderBookApi"
import { useSocket } from "@/features/socket/socketContext"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BookEntry {
  id: string
  price: number // cents  (raw / 10000)
  shares: number // units  (raw / 1000000)
}

type TokenBook = { bids: BookEntry[]; asks: BookEntry[] }

interface SocketOrderPayload {
  optionGroupId: string
  order: {
    id: string
    marketTokenId: string
    type: number // 1 = BUY (bid) | 2 = SELL (ask)
    price: string // e.g. "500000"
    remainingShares: string
    status: number // 1 = pending | 2 = partially filled | 3 = fully filled
    createdAt: string
  }
}

type PatchOp =
  | { type: "add"; tokenId: string; side: "bids" | "asks"; entry: BookEntry }
  | { type: "update"; tokenId: string; side: "bids" | "asks"; id: string; shares: number }
  | { type: "remove"; tokenId: string; side: "bids" | "asks"; id: string }

// ── Helpers ───────────────────────────────────────────────────────────────────

const ORDER_TYPE = { BUY: 1, SELL: 2 } as const

const fromRaw = (e: { id: string; price: string; remainingShares: string }): BookEntry => ({
  id: e.id,
  price: Number((Number(e.price) / 10000).toFixed(2)),
  shares: Math.round(Number(e.remainingShares) / 1000000),
})

const EMPTY_BOOK: TokenBook = { bids: [], asks: [] }

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useOrderBook = (
  optionGroupId: string,
  yesTokenId: string,
  noTokenId: string,
  activeTokenId: string,
) => {
  const socketCtx = useSocket()
  const socket = socketCtx?.socket ?? null

  // ── Fetch all four sides in parallel ───────────────────────────────────────
  const { data: yesBidsData, isLoading: yesBidsLoading } = useGetOrderBookQuery(
    { tokenId: yesTokenId, type: ORDER_TYPE.BUY, limit: 10 },
    { skip: !yesTokenId, refetchOnMountOrArgChange: true },
  )
  const { data: yesAsksData, isLoading: yesAsksLoading } = useGetOrderBookQuery(
    { tokenId: yesTokenId, type: ORDER_TYPE.SELL, limit: 10 },
    { skip: !yesTokenId, refetchOnMountOrArgChange: true },
  )
  const { data: noBidsData, isLoading: noBidsLoading } = useGetOrderBookQuery(
    { tokenId: noTokenId, type: ORDER_TYPE.BUY, limit: 10 },
    { skip: !noTokenId, refetchOnMountOrArgChange: true },
  )
  const { data: noAsksData, isLoading: noAsksLoading } = useGetOrderBookQuery(
    { tokenId: noTokenId, type: ORDER_TYPE.SELL, limit: 10 },
    { skip: !noTokenId, refetchOnMountOrArgChange: true },
  )

  // ── Socket patches stored as ordered delta ops ─────────────────────────────
  // State is only updated inside socket callbacks (async), satisfying
  // react-hooks/set-state-in-effect which forbids synchronous setState in effects.
  const [patches, setPatches] = useState<PatchOp[]>([])

  // ── REST base books (derived at render time — no effect needed) ────────────
  const restBooks = useMemo<Record<string, TokenBook>>(() => {
    const result: Record<string, TokenBook> = {}
    if (yesTokenId) {
      result[yesTokenId] = {
        bids: yesBidsData?.data.data.map(fromRaw) ?? [],
        asks: yesAsksData?.data.data.map(fromRaw) ?? [],
      }
    }
    if (noTokenId) {
      result[noTokenId] = {
        bids: noBidsData?.data.data.map(fromRaw) ?? [],
        asks: noAsksData?.data.data.map(fromRaw) ?? [],
      }
    }
    return result
  }, [yesBidsData, yesAsksData, noBidsData, noAsksData, yesTokenId, noTokenId])

  // ── Final books: REST baseline with socket patches applied on top ──────────
  const books = useMemo<Record<string, TokenBook>>(() => {
    // Deep-clone the REST base so we can mutate safely
    const result: Record<string, TokenBook> = {}
    for (const [tokenId, book] of Object.entries(restBooks)) {
      result[tokenId] = { bids: [...book.bids], asks: [...book.asks] }
    }

    for (const patch of patches) {
      const book = result[patch.tokenId]
      if (!book) continue

      if (patch.type === "add") {
        const side = book[patch.side]
        book[patch.side] = [patch.entry, ...side.filter((o) => o.id !== patch.entry.id)].slice(
          0,
          50,
        )
      } else if (patch.type === "update") {
        book[patch.side] = book[patch.side].map((o) =>
          o.id === patch.id ? { ...o, shares: patch.shares } : o,
        )
      } else if (patch.type === "remove") {
        book[patch.side] = book[patch.side].filter((o) => o.id !== patch.id)
      }
    }

    return result
  }, [restBooks, patches])

  // ── Socket subscription (one sub for the whole optionGroup) ───────────────
  useEffect(() => {
    if (!optionGroupId || !socket) return

    socket.emit("subscribeOrderbook", { optionGroupId })

    // New order placed — add to correct side
    const handleOrderPending = ({ order }: SocketOrderPayload) => {
      const side = order.type === ORDER_TYPE.BUY ? "bids" : "asks"
      setPatches((prev) => [
        ...prev,
        { type: "add", tokenId: order.marketTokenId, side, entry: fromRaw(order) },
      ])
    }

    // Order partially filled — update remaining shares
    const handleOrderPartiallyFilled = ({ order }: SocketOrderPayload) => {
      const side = order.type === ORDER_TYPE.BUY ? "bids" : "asks"
      setPatches((prev) => [
        ...prev,
        {
          type: "update",
          tokenId: order.marketTokenId,
          side,
          id: order.id,
          shares: Math.round(Number(order.remainingShares) / 1000000),
        },
      ])
    }

    // Order fully filled — remove from book
    const handleOrderFilled = ({ order }: SocketOrderPayload) => {
      const side = order.type === ORDER_TYPE.BUY ? "bids" : "asks"
      setPatches((prev) => [
        ...prev,
        { type: "remove", tokenId: order.marketTokenId, side, id: order.id },
      ])
    }

    socket.on("orderPending", handleOrderPending)
    socket.on("orderPartiallyFilled", handleOrderPartiallyFilled)
    socket.on("orderFilled", handleOrderFilled)

    return () => {
      socket.emit("unsubscribeOrderbook", { optionGroupId })
      socket.off("orderPending", handleOrderPending)
      socket.off("orderPartiallyFilled", handleOrderPartiallyFilled)
      socket.off("orderFilled", handleOrderFilled)
    }
  }, [optionGroupId, socket])

  // ── Derived output ──────────────────────────────────────────────────────────
  const isActiveYes = activeTokenId === yesTokenId

  const isRTKLoading = isActiveYes
    ? yesBidsLoading || yesAsksLoading
    : noBidsLoading || noAsksLoading

  const activeBook = books[activeTokenId] ?? EMPTY_BOOK

  return {
    bids: [...activeBook.bids].sort((a, b) => b.price - a.price), // highest bid first
    asks: [...activeBook.asks].sort((a, b) => a.price - b.price), // lowest ask first
    isLoading: isRTKLoading,
  }
}
