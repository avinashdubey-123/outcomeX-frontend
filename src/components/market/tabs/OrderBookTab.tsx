// src/components/market/tabs/OrderBookTab.tsx
// Polymarket-style order book:
//   - YES / NO toggle at top
//   - Single column: asks (dimmed) above spread, bids below
//   - Seeded from REST, patched in real-time via socket

import { useState } from "react"

import { type BookEntry, useOrderBook } from "@/hooks/socket/useOrderBook"

type TokenSide = "YES" | "NO"

// ── Props ─────────────────────────────────────────────────────────────────────
interface OrderBookTabProps {
  marketId: string
  optionGroupId: string
  yesTokenId: string
  noTokenId: string
}

// ── Sub-components ────────────────────────────────────────────────────────────

const getMaxShares = (rows: BookEntry[]) => rows.reduce((max, r) => Math.max(max, r.shares), 1)

const OBRow = ({
  row,
  maxShares,
  isBid,
}: {
  row: BookEntry
  maxShares: number
  isBid: boolean
}) => (
  <div
    className={`grid grid-cols-2 py-2.5 transition-colors hover:bg-white/2  px-6  relative overflow-hidden font-mono font-base ${
      isBid ? "opacity-100" : "opacity-80"
    }`}
  >
    {/* depth bar */}
    <div
      className={`absolute inset-0  pointer-events-none ${isBid ? "bg-option-yes" : "bg-option-no"}`}
      style={{
        width: `${(row.shares / maxShares) * 100}%`,
      }}
    />

    <span className={`font-bold relative z-1 ${isBid ? "text-yes" : "text-no"}`}>{row.price}¢</span>

    <span className="text-white/60 text-right relative z-1">{row.shares.toLocaleString()}</span>
  </div>
)

const SpreadLine = ({ spread }: { spread: number }) => (
  <div className="font-base text-center text-white/40 border-y capitalize border-y-white/5 py-1 my-0.5 last:rounded-b-md">
    spread {spread > 0 ? `${spread}¢` : "—"}
  </div>
)

const EmptyRows = ({ label }: { label: string }) => (
  <div className="font-base text-center text-white/40 py-3">{label}</div>
)

const SkeletonRows = () => (
  <div className="flex flex-col gap-1 py-2">
    {[80, 60, 40, 60, 80].map((w, i) => (
      <div
        key={i}
        className="h-3 bg-white/6 rounded-sm animate-pulse  ease-in-out my-0.5"
        style={{
          width: `${w}%`,
        }}
      />
    ))}
  </div>
)

// ── Main component ────────────────────────────────────────────────────────────
export const OrderBookTab = ({
  marketId: _,
  optionGroupId,
  yesTokenId,
  noTokenId,
}: OrderBookTabProps) => {
  const [activeSide, setActiveSide] = useState<TokenSide>("YES")

  const activeTokenId = activeSide === "YES" ? yesTokenId : noTokenId

  const { bids, asks, isLoading } = useOrderBook(
    optionGroupId,
    yesTokenId,
    noTokenId,
    activeTokenId,
  )

  const spread = asks[0] && bids[0] ? asks[0].price - bids[0].price : 0
  const maxShares = getMaxShares([...bids, ...asks])

  //  const openOrders = MOCK_ORDERS.filter(
  //    (o) => o.marketId === _ && (o.status === "pending" || o.status === "partially filled")
  //  )

  return (
    <div className="">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3.5">
        <span className="font-base font-bold text-white uppercase tracking-wider">Order Book</span>
        <span className="font-base text-muted-foreground">PRICE · SHARES</span>
      </div>

      {/* ── YES / NO token toggle ── */}
      <div className="flex gap-1 mb-4 bg-white/4 rounded-2sm p-1 w-fit ">
        {(["YES", "NO"] as TokenSide[]).map((side) => (
          <button
            key={side}
            onClick={() => setActiveSide(side)}
            className="py-1.5 px-5 rounded-md font-base font-bold cursor-pointer transition-all duration-100 ease-in-out "
            style={{
              background:
                activeSide === side ? (side === "YES" ? "#00c853" : "#e53935") : "transparent",
              color: activeSide === side ? "#000" : "white",
            }}
          >
            {side}
          </button>
        ))}
      </div>

      <div className="border border-white/10 rounded-md overflow-hidden">
        {/* ── Column headers ── */}
        <div className="grid grid-cols-2 mb-1 font-base text-white/60 font-medium uppercase tracking-widest border-b border-white/6 py-4 px-6 pt-8 ">
          <span>Price</span>
          <span className="text-right">Shares</span>
        </div>

        {/* ── Order rows ── */}
        {isLoading ? (
          <SkeletonRows />
        ) : (
          <>
            {/* asks — people SELLING (dimmed, shown above spread) */}
            {asks.length === 0 ? (
              <EmptyRows label="No sell orders" />
            ) : (
              [...asks]
                .reverse()
                .map((row) => (
                  <OBRow key={`ask-${row.id}`} row={row} maxShares={maxShares} isBid={false} />
                ))
            )}

            <SpreadLine spread={spread} />

            {/* bids — people BUYING (green, shown below spread) */}
            {bids.length === 0 ? (
              <EmptyRows label="No buy orders" />
            ) : (
              bids.map((row) => (
                <OBRow key={`bid-${row.id}`} row={row} maxShares={maxShares} isBid={true} />
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}
