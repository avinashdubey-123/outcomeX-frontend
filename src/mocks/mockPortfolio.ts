// src/mocks/mockPortfolio.ts
// Replace each export with API call when backend is ready:
//   const { data: positions } = useGetPositionsQuery()
//   const { data: orders }    = useGetOrdersQuery()
//   const { data: history }   = useGetHistoryQuery()

import {
  HISTORY_TYPE,
  type HistoryType,
  ORDER_STATUS,
  type OrderStatus,
  POSITION_SIDE,
  type PositionSide,
} from "@/pages/portfolio/portfolioConstants"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Position {
  id: string
  marketId: string
  marketTitle: string
  category: string
  tags?: string[]
  side: PositionSide
  shares: number
  avgPrice: number
  nowPrice: number
  invested: number
  value: number

  // ── blockchain fields needed for redeem ──
  conditionId: string // identifies market on-chain
  TokenId: string // on-chain uint256 token ID

  collateralToken: string // USDC address

  // ── resolution fields ──
  isResolved: boolean
  winningOutcome: "YES" | "NO" | null // null = not resolved yet
  isRedeemed: boolean // user already claimed winnings
}

export interface PortfolioOrder {
  id: string
  marketId: string
  marketTitle: string
  category: string
  side: PositionSide
  direction: "Buy" | "Sell"
  orderType: "Limit" | "Market"
  shares: number
  price: number // cents
  filled: number // shares filled
  status: OrderStatus
  createdAt: string // ISO
  expiresAt?: string
  token: {
    id: string
    title: string
  }
}

export interface HistoryItem {
  id: string
  marketId: string
  marketTitle: string
  category: string
  type: HistoryType
  side: PositionSide
  orderType: "Limit" | "Market"
  shares: number
  price: number // cents
  total: number // USDC
  pnl?: number // only for sell/redeem
  settledAt: string // ISO
}

export interface PortfolioChartPoint {
  day: number // 1–30
  value: number // portfolio USD value
}

// ── Mock positions ────────────────────────────────────────────────────────────
// export const MOCK_POSITIONS: Position[] = [
//   {
//     id: "pos-001",
//     marketId: "m-001",
//     marketTitle: "Will Bitcoin reach $150K by end of 2026?",
//     category: "Crypto",
//     side: POSITION_SIDE.YES,
//     shares: 750,
//     avgPrice: 67,
//     nowPrice: 89,
//     invested: 502.5,
//     value: 667.5,
//     // blockchain
//     conditionId: "0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1",
//     yesTokenId: "50797541917343757740820451019718158946955363447418211844464195437",
//     noTokenId: "12345678901234567890123456789012345678901234567890123456789012345",
//     collateralToken: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
//     // resolution — active market
//     isResolved: false,
//     winningOutcome: null,
//     isRedeemed: false,
//   },
//   {
//     id: "pos-002",
//     marketId: "m-002",
//     marketTitle: "Will AI create 10M+ new jobs in 2026?",
//     category: "Tech",
//     side: POSITION_SIDE.YES,
//     shares: 600,
//     avgPrice: 42,
//     nowPrice: 56,
//     invested: 252.0,
//     value: 336.0,
//     conditionId: "0xbcd234ef5678bcd234ef5678bcd234ef5678bcd234ef5678bcd234ef5678bcd2",
//     yesTokenId: "98765432109876543210987654321098765432109876543210987654321098765",
//     noTokenId: "11111111111111111111111111111111111111111111111111111111111111111",
//     collateralToken: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
//     isResolved: false,
//     winningOutcome: null,
//     isRedeemed: false,
//   },
//   {
//     id: "pos-003",
//     marketId: "m-003",
//     marketTitle: "US GDP growth above 3% in 2026?",
//     category: "Economy",
//     side: POSITION_SIDE.NO,
//     shares: 850,
//     avgPrice: 42,
//     nowPrice: 34,
//     invested: 357.0,
//     value: 289.0,
//     conditionId: "0xcde345f06789cde345f06789cde345f06789cde345f06789cde345f06789cde3",
//     yesTokenId: "22222222222222222222222222222222222222222222222222222222222222222",
//     noTokenId: "33333333333333333333333333333333333333333333333333333333333333333",
//     collateralToken: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
//     isResolved: false,
//     winningOutcome: null,
//     isRedeemed: false,
//   },
//   {
//     id: "pos-004",
//     marketId: "m-004",
//     marketTitle: "Will new federal election happen in 2026?",
//     category: "Politics",
//     tags: ["Closing Soon"],
//     side: POSITION_SIDE.NO,
//     shares: 1200,
//     avgPrice: 66,
//     nowPrice: 76,
//     invested: 792.0,
//     value: 912.0,
//     conditionId: "0xdef456017890def456017890def456017890def456017890def456017890def4",
//     yesTokenId: "44444444444444444444444444444444444444444444444444444444444444444",
//     noTokenId: "55555555555555555555555555555555555555555555555555555555555555555",
//     collateralToken: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
//     isResolved: false,
//     winningOutcome: null,
//     isRedeemed: false,
//   },

//   // ── RESOLVED markets below — for testing redeem flow ──

//   {
//     id: "pos-005",
//     marketId: "9e282e56-870c-4279-9314-9fd403253755",
//     marketTitle: "string",
//     category: "string",
//     side: POSITION_SIDE.YES, // user held YES
//     shares: 450,
//     avgPrice: 55,
//     nowPrice: 100, // resolved = $1.00
//     invested: 247.5,
//     value: 450.0, // 450 shares × $1.00
//     conditionId: "0xef5670289012ef5670289012ef5670289012ef5670289012ef5670289012ef56",
//     yesTokenId: "66666666666666666666666666666666666666666666666666666666666666666",
//     noTokenId: "77777777777777777777777777777777777777777777777777777777777777777",
//     collateralToken: "0xb157f0dD6859722AfE1A5b4D983b94db1468b15A",
//     isResolved: true,
//     winningOutcome: "YES", // YES won → user can redeem ✅
//     isRedeemed: false, // not yet redeemed
//   },
//   {
//     id: "pos-006",
//     marketId: "m-006",
//     marketTitle: "S&P 500 above 6500 by June 2026?",
//     category: "Finance",
//     side: POSITION_SIDE.YES, // user held YES
//     shares: 900,
//     avgPrice: 71,
//     nowPrice: 0, // resolved = $0.00 (lost)
//     invested: 639.0,
//     value: 0, // worthless
//     conditionId: "0xf06781390123f06781390123f06781390123f06781390123f06781390123f067",
//     yesTokenId: "88888888888888888888888888888888888888888888888888888888888888888",
//     noTokenId: "99999999999999999999999999999999999999999999999999999999999999999",
//     collateralToken: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
//     isResolved: true,
//     winningOutcome: "NO", // NO won → user held YES → lost ❌
//     isRedeemed: false,
//   },
//   {
//     id: "pos-007",
//     marketId: "m-007",
//     marketTitle: "Will Fed cut rates before Q3 2026?",
//     category: "Economy",
//     side: POSITION_SIDE.NO, // user held NO
//     shares: 300,
//     avgPrice: 38,
//     nowPrice: 100,
//     invested: 114.0,
//     value: 300.0, // 300 shares × $1.00
//     conditionId: "0x017892401234017892401234017892401234017892401234017892401234017892",
//     yesTokenId: "10101010101010101010101010101010101010101010101010101010101010101",
//     noTokenId: "20202020202020202020202020202020202020202020202020202020202020202",
//     collateralToken: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
//     isResolved: true,
//     winningOutcome: "NO", // NO won → user held NO → can redeem ✅
//     isRedeemed: false,
//   },
//   {
//     id: "pos-008",
//     marketId: "m-008",
//     marketTitle: "Will Apple release AR glasses in 2025?",
//     category: "Tech",
//     side: POSITION_SIDE.NO,
//     shares: 400,
//     avgPrice: 61,
//     nowPrice: 100,
//     invested: 244.0,
//     value: 400.0,
//     conditionId: "0x12890350234512890350234512890350234512890350234512890350234512890",
//     yesTokenId: "30303030303030303030303030303030303030303030303030303030303030303",
//     noTokenId: "40404040404040404040404040404040404040404040404040404040404040404",
//     collateralToken: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
//     isResolved: true,
//     winningOutcome: "NO", // NO won → user held NO → ALREADY redeemed
//     isRedeemed: true, // ← already claimed, no button shown
//   },
// ]

// ── Mock orders ───────────────────────────────────────────────────────────────
export const MOCK_PORTFOLIO_ORDERS: PortfolioOrder[] = [
  {
    id: "ord-001",
    marketId: "m-001",
    marketTitle: "Will Bitcoin reach $150K by end of 2026?",
    category: "Crypto",
    side: POSITION_SIDE.YES,
    direction: "Buy",
    orderType: "Limit",
    shares: 200,
    price: 65,
    filled: 0,
    status: ORDER_STATUS.PENDING,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    token: {
      id: "12322ddd",
      title: "yes",
    },
  },
  {
    id: "ord-002",
    marketId: "m-007",
    marketTitle: "Will Fed cut rates before Q3 2026?",
    category: "Economy",
    side: POSITION_SIDE.NO,
    direction: "Buy",
    orderType: "Limit",
    shares: 500,
    price: 38,
    filled: 200,
    status: ORDER_STATUS.PARTIAL,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    token: {
      id: "12322d654d",
      title: "no",
    },
  },
  {
    id: "ord-003",
    marketId: "m-003",
    marketTitle: "US GDP growth above 3% in 2026?",
    category: "Economy",
    side: POSITION_SIDE.YES,
    direction: "Sell",
    orderType: "Limit",
    shares: 300,
    price: 44,
    filled: 0,
    status: ORDER_STATUS.PENDING,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    token: {
      id: "1232ggdd",
      title: "yes",
    },
  },
]

// ── Mock history ──────────────────────────────────────────────────────────────
export const MOCK_HISTORY: HistoryItem[] = [
  {
    id: "his-001",
    marketId: "m-008",
    marketTitle: "Will Apple release AR glasses in 2025?",
    category: "Tech",
    type: HISTORY_TYPE.REDEEM,
    side: POSITION_SIDE.NO,
    orderType: "Market",
    shares: 400,
    price: 100,
    total: 400.0,
    pnl: 156.0,
    settledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "his-002",
    marketId: "m-009",
    marketTitle: "Will GPT-5 launch before 2026?",
    category: "AI",
    type: HISTORY_TYPE.SELL,
    side: POSITION_SIDE.YES,
    orderType: "Limit",
    shares: 250,
    price: 72,
    total: 180.0,
    pnl: -42.5,
    settledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: "his-003",
    marketId: "m-010",
    marketTitle: "Will India win T20 World Cup 2025?",
    category: "Sports",
    type: HISTORY_TYPE.BUY,
    side: POSITION_SIDE.YES,
    orderType: "Limit",
    shares: 600,
    price: 58,
    total: 348.0,
    settledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "his-004",
    marketId: "m-011",
    marketTitle: "Will Elon Musk remain CEO of X in 2025?",
    category: "Business",
    type: HISTORY_TYPE.SELL,
    side: POSITION_SIDE.YES,
    orderType: "Limit",
    shares: 150,
    price: 81,
    total: 121.5,
    pnl: 34.5,
    settledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
]

// ── Mock chart data ───────────────────────────────────────────────────────────
export const MOCK_PORTFOLIO_CHART: PortfolioChartPoint[] = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  value: Math.round(22000 + (i / 29) * 7000 + (Math.random() - 0.3) * 800),
}))

// ── Mock stats ────────────────────────────────────────────────────────────────
export const MOCK_PORTFOLIO_STATS = {
  totalValue: 4685.0,
  available: 8234.67,
  pastMonthPnl: 540.0,
  pastMonthPct: 13.03,
  activePositions: 10,
  potentialValue: 3111.0,
  portfolioValue: 28589.54,
  portfolioDelta: 10158.69,
  portfolioDeltaPct: 55.12,
}
