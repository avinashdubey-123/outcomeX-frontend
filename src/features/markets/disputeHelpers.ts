export function extractDisputeData(
  timelineData:
    | {
        data: {
          id: string
          action: number
          bondAmount: string | null
          response: number | null
          createdAt: string
          proposerAddress: string | null
          disputerAddress: string | null
        }[]
      }
    | undefined,
) {
  const entries = timelineData?.data ?? []

  // Find the PROPOSE entry (action=1) — this is the one the dispute must reference
  const proposeEntry = [...entries].reverse().find((r) => r.action === 1 && r.bondAmount != null)

  if (!proposeEntry || proposeEntry.bondAmount == null) return null

  // bondAmount from the API is already in micro-units (e.g. "100000000" = 100 USDC)
  const bondAmountMicro = proposeEntry.bondAmount // raw micro-USDC string
  const bondAmountUSDC = Number(bondAmountMicro) / 1_000_000 // human-readable USDC

  return {
    bondAmount: bondAmountMicro, // micro-units string — pass directly to contract
    bondAmountUSDC, // e.g. 100.0 — used for display
    proposedTimestamp: proposeEntry.createdAt, // ISO string from createdAt
    // identifier is NOT in the timeline — it comes from market.oracleIdentifier
  }
}
