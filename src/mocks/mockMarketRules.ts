// src/mocks/mockMarketRules.ts

export interface MarketRule {
  source: string
  deadline: string // ISO
  notes: string
}

export const MOCK_MARKET_RULES: MarketRule = {
  source: "Associated Press, Reuters, or BBC News",
  deadline: "2024-12-31T23:59:59.000Z",
  notes:
    "In case of conflicting reports, the market will wait for official confirmation. Early resolution possible if outcome is unambiguous.",
}
