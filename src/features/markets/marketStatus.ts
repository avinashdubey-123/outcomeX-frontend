// src/features/markets/marketStatus.ts
//
// Single source of truth for all market lifecycle statuses.
// Mirrors the backend enum exactly so frontend comparisons stay in sync.

export const MARKET_STATUS = {
  // --- Creation pipeline ---
  PENDING: 1, // DB records created, no blockchain call yet
  MARKET_CREATE_SUBMITTED: 2, // createMarket() tx submitted
  MARKET_CREATED: 3, // MarketCreated event received; conditionId/oracleIdentifier/blockNumber stored
  USDC_APPROVE_SUBMITTED: 4, // usdc.approve(ctf, amount) tx submitted
  USDC_APPROVED: 5, // approve tx mined
  SPLIT_SUBMITTED: 6, // splitPosition() tx submitted
  SPLIT_CONFIRMED: 7, // PositionSplit event received; tokenIds + volumes stored
  TOKEN_REGISTER_SUBMITTED: 8, // registerToken() tx submitted
  // --- Terminal statuses ---
  PLACING_YES_LIQUIDITY_ORDERS: 9,
  PLACING_NO_LIQUIDITY_ORDERS: 10,
  ACTIVE: 11, // registerToken mined — market is live
  FAILED: 12, // irrecoverable failure during creation
  RESOLVED: 13,
  PAIDOUT: 14,
  CANCELLED: 15,
} as const

export type MarketStatus = (typeof MARKET_STATUS)[keyof typeof MARKET_STATUS]

// ── Helper predicates ─────────────────────────────────────────────────────────

/** Market is fully live and tradeable */
export const isMarketActive = (status: number): boolean => status === MARKET_STATUS.ACTIVE

/** Market result has been determined (resolution + payout both count) */
export const isMarketResolved = (status: number): boolean =>
  status === MARKET_STATUS.RESOLVED || status === MARKET_STATUS.PAIDOUT

/** Market is in the creation pipeline (not yet live) */
export const isMarketPending = (status: number): boolean =>
  status >= MARKET_STATUS.PENDING && status <= MARKET_STATUS.TOKEN_REGISTER_SUBMITTED

/** Market cannot be interacted with (resolved, paid out, cancelled, or failed) */
export const isMarketClosed = (status: number): boolean =>
  status === MARKET_STATUS.RESOLVED ||
  status === MARKET_STATUS.PAIDOUT ||
  status === MARKET_STATUS.CANCELLED ||
  status === MARKET_STATUS.FAILED

// ── Display helpers ───────────────────────────────────────────────────────────

export const MARKET_STATUS_LABEL: Record<MarketStatus, string> = {
  [MARKET_STATUS.PENDING]: "Pending",
  [MARKET_STATUS.MARKET_CREATE_SUBMITTED]: "Creating",
  [MARKET_STATUS.MARKET_CREATED]: "Creating",
  [MARKET_STATUS.USDC_APPROVE_SUBMITTED]: "Creating",
  [MARKET_STATUS.USDC_APPROVED]: "Creating",
  [MARKET_STATUS.SPLIT_SUBMITTED]: "Creating",
  [MARKET_STATUS.SPLIT_CONFIRMED]: "Creating",
  [MARKET_STATUS.TOKEN_REGISTER_SUBMITTED]: "Creating",
  [MARKET_STATUS.PLACING_NO_LIQUIDITY_ORDERS]: "creating",
  [MARKET_STATUS.PLACING_YES_LIQUIDITY_ORDERS]: "creating",
  [MARKET_STATUS.ACTIVE]: "Active",
  [MARKET_STATUS.FAILED]: "Failed",
  [MARKET_STATUS.RESOLVED]: "Resolved",
  [MARKET_STATUS.PAIDOUT]: "Paid Out",
  [MARKET_STATUS.CANCELLED]: "Cancelled",
}

/** Returns a human-readable label for any numeric status value */
export const getMarketStatusLabel = (status: number): string =>
  MARKET_STATUS_LABEL[status as MarketStatus] ?? "Unknown"
