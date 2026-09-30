// Amounts from Redux are stored as micro-USDC strings (e.g. "12345678" = 12.345678 USDC).
// Components outside Redux (like StatsCards) may pass plain dollar numbers directly.
// This formatter handles both cases:
//   - string → treated as micro-USDC integer (from Redux state)
//   - number → treated as already-in-dollars (from local computed values)

const MICRO = 1_000_000n

const toDollarFloat = (value: string | number): number => {
  if (typeof value === "number") return value // already dollars
  return Number(BigInt(value)) / Number(MICRO) // micro-USDC string → dollars
}

export const formatCash = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return "--"
  const n = toDollarFloat(value)
  if (n > 0 && n < 0.01) return "< $0.01"
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`
  return `$${n.toFixed(2)}`
}

export const formatPortfolio = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return "$0.00"
  if (value === 0 || value === "0") return "$0.00"
  return formatCash(value)
}
