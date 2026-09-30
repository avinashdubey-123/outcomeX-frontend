// src/features/orders/orderTypes.ts

export type OrderStatus = "pending" | "filled" | "cancelled" | "partially filled" | "failed"
export type OrderSide = "Buy" | "Sell"

export interface UserOrder {
  id: string // unique order ID from backend
  marketId: string
  marketTitle: string // for display in portfolio
  outcome: "Yes" | "No" | "Up" | "Down"
  side: OrderSide
  orderType: "Market" | "Limit"
  price: number // in cents e.g. 65
  originalShares: number // what you originally ordered
  filledShares: number // how much has been filled so far
  remainingShares: number // originalShares - filledShares
  usdcAmount: number // total USDC committed
  status: OrderStatus
  createdAt: string // ISO string
  expiresAt?: string // ISO string if expiration was set
  token: {
    id: string
    title: string
  }
}
