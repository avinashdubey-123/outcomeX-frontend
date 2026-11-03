import type { Market } from "./types"

export const MARKETS_PER_CATEGORY = 4

export interface CategoryMarkets {
  category: string
  markets: Market[]
}

const totalVolume = (market: Market) => market.yesVolume + market.noVolume
const timeOf = (iso: string) => new Date(iso).getTime()

export const byNewest = (a: Market, b: Market) => timeOf(b.createdAt) - timeOf(a.createdAt)
export const byVolume = (a: Market, b: Market) => totalVolume(b) - totalVolume(a)

/** Groups markets by category (first-seen order), keeping the first `limit` after sorting. */
export function groupByCategory(
  markets: Market[],
  sort: (a: Market, b: Market) => number,
  limit: number = MARKETS_PER_CATEGORY,
): CategoryMarkets[] {
  const groups = new Map<string, Market[]>()
  for (const market of [...markets].sort(sort)) {
    const key = market.category || "Other"
    const bucket = groups.get(key) ?? []
    if (bucket.length < limit) bucket.push(market)
    groups.set(key, bucket)
  }
  return [...groups].map(([category, items]) => ({ category, markets: items }))
}

/** Active markets that resolve soonest, ignoring ones already past their resolution time. */
export function selectEndingSoon(markets: Market[], now: number = Date.now()): Market[] {
  return markets
    .filter((m) => timeOf(m.resolutionTime) > now)
    .sort((a, b) => timeOf(a.resolutionTime) - timeOf(b.resolutionTime))
}

/**
 * Fills each homepage section from its own ranked list without repeating a market
 * in an earlier section, so every headline shows different markets.
 */
export function pickDistinctSections<K extends string>(
  ranked: Record<K, Market[]>,
  order: K[],
  size: number = MARKETS_PER_CATEGORY,
): Record<K, Market[]> {
  const used = new Set<string>()
  const result = {} as Record<K, Market[]>
  for (const key of order) {
    const picked = ranked[key].filter((m) => !used.has(m.id)).slice(0, size)
    picked.forEach((m) => used.add(m.id))
    result[key] = picked
  }
  return result
}
