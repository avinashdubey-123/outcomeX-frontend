// src/pages/portfolio/portfolioConstants.ts

export const PORTFOLIO_TABS = {
  POSITIONS: "positions",
  ORDERS: "orders",
  HISTORY: "history",
} as const

export type PortfolioTab = (typeof PORTFOLIO_TABS)[keyof typeof PORTFOLIO_TABS]

export const CHART_TABS = {
  ONE_DAY: "1D",
  ONE_WEEK: "1W",
  ONE_MONTH: "1M",
  ALL: "ALL",
} as const

export type ChartTab = (typeof CHART_TABS)[keyof typeof CHART_TABS]

export const PORTFOLIO_COLORS = {
  GREEN: "#00c853",
  GREEN_DIM: "rgba(0,200,83,0.12)",
  GREEN_CARD_BG: "rgba(0,200,83,0.06)",
  RED: "#e53935",
  RED_DIM: "rgba(229,57,53,0.12)",
  CARD_BG: "rgba(255,255,255,0.05)",
  CARD_BORDER: "rgba(255,255,255,0.10)",
  TEXT_PRIMARY: "#ffffff",
  TEXT_MUTED: "rgba(255,255,255,0.4)",
  TEXT_MUTED_2: "rgba(255,255,255,0.25)",
  PAGE_BG: "#0A0C10",
  SURFACE: "#161a22",
} as const

export const POSITION_SIDE = {
  YES: "YES",
  NO: "NO",
} as const

export type PositionSide = (typeof POSITION_SIDE)[keyof typeof POSITION_SIDE]

export const ORDER_STATUS = {
  PENDING: "pending",
  PARTIAL: "partial",
  FILLED: "filled",
  CANCELLED: "cancelled",
} as const

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

export const HISTORY_TYPE = {
  BUY: "buy",
  SELL: "sell",
  REDEEM: "redeem",
} as const

export type HistoryType = (typeof HISTORY_TYPE)[keyof typeof HISTORY_TYPE]
