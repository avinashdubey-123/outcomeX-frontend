// src/features/api/orderbook/orderBookApi.ts

import { secondApi } from "../secondApi"

// ── Types matching backend response exactly ───────────────────────────────────
export interface ApiOrderBookEntry {
  id: string
  price: string // e.g. "500000" → divide by 10000 → 50 cents
  remainingShares: string // e.g. "100"
  type: number // 1 = BUY (bid), 2 = SELL (ask)
  createdAt: string
}

export interface GetOrderBookResponse {
  statusCode: number
  status: boolean
  message: string
  type: string
  data: {
    data: ApiOrderBookEntry[]
  }
}

// ── Query params ──────────────────────────────────────────────────────────────
export interface GetOrderBookParams {
  tokenId: string
  type: 1 | 2 // 1 = BUY orders (bids), 2 = SELL orders (asks)
  limit?: number
}

// ── Transformed row — what the UI uses ───────────────────────────────────────
export interface OrderBookRow {
  price: number // in cents e.g. 50
  shares: number // e.g. 100
}

// ── Transform raw API entry to UI row ─────────────────────────────────────────
export const mapApiEntryToRow = (e: ApiOrderBookEntry): OrderBookRow => ({
  price: Number((Number(e.price) / 10000).toPrecision(2)), //500000 → 50 cents
  shares: Math.round(Number(e.remainingShares) / 1000000),
})

// ── RTK Query endpoint ────────────────────────────────────────────────────────
export const orderBookApi = secondApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrderBook: builder.query<GetOrderBookResponse, GetOrderBookParams>({
      query: ({ tokenId, type, limit = 50 }) =>
        `/v1/orders/orderbook?tokenId=${tokenId}&type=${type}&limit=${limit}`,
    }),
  }),
  overrideExisting: false,
})

export const { useGetOrderBookQuery } = orderBookApi
