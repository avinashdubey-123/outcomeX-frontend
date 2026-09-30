// src/pages/portfolio/components/tabs/PositionsTab.tsx

import { useState } from "react"
import { useSelector } from "react-redux"

import {
  type ApiPortfolioPosition,
  useGetPortfolioPositionsQuery,
} from "@/features/api/portfolio/portfolioApi"
import { selectIsAuthChecking } from "@/features/auth/authSlice"
import { useRedeem } from "@/hooks/useRedeem"
import { ADDRESSES } from "@/libs/contracts"
import { type Position } from "@/mocks/mockPortfolio"

import { PORTFOLIO_COLORS, POSITION_SIDE } from "../../portfolioConstants"
import { Pagination } from "./OrdersAndHistoryTabs"

// ── Constants ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10

// ── Column layout ─────────────────────────────────────────────────────────────
const COL = "1fr 80px 80px 80px 80px 110px 150px"

// ── Map API portfolio position → Position ─────────────────────────────────────
const mapApiPosition = (p: ApiPortfolioPosition): Position => {
  const side = (p.token?.name ?? "").toLowerCase() === "yes" ? POSITION_SIDE.YES : POSITION_SIDE.NO
  const shares = Number(p.sharesOwned ?? 0) / 1000000
  const avgPrice = Number(p.avgPrice ?? 0) / 1000000
  const invested = Number(p.totalInvested ?? 0) / 10000000000 //dividing by 10^8 because
  const value = Number(p.currentValue ?? 0) / 10000000000
  const marketId = p.market?.id ?? `unknown-market-${Math.random()}`
  const tokenId = p.token?.id ?? `unknown-token-${Math.random()}`
  const isRedeemedTrue = Number(p.redeemAmount) > 0
  return {
    id: `${marketId}-${tokenId}`,
    marketId: p.market?.id ?? "",
    marketTitle: p.market?.title ?? "Unknown Market",
    category: "",
    side,
    shares,
    avgPrice,
    nowPrice: avgPrice,
    invested,
    value,
    conditionId:
      p.market.conditionId ?? "0x0000000000000000000000000000000000000000000000000000000000000000",
    TokenId:
      p.token.tokenId ?? "0x0000000000000000000000000000000000000000000000000000000000000000",

    collateralToken: ADDRESSES.USDC,
    isResolved: p.resolved ?? false,
    winningOutcome: (() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const outcome = p.winningOutcome ?? (p.market as any)?.winningOutcome
      if (outcome != null) {
        const str = String(outcome).toUpperCase()
        if (str === "1" || str === "YES") return "YES"
        if (str === "0" || str === "NO") return "NO"
      }
      return null
    })(),
    isRedeemed: isRedeemedTrue,
  }
}
// console.log(mapApiPositio)
// ── Helpers ───────────────────────────────────────────────────────────────────
const canRedeem = (pos: Position): boolean =>
  pos.isResolved && pos.winningOutcome === pos.side && !pos.isRedeemed

const isLost = (pos: Position): boolean =>
  pos.isResolved && pos.winningOutcome !== null && pos.winningOutcome !== pos.side

// ── Sub-components ────────────────────────────────────────────────────────────
const ColHeader = ({ children, align = "left" }: { children: React.ReactNode; align?: string }) => (
  <div
    className="font-base font-medium uppercase text-white/60 tracking-widest "
    style={{
      textAlign: align as React.CSSProperties["textAlign"],
    }}
  >
    {children}
  </div>
)

const CategoryTag = ({ label, highlight }: { label: string; highlight?: boolean }) => (
  <span
    className="font-xs font-semibold py-0.5 px-2 rounded-2sm "
    style={{
      background: highlight ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.06)",
      color: highlight ? "#f87171" : PORTFOLIO_COLORS.TEXT_MUTED,
      border: highlight ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(255,255,255,0.06)",
    }}
  >
    {label}
  </span>
)

const SidePill = ({ side }: { side: string }) => (
  <span
    className="font-base font-semibold py-1 px-2.5 rounded-full "
    style={{
      background: side === POSITION_SIDE.YES ? "rgba(0,200,83,0.15)" : "rgba(229,57,53,0.15)",
      color: side === POSITION_SIDE.YES ? PORTFOLIO_COLORS.GREEN : PORTFOLIO_COLORS.RED,
    }}
  >
    {side}
  </span>
)

// ── Redeem button variants ────────────────────────────────────────────────────
const RedeemButton = ({
  position,
  onRedeem,
  isLoading,
}: {
  position: Position
  onRedeem: (p: Position) => void
  isLoading: boolean
}) => {
  if (position.isRedeemed) {
    return (
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          padding: "5px 10px",
          borderRadius: 8,
          background: "rgba(255,255,255,0.05)",
          color: PORTFOLIO_COLORS.TEXT_MUTED_2,
        }}
      >
        ✓ Redeemed
      </span>
    )
  }

  if (isLost(position)) {
    return (
      <span
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: PORTFOLIO_COLORS.TEXT_MUTED_2,
          fontStyle: "italic",
        }}
      >
        No winnings
      </span>
    )
  }

  if (canRedeem(position)) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRedeem(position)
        }}
        disabled={isLoading}
        style={{
          padding: "6px 14px",
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 700,
          background: isLoading ? "rgba(0,200,83,0.1)" : PORTFOLIO_COLORS.GREEN,
          color: isLoading ? PORTFOLIO_COLORS.GREEN : "#000",
          border: isLoading ? `1px solid rgba(0,200,83,0.3)` : "none",
          cursor: isLoading ? "not-allowed" : "pointer",
          transition: "all 0.15s",
          display: "flex",
          alignItems: "center",
          gap: 6,
          opacity: isLoading ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isLoading) e.currentTarget.style.opacity = "0.85"
        }}
        onMouseLeave={(e) => {
          if (!isLoading) e.currentTarget.style.opacity = "1"
        }}
      >
        {isLoading && (
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              border: "2px solid rgba(0,200,83,0.3)",
              borderTopColor: PORTFOLIO_COLORS.GREEN,
              animation: "spin 0.7s linear infinite",
              display: "inline-block",
            }}
          />
        )}
        {isLoading ? "Redeeming…" : "Redeem"}
      </button>
    )
  }

  return null
}

// ── PnL display ───────────────────────────────────────────────────────────────
const PnlDisplay = ({ position }: { position: Position }) => {
  const pnl = position.value - position.invested
  const pct = position.invested > 0 ? (pnl / position.invested) * 100 : 0
  const positive = pnl >= 0

  return (
    <div className="text-right">
      <div className="font-sm font-semibold text-white">
        {position.isResolved && isLost(position) ? (
          <span className="text-white/40">$0.00</span>
        ) : (
          `$${position.value.toFixed(2)}`
        )}
      </div>
      <div
        className="flex items-center justify-end gap-0.5 font-base flex-nowrap font-medium"
        style={{
          color: positive ? PORTFOLIO_COLORS.GREEN : PORTFOLIO_COLORS.RED,
        }}
      >
        <span>{positive ? "↗" : "↘"}</span>
        <span className="text-nowrap">
          {positive ? "+" : ""}${Math.abs(pnl).toFixed(2)} ({positive ? "+" : ""}
          {pct.toFixed(1)}%)
        </span>
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
const shimmer: React.CSSProperties = {
  background:
    "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)",
  backgroundSize: "200% 100%",
  animation: "pos-shimmer 1.6s ease-in-out infinite",
  borderRadius: 6,
}

const PositionsSkeleton = () => (
  <>
    <style>{`@keyframes pos-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        style={{
          display: "grid",
          gridTemplateColumns: COL,
          gap: 8,
          padding: "16px",
          borderBottom: `1px solid ${PORTFOLIO_COLORS.CARD_BORDER}`,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ ...shimmer, height: 14, width: "65%" }} />
          <div style={{ ...shimmer, height: 10, width: "25%" }} />
        </div>
        {[50, 60, 55, 60, 50, 70].map((w, j) => (
          <div key={j} style={{ ...shimmer, height: 12, width: `${w}%`, marginLeft: "auto" }} />
        ))}
      </div>
    ))}
  </>
)

// ── Position row ──────────────────────────────────────────────────────────────
const PositionRow = ({
  position,
  onRedeem,
  redeemingId,
  isRedeeming,
}: {
  position: Position
  onRedeem: (p: Position) => void
  redeemingId: string | null
  isRedeeming: boolean
}) => {
  const thisIsRedeeming = redeemingId === position.id && isRedeeming

  return (
    <div
      className="grid grid-cols-[repeat(7,1fr)] gap-2 py-4 px-6 bordeer-b border-b-white/10  items-center transition-all cursor-pointer"
      style={{
        background: canRedeem(position) ? "rgba(0,200,83,0.03)" : "transparent",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = canRedeem(position)
          ? "rgba(0,200,83,0.06)"
          : "rgba(255,255,255,0.02)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = canRedeem(position)
          ? "rgba(0,200,83,0.03)"
          : "transparent")
      }
    >
      {/* market title + tags */}
      <div style={{ minWidth: 0 }}>
        <div
          className="font-default font-medium capitalize text-white mb-1.5  truncate whitespace-nowrap"
          // style={{
          //   fontSize: 14,
          //   fontWeight: 600,
          //   color: PORTFOLIO_COLORS.TEXT_PRIMARY,
          //   marginBottom: 6,
          //   overflow: "hidden",
          //   textOverflow: "ellipsis",
          //   whiteSpace: "nowrap",
          // }}
        >
          {position.marketTitle}
        </div>
        <div className="flex gap-1 flex-wrap items-center">
          {position.category && <CategoryTag label={position.category} />}
          {position.tags?.map((tag) => (
            <CategoryTag key={tag} label={tag} highlight />
          ))}
          {position.isResolved && (
            <span
              className="font-base align-center text-nowrap font-medium py-0.5 px-1.5 rounded-full"
              style={{
                background: canRedeem(position)
                  ? "rgba(0,200,83,0.12)"
                  : isLost(position)
                    ? "rgba(229,57,53,0.10)"
                    : "rgba(255,255,255,0.06)",
                color: canRedeem(position)
                  ? PORTFOLIO_COLORS.GREEN
                  : isLost(position)
                    ? PORTFOLIO_COLORS.RED
                    : PORTFOLIO_COLORS.TEXT_MUTED_2,
              }}
            >
              {position.isRedeemed
                ? "Resolved"
                : canRedeem(position)
                  ? `Resolved · ${position.winningOutcome} won ✓`
                  : `Resolved · ${position.winningOutcome} won`}
            </span>
          )}
        </div>
      </div>

      {/* side */}
      <div className="flex justify-center">
        <SidePill side={position.side} />
      </div>

      {/* shares */}
      <div className="font-sm font-medium text-center text-white">
        {position.shares.toLocaleString()}
      </div>

      {/* avg price */}
      <div className="font-sm text-white/80 text-center">{position.avgPrice.toFixed(2)}¢</div>

      {/* now price */}
      <div className="font-sm text-white/80 text-center">
        {position.isResolved ? (
          <span style={{ color: PORTFOLIO_COLORS.TEXT_MUTED_2 }}>Resolved</span>
        ) : (
          `${position.nowPrice.toFixed(2)}¢`
        )}
      </div>

      {/* invested */}
      <div className="font-sm text-white text-center">${position.invested.toFixed(2)}</div>

      {/* value + redeem */}
      <div className="flex flex-col items-end gap-1.5">
        <PnlDisplay position={position} />
        <RedeemButton position={position} onRedeem={onRedeem} isLoading={thisIsRedeeming} />
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ label }: { label: string }) => (
  <div className="py-6 px-5 text-center text-white/60 font-sm font-medium">{label}</div>
)

// ── PositionsTab ──────────────────────────────────────────────────────────────
interface PositionsTabProps {
  search: string
}

export const PositionsTab = ({ search }: PositionsTabProps) => {
  const [page, setPage] = useState(1)
  const skip = (page - 1) * PAGE_SIZE

  // Wait for auth check to finish before firing — prevents the query from
  // running with no token on page load, which would cache an empty/401 response
  // and leave positions blank until the user switches tabs and back.
  const isAuthChecking = useSelector(selectIsAuthChecking)

  const { data, isLoading: queryLoading } = useGetPortfolioPositionsQuery(
    { limit: PAGE_SIZE, skip },
    { skip: isAuthChecking },
  )

  const isLoading = isAuthChecking || queryLoading

  const apiPositions = (data?.data.data ?? []).map(mapApiPosition)
  const totalApiCount = data?.data.count ?? 0
  const totalPages = Math.max(Math.ceil(totalApiCount / PAGE_SIZE), 1)

  const combined = [...apiPositions].filter((p) =>
    (p.marketTitle ?? "").toLowerCase().includes(search.toLowerCase()),
  )

  const { redeem, redeemingId, isRedeeming, redeemedIds } = useRedeem()

  // Overlay optimistic redeemed state from in-session hook tracking
  const positionsWithRedeemed = combined.map((p) => ({
    ...p,
    isRedeemed: p.isRedeemed || redeemedIds.has(p.id),
  }))

  if (isLoading) return <PositionsSkeleton />

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pos-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      {/* column headers */}
      <div className="grid grid-cols-[repeat(7,1fr)] gap-4 py-4 px-6 border-b border-b-white/10 items-center ">
        <ColHeader>Market</ColHeader>
        <ColHeader align="center">Side</ColHeader>
        <ColHeader align="center">Shares</ColHeader>
        <ColHeader align="center">Avg</ColHeader>
        <ColHeader align="center">Now</ColHeader>
        <ColHeader align="center">Invested</ColHeader>
        <ColHeader align="right">Value</ColHeader>
      </div>

      {positionsWithRedeemed.length === 0 ? (
        <EmptyState label="No positions found." />
      ) : (
        positionsWithRedeemed.map((pos) => (
          <PositionRow
            key={pos.id}
            position={pos}
            onRedeem={redeem}
            redeemingId={redeemingId}
            isRedeeming={isRedeeming}
          />
        ))
      )}

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </>
  )
}
