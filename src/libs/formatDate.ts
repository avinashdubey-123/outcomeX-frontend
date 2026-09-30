// src/lib/formatDate.ts

/**
 * Formats any date string into Polymarket style: "Dec 31, 2024"
 * Handles ISO strings, "Dec 15 2024", timestamps, etc.
 */
export const formatMarketDate = (raw: string | number | undefined | null): string => {
  if (!raw) return "—"
  const d = new Date(raw)
  if (isNaN(d.getTime())) return String(raw) // fallback: show as-is if unparseable
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
