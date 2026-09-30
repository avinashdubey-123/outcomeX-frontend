// what TradePanel sends out — matches exactly what TradePanel has
export interface TradePanelOrder {
  action: "Buy" | "Sell"
  orderType: "Market" | "Limit"
  outcome: "Yes" | "No" | "Up" | "Down" // ← matches TradePanel exactly
  amount?: number
  shares?: number
  limitCents?: number
  expirationEnabled: boolean
}

// full order — TradePanelOrder + blockchain fields added by EventPage
export interface TradeOrder extends TradePanelOrder {
  marketId: string
  yesTokenId: string
  noTokenId: string
  collateralToken: string
  conditionId: string
  yesTokenOnChainId: string | null
  noTokenOnChainId: string | null
}

export type OrderMeta = {
  marketId: string
  outcome: string
  side: "Buy" | "Sell"
  orderType: "LIMIT"
  price: number
  shares: number
  usdcAmount: number
}
