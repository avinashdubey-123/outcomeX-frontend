// src/features/orders/ordersSlice.ts
// Pure Redux slice — no API calls yet
// RTK Query endpoints will be added later when backend is ready

import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { UserOrder } from "./orderTypes"

interface OrdersState {
  list: UserOrder[]
  loading: boolean
  error: string | null
}

const initialState: OrdersState = {
  list: [], // ← seeded with mock data for now
  loading: false,
  error: null,
}

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    // replace entire list — will be called by API fetch later
    setOrders: (state, action: PayloadAction<UserOrder[]>) => {
      state.list = action.payload
    },

    // add a new order — called from useTrade after signing
    addOrder: (state, action: PayloadAction<UserOrder>) => {
      state.list.unshift(action.payload) // newest first
    },

    // cancel a pending order — optimistic delete
    removeOrder: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((o) => o.id !== action.payload)
    },

    // edit price or shares of a pending order — optimistic update
    updateOrder: (state, action: PayloadAction<Partial<UserOrder> & { id: string }>) => {
      const idx = state.list.findIndex((o) => o.id === action.payload.id)
      if (idx !== -1 && state.list[idx]) {
        state.list[idx] = { ...state.list[idx], ...action.payload }
      }
    },

    // called by backend response when a buy/sell pair is matched (fully or partially)
    // sharesFilledAmount = number of shares matched in this event
    fillOrder: (state, action: PayloadAction<{ orderId: string; sharesFilledAmount: number }>) => {
      const { orderId, sharesFilledAmount } = action.payload
      const idx = state.list.findIndex((o) => o.id === orderId)
      if (idx === -1 || !state.list[idx]) return
      const order = state.list[idx]
      const newFilled = Math.min(order.filledShares + sharesFilledAmount, order.originalShares)
      const newRemaining = order.originalShares - newFilled
      order.filledShares = newFilled
      order.remainingShares = newRemaining
      order.status = newRemaining === 0 ? "filled" : "partially filled"
    },

    // mark an order as cancelled (softer than removeOrder — keeps it in list)
    cancelOrder: (state, action: PayloadAction<string>) => {
      const idx = state.list.findIndex((o) => o.id === action.payload)
      if (idx !== -1 && state.list[idx]) {
        state.list[idx].status = "cancelled"
      }
    },

    setOrdersLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },

    setOrdersError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setOrders,
  addOrder,
  removeOrder,
  updateOrder,
  cancelOrder,
  fillOrder,
  setOrdersLoading,
  setOrdersError,
} = ordersSlice.actions

// ── Selectors ─────────────────────────────────────────────────────────────────

import type { RootState } from "@/app/store"

export const selectAllOrders = (s: RootState) => s.orders.list
export const selectPendingOrders = (s: RootState) =>
  s.orders.list.filter((o) => o.status === "pending" || o.status === "partially filled")
export const selectOpenOrders = selectPendingOrders // alias for clarity
export const selectFilledOrders = (s: RootState) =>
  s.orders.list.filter((o) => o.status === "filled")
export const selectCancelledOrders = (s: RootState) =>
  s.orders.list.filter((o) => o.status === "cancelled")
export const selectResolvedOrders = (s: RootState) =>
  s.orders.list.filter((o) => o.status === "filled" || o.status === "cancelled")
export const selectOrdersLoading = (s: RootState) => s.orders.loading

export default ordersSlice.reducer
