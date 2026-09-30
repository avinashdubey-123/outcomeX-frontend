// src/components/market/tabs/MarketRulesTab.tsx

import { useState } from "react"

import { formatMarketDate } from "@/libs/formatDate"
import { MOCK_MARKET_RULES } from "@/mocks/mockMarketRules"

const RULES_MAX = 200

interface MarketRulesTabProps {
  description: string | undefined
  volume: number
  resolutionTime: string | undefined
  createdAt: string | undefined
}

export const MarketRulesTab = ({
  description,
  volume,
  resolutionTime,
  createdAt,
}: MarketRulesTabProps) => {
  const [rulesOpen, setRulesOpen] = useState(false)

  const rules = description ?? ""
  const rulesPreview =
    rules.length > RULES_MAX && !rulesOpen ? rules.slice(0, RULES_MAX) + "…" : rules

  return (
    <div className="">
      {/* ── Description / Rules text ── */}
      {rules ? (
        <>
          <p className="font-sm text-tab-text ">{rulesPreview}</p>
          {rules.length > RULES_MAX && (
            <button
              className="font-base text-primary font-semibold mt-2 cursor-pointer transition-all hover:opacity-80"
              onClick={() => setRulesOpen((p) => !p)}
            >
              {rulesOpen ? "▲ Show less" : "▼ Show more"}
            </button>
          )}
        </>
      ) : (
        <p className="font-sm text-white/60 ">No description provided.</p>
      )}

      {/* ── Market meta grid ── */}
      <div className=" grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-x-3 gap-y-4.5 mt-5  p-4 bg-white/5  border border-white/10 rounded-lg ">
        <div>
          <div className=" font-xs font-bold text-muted-foreground uppercase mb-1">Volume</div>
          <div className="ep-meta-value">${volume.toLocaleString()}</div>
        </div>
        <div>
          <div className="font-xs font-bold text-muted-foreground uppercase mb-1">End Date</div>
          <div className="ep-meta-value">{formatMarketDate(resolutionTime)}</div>
        </div>
        {createdAt && (
          <div>
            <div className="font-xs font-bold text-muted-foreground uppercase mb-1">Created</div>
            <div className="ep-meta-value">{formatMarketDate(createdAt)}</div>
          </div>
        )}

        {/* ── Resolution info from mock — swap with API later ── */}
        {/* TODO: replace MOCK_MARKET_RULES with market.resolutionSource from API */}
        <div>
          <div className="font-xs font-bold text-muted-foreground uppercase mb-1">
            Resolution Source
          </div>
          <div className="ep-meta-value" style={{ fontSize: 12 }}>
            {MOCK_MARKET_RULES.source}
          </div>
        </div>
        <div>
          <div className="font-xs font-bold text-muted-foreground uppercase mb-1">
            Resolution Deadline
          </div>
          <div className="ep-meta-value">{formatMarketDate(MOCK_MARKET_RULES.deadline)}</div>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <div className="font-xs font-bold text-muted-foreground uppercase mb-1">Notes</div>
          <div className="font-sm font-semibold text-tab-text">{MOCK_MARKET_RULES.notes}</div>
        </div>
      </div>
    </div>
  )
}
