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

export interface MockCandle {
  time: number // unix seconds
  open: number // 0–1
  high: number
  low: number
  close: number
}

// Candle spacing matches the chart's per-tab time grid (10min / 1h / 4h / 12h) so it never draws stairs.
// Spans: 1D ≈ 36h, 1W ≈ 8 days, 1M ≈ 30 days, ALL ≈ 1 year.
const CANDLE_CONFIG: Record<ChartTab, { count: number; intervalSeconds: number }> = {
  "1D": { count: 216, intervalSeconds: 600 },
  "1W": { count: 192, intervalSeconds: 3600 },
  "1M": { count: 180, intervalSeconds: 4 * 3600 },
  ALL: { count: 730, intervalSeconds: 43200 },
}

const ANCHOR_SECONDS = 600

// One market = one continuous curve made of slow swings plus ever faster, smaller wiggles.
// Every tab samples this same curve, so the day looks like a zoomed-in piece of the year.
const DAY = 86400
const OCTAVES = [
  { periodSeconds: 90 * DAY, amplitude: 0.22 },
  { periodSeconds: 30 * DAY, amplitude: 0.13 },
  { periodSeconds: 7 * DAY, amplitude: 0.075 },
  { periodSeconds: 2 * DAY, amplitude: 0.038 },
  { periodSeconds: DAY / 2, amplitude: 0.016 },
  { periodSeconds: 3 * 3600, amplitude: 0.007 },
  { periodSeconds: 40 * 60, amplitude: 0.002 },
]

const hashSeed = (seed: string): number => {
  let hash = 2166136261
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const latticeValue = (seed: string, octave: number, index: number): number =>
  (hashSeed(`${seed}:${octave}:${index}`) / 4294967296) * 2 - 1

/** Sum of smooth (cosine-interpolated) value noise across all octaves at an absolute time. */
const curveAt = (seed: string, timeSeconds: number): number => {
  let total = 0
  OCTAVES.forEach(({ periodSeconds, amplitude }, octave) => {
    const position = timeSeconds / periodSeconds
    const index = Math.floor(position)
    const eased = (1 - Math.cos((position - index) * Math.PI)) / 2
    const value =
      latticeValue(seed, octave, index) * (1 - eased) +
      latticeValue(seed, octave, index + 1) * eased
    total += value * amplitude
  })
  return total
}

/**
 * Deterministic OHLC candles for mock markets that have no backend price history.
 * All tabs sample one shared curve per market, ending exactly at `endPrice` (0–1) so it
 * agrees with the displayed probability.
 */
export const generateMockCandles = (
  seed: string,
  tab: ChartTab,
  endPrice: number = 0.5,
): MockCandle[] => {
  const { count, intervalSeconds } = CANDLE_CONFIG[tab]
  const anchor = Math.floor(Date.now() / 1000 / ANCHOR_SECONDS) * ANCHOR_SECONDS
  const clamp = (v: number) => Math.min(0.97, Math.max(0.03, v))
  const target = clamp(endPrice)
  const endOffset = curveAt(seed, anchor)
  const closeAt = (time: number) => clamp(target + curveAt(seed, time) - endOffset)

  return Array.from({ length: count }, (_, i) => {
    const time = anchor - (count - 1 - i) * intervalSeconds
    const open = closeAt(time - intervalSeconds)
    const close = closeAt(time)
    const wick = (hashSeed(`${seed}:wick:${time}`) / 4294967296) * 0.003
    return {
      time,
      open: parseFloat(open.toFixed(4)),
      high: parseFloat((Math.max(open, close) + wick).toFixed(4)),
      low: parseFloat((Math.min(open, close) - wick).toFixed(4)),
      close: parseFloat(close.toFixed(4)),
    }
  })
}
