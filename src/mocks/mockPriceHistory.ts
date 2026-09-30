// src/mocks/mockPriceHistory.ts

export interface PricePoint {
  timestamp: number // unix seconds
  yesPrice: number // 0–1 range e.g. 0.65
}

export type ChartTab = "1D" | "1W" | "1M" | "ALL"

const POINTS_MAP: Record<ChartTab, number> = {
  "1D": 24,
  "1W": 84,
  "1M": 60,
  ALL: 120,
}

const INTERVAL_MAP: Record<ChartTab, number> = {
  "1D": 3600, // 1 hour
  "1W": 21600, // 6 hours
  "1M": 43200, // 12 hours
  ALL: 86400, // 1 day
}

export const generateMockPriceHistory = (
  tab: ChartTab = "1M",
  startPrice: number = 0.5,
): PricePoint[] => {
  const points = POINTS_MAP[tab]
  const interval = INTERVAL_MAP[tab]
  const BASE = Math.floor(Date.now() / 1000) - points * interval

  let price = startPrice

  return Array.from({ length: points }, (_, i) => {
    // realistic random walk — slight upward drift
    const change = (Math.random() - 0.47) * 0.025
    price = Math.min(0.98, Math.max(0.02, price + change))

    return {
      timestamp: BASE + i * interval,
      yesPrice: parseFloat(price.toFixed(4)),
    }
  })
}
