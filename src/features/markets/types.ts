// ─── Shared sub-types ─────────────────────────────────────────────────────────

export type MarketFrequency = "Daily" | "Monthly" | "Event"

export interface PricePoint {
  timestamp: string // ISO string  e.g. "2024-10-01T00:00:00.000Z"
  yesPrice: number // 0.0 to 1.0
  noPrice?: number
}

export interface OrderEntry {
  price: number // 0.0 to 1.0
  shares: number
}

export interface OrderBook {
  yes: OrderEntry[]
  no: OrderEntry[]
}

// ─── Unified Market type (matches API MarketDetails shape) ────────────────────
//
// Both mock data and API responses use this single type.
// Fields marked optional are populated by mock data but may be absent from API list results.

export interface Market {
  // ── Core identity ──────────────────────────────────────────────────────────
  id: string
  title: string
  description: string
  image: string // API: displayImageUrl  |  mock: replaces thumbnailUrl
  category: string
  resolutionTime: string // API: resolutionTime   |  mock: replaces expiryDate
  createdAt: string

  // ── On-chain / trade fields ────────────────────────────────────────────────
  collateralToken: string
  conditionId: string
  oracleIdentifier?: string // bytes32 — used for dispute flow
  winningOutcome?: string | null
  yesTokenId: string | null
  noTokenId: string | null
  yesTokenOnChainId: string | null
  noTokenOnChainId: string | null

  // ── Volume (numeric, UI formats as needed) ─────────────────────────────────
  yesVolume: number
  noVolume: number

  // ── Probabilities (display only; derived or estimated) ─────────────────────
  yesProbability: number // 0–100
  noProbability: number // 0–100

  // ── Lifecycle status (mirrors MARKET_STATUS in marketStatus.ts) ──────────
  status?: number

  // ── Bookmark ───────────────────────────────────────────────────────────────
  isBookmarked?: boolean

  // ── Optional display / mock-only extras ────────────────────────────────────
  isTrending?: boolean
  frequency?: MarketFrequency
  resolver?: string
  rules?: string
  priceHistory?: PricePoint[]
  orderBook?: OrderBook
  optionGroupId?: string
}

// ─── Redux State ──────────────────────────────────────────────────────────────

export interface MarketsState {
  list: Market[]
  loading: boolean
  error: string | null
  selectedCategoryId: string
  selectedCategoryName: string
  selectedMarket: Market | null
  bookmarkedIds: string[]
}
