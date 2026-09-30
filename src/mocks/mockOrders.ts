// src/mocks/mockOrders.ts
// Temporary mock data for testing order management in Portfolio
// Replace with real API data when backend is ready

import type { UserOrder } from "@/features/orders/orderTypes"

export const MOCK_ORDERS: UserOrder[] = [
  // ── Pending limit buy orders ──────────────────────────────────────────────
  {
    id: "order-001",
    marketId: "1",
    marketTitle: "Will the Fed cut rates in 2024?",
    outcome: "Yes",
    side: "Buy",
    orderType: "Limit",
    price: 65,
    originalShares: 100,
    filledShares: 0,
    remainingShares: 100,
    usdcAmount: 65,
    status: "pending",
    createdAt: "2024-10-01T10:30:00.000Z",
    expiresAt: "2024-11-01T10:30:00.000Z",
    token: {
      id: "12dcxddd",
      title: "yes",
    },
  },
  {
    id: "order-002",
    marketId: "2",
    marketTitle: "Will Bitcoin reach $100k by end of 2024?",
    outcome: "No",
    side: "Buy",
    orderType: "Limit",
    price: 42,
    originalShares: 200,
    filledShares: 0,
    remainingShares: 200,
    usdcAmount: 84,
    status: "pending",
    createdAt: "2024-10-03T14:15:00.000Z",
    token: {
      id: "1232eew54d",
      title: "no",
    },
  },
  {
    id: "order-003",
    marketId: "3",
    marketTitle: "Will Elon Musk remain CEO of X in 2024?",
    outcome: "Yes",
    side: "Sell",
    orderType: "Limit",
    price: 78,
    originalShares: 50,
    filledShares: 0,
    remainingShares: 50,
    usdcAmount: 39,
    status: "pending",
    createdAt: "2024-10-05T09:00:00.000Z",
    token: {
      id: "12322aqdd",
      title: "yes",
    },
  },

  // ── Partial fill ──────────────────────────────────────────────────────────
  {
    id: "order-004",
    marketId: "4",
    marketTitle: "Will Apple release AR glasses in 2024?",
    outcome: "Yes",
    side: "Buy",
    orderType: "Limit",
    price: 55,
    originalShares: 300,
    filledShares: 120,
    remainingShares: 180,
    usdcAmount: 165,
    status: "partially filled",
    createdAt: "2024-10-07T16:45:00.000Z",
    expiresAt: "2024-12-01T00:00:00.000Z",
    token: {
      id: "12322wed",
      title: "yes",
    },
  },

  // ── Market Buy — pending (open tab) ───────────────────────────────────────
  // User committed $100 at 65¢ market price → floor(100 / 0.65) = 153 shares
  {
    id: "order-008",
    marketId: "1",
    marketTitle: "Will the Fed cut rates in 2024?",
    outcome: "Yes",
    side: "Buy",
    orderType: "Market",
    price: 65,
    originalShares: 153,
    filledShares: 0,
    remainingShares: 153,
    usdcAmount: 100,
    status: "pending",
    createdAt: "2024-10-10T09:00:00.000Z",
    token: {
      id: "12322dd22",
      title: "yes",
    },
  },

  // ── Market Sell — pending (open tab) ──────────────────────────────────────
  // User wants to sell 80 shares at current 42¢ market price
  {
    id: "order-009",
    marketId: "2",
    marketTitle: "Will Bitcoin reach $100k by end of 2024?",
    outcome: "No",
    side: "Sell",
    orderType: "Market",
    price: 42,
    originalShares: 80,
    filledShares: 0,
    remainingShares: 80,
    usdcAmount: 33.6,
    status: "pending",
    createdAt: "2024-10-10T10:00:00.000Z",
    token: {
      id: "12322d654d",
      title: "no",
    },
  },

  // ── Filled orders ─────────────────────────────────────────────────────────
  {
    id: "order-005",
    marketId: "1",
    marketTitle: "Will the Fed cut rates in 2024?",
    outcome: "Yes",
    side: "Buy",
    orderType: "Market",
    price: 68,
    originalShares: 150,
    filledShares: 150,
    remainingShares: 0,
    usdcAmount: 102,
    status: "filled",
    createdAt: "2024-09-20T11:00:00.000Z",
    token: {
      id: "12322ddd",
      title: "yes",
    },
  },
  {
    id: "order-006",
    marketId: "5",
    marketTitle: "Will India win the Cricket World Cup 2024?",
    outcome: "No",
    side: "Buy",
    orderType: "Market",
    price: 35,
    originalShares: 80,
    filledShares: 80,
    remainingShares: 0,
    usdcAmount: 28,
    status: "filled",
    createdAt: "2024-09-25T08:30:00.000Z",
    token: {
      id: "12322d654d",
      title: "no",
    },
  },

  // ── Cancelled orders ──────────────────────────────────────────────────────
  {
    id: "order-007",
    marketId: "6",
    marketTitle: "Will GPT-5 be released before 2025?",
    outcome: "Yes",
    side: "Buy",
    orderType: "Limit",
    price: 72,
    originalShares: 100,
    filledShares: 0,
    remainingShares: 100,
    usdcAmount: 72,
    status: "cancelled",
    createdAt: "2024-09-15T13:20:00.000Z",
    token: {
      id: "12322ddd",
      title: "yes",
    },
  },
]
