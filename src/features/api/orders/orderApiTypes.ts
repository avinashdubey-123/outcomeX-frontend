// orderApiTypes.ts

import type { UserOrder } from "@/features/orders/orderTypes"

export interface CreateOrderRequest {
  tokenId: string
  price: string
  type: number
  shares: string
  nonce: string
  salt: string
  signature: string
}

export interface CreateOrderResponse {
  statusCode: number
  status: boolean
  message: string
  data: {
    orderId: string
  }
}

// ── Order status constants — matches backend enum ─────────────────────────────
export const ORDER_STATUS_PARAM = {
  PENDING: 1,
  PARTIALLY_FILLED: 2,
  FILLED: 3,
  FAILED: 4,
  CANCELLED: 5,
} as const

export type OrderStatusParam = (typeof ORDER_STATUS_PARAM)[keyof typeof ORDER_STATUS_PARAM]

// ── Order type constants — matches backend enum ───────────────────────────────
export const ORDER_TYPE_PARAM = {
  BUY: 1,
  SELL: 2,
} as const

// ── Types matching exact backend response shape ───────────────────────────────
export interface ApiOrder {
  id: string
  price: string // backend sends as string e.g. "500000"
  shares: string // backend sends as string e.g. "1000"
  remainingShares: string
  outcome: UserOrder["outcome"]
  type: number // 1 = BUY, 2 = SELL
  status: number // 1 = pending, 2 = filled, 3 = cancelled, 4 = partial
  createdAt: string // ISO

  market: {
    id: string
    title: string
  }
  token: {
    id: string
    title: string
  }
}

export interface GetOrdersResponse {
  statusCode: number
  status: boolean
  message: string
  type: string
  data: {
    data: ApiOrder[]
    count: number // total count for pagination
  }
}

// ── Query params ──────────────────────────────────────────────────────────────
export interface GetOrdersParams {
  status?: OrderStatusParam // filter by status
  limit?: number // items per page, default 10
  page?: number // page number (future)
  skip?: number // number of records to skip (offset-based pagination)
}

import type { HistoryItem, PortfolioOrder } from "@/mocks/mockPortfolio"
import { HISTORY_TYPE, ORDER_STATUS, POSITION_SIDE } from "@/pages/portfolio/portfolioConstants"

export const mapApiOrderToPortfolioOrder = (o: ApiOrder): PortfolioOrder => ({
  id: o.id,
  marketId: o.market?.id ?? "",
  marketTitle: o.market?.title ?? "Unknown Market",
  category: "",
  side: (o.token?.title ?? "").toLowerCase() === "yes" ? POSITION_SIDE.YES : POSITION_SIDE.NO,
  direction: o.type === ORDER_TYPE_PARAM.BUY ? "Buy" : "Sell",
  orderType: "Limit",
  price: Math.round(Number(o.price) / 10000), // price in cents
  shares: Math.round(Number(o.shares) / 1000000),
  filled: Number(o.shares) / 1000000 - Number(o.remainingShares) / 1000000,
  status: mapOrderStatus(o.status),
  createdAt: o.createdAt,
  token: o.token,
})

// Cents value from raw API price string (e.g. "500000" → 50)
const rawToCtsCents = (raw: string) => Math.round(Number(raw) / 10000)

export const mapApiOrderToHistoryItem = (o: ApiOrder): HistoryItem => {
  const filledShares = Number(o.shares) - Number(o.remainingShares)
  const priceCents = rawToCtsCents(o.price)
  return {
    id: o.id,
    marketId: o.market?.id ?? "",
    marketTitle: o.market?.title ?? "Unknown Market",
    category: "",
    type: o.type === ORDER_TYPE_PARAM.BUY ? HISTORY_TYPE.BUY : HISTORY_TYPE.SELL,
    side: (o.token?.title ?? "").toLowerCase() === "yes" ? POSITION_SIDE.YES : POSITION_SIDE.NO,
    orderType: "Limit",
    shares: filledShares / 1000000,
    price: priceCents,
    total: ((filledShares / 1000000) * priceCents) / 100,
    settledAt: o.createdAt,
  }
}

const mapOrderStatus = (s: number): PortfolioOrder["status"] =>
  (
    ({
      [ORDER_STATUS_PARAM.PENDING]: ORDER_STATUS.PENDING,
      [ORDER_STATUS_PARAM.FILLED]: ORDER_STATUS.FILLED,
      [ORDER_STATUS_PARAM.CANCELLED]: ORDER_STATUS.CANCELLED,
      [ORDER_STATUS_PARAM.PARTIALLY_FILLED]: ORDER_STATUS.PARTIAL,
    }) as Record<number, PortfolioOrder["status"]>
  )[s] ?? ORDER_STATUS.PENDING
