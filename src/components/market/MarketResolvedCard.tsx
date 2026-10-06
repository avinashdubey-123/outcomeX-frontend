// src/components/market/MarketResolvedCard.tsx

import { useEffect, useState } from "react"
import { useNavigate } from "react-router"

// Mirror of backend RESOLUTION_ACTION constants
const RESOLUTION_ACTION = {
  PROPOSE: 1,
  DISPUTE: 2,
  DISPUTE_SETTLEMENT: 3,
  SETTLE: 4,
} as const

interface MarketResolvedCardProps {
  winningOutcome: "YES" | "NO" | "To be decided"
  resolutionTime: string
  marketId?: string
  /** The `action` value of the latest entry in the oracle timeline, or null/undefined if not loaded yet. */
  latestOracleAction?: number | null
  /** The proposed-but-not-yet-settled answer from the oracle timeline, if any. */
  proposedOutcome?: "YES" | "NO" | null
}

const formatMarketDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

export const MarketResolvedCard = ({
  winningOutcome,
  resolutionTime,
  marketId,
  latestOracleAction,
  proposedOutcome,
}: MarketResolvedCardProps) => {
  const navigate = useNavigate()
  const isYesWon = winningOutcome === "YES"
  const TBD = winningOutcome === "To be decided"
  const color = TBD ? "#A9A8AD" : isYesWon ? "#00c853" : "#e53935"
  const showProposed = TBD && proposedOutcome != null
  const isDisputeSettlement = latestOracleAction === RESOLUTION_ACTION.DISPUTE_SETTLEMENT
  const isSettle = latestOracleAction === RESOLUTION_ACTION.SETTLE

  const [localDisputeRaised, setLocalDisputeRaised] = useState(false)

  useEffect(() => {
    if (marketId && localStorage.getItem(`dispute_raised_${marketId}`) === "true") {
      setLocalDisputeRaised(true)
    }
  }, [marketId])

  // ── Dispute is only allowed when the LATEST oracle action is PROPOSE (1).
  // Any subsequent state (DISPUTE, DISPUTE_SETTLEMENT, SETTLE) means it's too
  // late — either already disputed or fully settled.
  const canRaiseDispute = latestOracleAction === RESOLUTION_ACTION.PROPOSE && !localDisputeRaised

  const handleRaiseDispute = () => {
    navigate(`/dispute/${marketId ?? ""}`)
  }

  return (
    <div className="border  border-primary/50 rounded-2xl xl:mx-6 overflow-hidden p-6 bg-linear-to-b from primary/10 to bg-primary/5 ">
      {/* Header */}
      <div className="px-4  text-center">
        <div className="font-base  uppercase mb-1.5 mt-2 text-white/60  text-nowrap">
          Market Resolved
        </div>
        <div className="font-md text-white">{formatMarketDate(resolutionTime)}</div>
      </div>

      {/*divider */}
      <div className="flex justify-center my-4">
        <div className="h-px bg-linear-to-r from-transparent via-white/10 to transparent w-[90%]" />
      </div>
      {/* Body */}
      <div className="px-5  text-center">
        <div className="font-default font-bold uppercase text-primary/70 mb-2.5">
          {isSettle
            ? "Finalised Outcome"
            : showProposed && !isDisputeSettlement
              ? "Proposed Outcome"
              : "Outcome"}
        </div>

        <div
          className="inline-block py-2 px-3.5 tracking-wider"
          style={{
            color: showProposed ? (proposedOutcome === "YES" ? "#00c853" : "#e53935") : color,
          }}
        >
          {showProposed ? proposedOutcome : winningOutcome}
        </div>

        {showProposed && !isDisputeSettlement && !isSettle && (
          <p className="text-xs text-white/40 italic -mt-1 mb-1">
            Awaiting settlement — not yet final
          </p>
        )}
      </div>

      {/* Dispute Section */}
      <div className="px-5  text-center">
        {canRaiseDispute ? (
          <button
            onClick={handleRaiseDispute}
            className="w-full py-2 px-4 rounded-lg border border-dispute bg-dispute/10 text-dispute text-sm font-semibold hover:bg-dispute/20 transition-colors"
          >
            Raise Dispute
          </button>
        ) : latestOracleAction == null ? null : ( // Timeline not yet loaded — show nothing to avoid flash of wrong state
          <p className="text-xs text-white/40 italic">
            {latestOracleAction === RESOLUTION_ACTION.SETTLE
              ? "Market settled — dispute period closed"
              : latestOracleAction === RESOLUTION_ACTION.DISPUTE_SETTLEMENT
                ? "Dispute settled by admin"
                : latestOracleAction === RESOLUTION_ACTION.DISPUTE || localDisputeRaised
                  ? "Dispute already raised"
                  : "Dispute not available"}
          </p>
        )}
      </div>
    </div>
  )
}
