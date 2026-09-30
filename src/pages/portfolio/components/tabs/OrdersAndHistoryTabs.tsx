// src/pages/portfolio/components/tabs/OrdersAndHistoryTabs.tsx

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { useGetOrdersQuery } from "@/features/api/orders/orderApi"
import { useCancelOrderMutation } from "@/features/api/orders/orderApi"
import {
  mapApiOrderToHistoryItem,
  mapApiOrderToPortfolioOrder,
  ORDER_STATUS_PARAM,
} from "@/features/api/orders/orderApiTypes"
import { formatMarketDate } from "@/libs/formatDate"
import { type HistoryItem, type PortfolioOrder } from "@/mocks/mockPortfolio"

import {
  HISTORY_TYPE,
  ORDER_STATUS,
  PORTFOLIO_COLORS,
  POSITION_SIDE,
} from "../../portfolioConstants"

// ── Constants ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10

// ── Skeleton loader ───────────────────────────────────────────────────────────
const shimmer: React.CSSProperties = {
  background:
    "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)",
  backgroundSize: "200% 100%",
  animation: "ob-shimmer 1.6s ease-in-out infinite",
  borderRadius: 6,
}

const OrderRowSkeleton = () => (
  <div
    className="grid grid-cols-[repeat(8,1fr)] gap-2 p-4 border-b border-b-white/10 items-center"
    // style={{
    //   display: "grid",
    //   gridTemplateColumns: "1fr 80px 80px 80px 80px 80px 100px 110px",
    //   gap: 8,
    //   padding: "16px",
    //   borderBottom: `1px solid ${PORTFOLIO_COLORS.CARD_BORDER}`,
    //   alignItems: "center",
    // }}
  >
    <div className="flex flex-col gap-1.5 ">
      <div style={{ ...shimmer, height: 14, width: "70%" }} />
      <div style={{ ...shimmer, height: 10, width: "30%" }} />
    </div>
    {[60, 50, 40, 50, 40, 70, 60].map((w, i) => (
      <div key={i} style={{ ...shimmer, height: 12, width: `${w}%`, marginLeft: "auto" }} />
    ))}
  </div>
)

export const OrdersTabSkeleton = () => (
  <>
    <style>{`@keyframes ob-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    {Array.from({ length: 5 }).map((_, i) => (
      <OrderRowSkeleton key={i} />
    ))}
  </>
)

// ── Pagination ────────────────────────────────────────────────────────────────
export const Pagination = ({
  page,
  totalPages,
  onPage,
}: {
  page: number
  totalPages: number
  onPage: (p: number) => void
}) => {
  if (totalPages <= 1) return null

  const btnBase: React.CSSProperties = {
    padding: "5px 12px",
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 600,
    border: `1px solid ${PORTFOLIO_COLORS.CARD_BORDER}`,
    background: "#ffffff05",
    color: "#ffffff90",
    cursor: "pointer",
    transition: "all 0.15s",
  }
  const btnDisabled: React.CSSProperties = {
    ...btnBase,
    opacity: 0.35,
    cursor: "not-allowed",
  }
  const pageNumStyle = (active: boolean): React.CSSProperties => ({
    ...btnBase,
    background: active ? PORTFOLIO_COLORS.GREEN : "#ffffff05",
    color: active ? "#000" : "#ffffff90",
    borderColor: active ? PORTFOLIO_COLORS.GREEN : PORTFOLIO_COLORS.CARD_BORDER,
    fontWeight: active ? 700 : 600,
  })

  // show at most 5 page numbers centered around current
  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
  const end = Math.min(totalPages, start + 4)
  const pageNums = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <div className="flex items-center justify-start gap-1.5 p-4 border-t border-t-white/10">
      <button
        style={page === 1 ? btnDisabled : btnBase}
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
      >
        <div className="flex items-center gap-1">
          <ChevronLeft size={14} strokeWidth={2.5} />
          <span>Prev</span>
        </div>
      </button>

      {start > 1 && (
        <>
          <button style={pageNumStyle(false)} onClick={() => onPage(1)}>
            1
          </button>
          {start > 2 && (
            <span style={{ color: PORTFOLIO_COLORS.TEXT_MUTED_2, fontSize: 12 }}>…</span>
          )}
        </>
      )}

      {pageNums.map((n) => (
        <button key={n} style={pageNumStyle(n === page)} onClick={() => onPage(n)}>
          {n}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span style={{ color: PORTFOLIO_COLORS.TEXT_MUTED_2, fontSize: 12 }}>…</span>
          )}
          <button style={pageNumStyle(false)} onClick={() => onPage(totalPages)}>
            {totalPages}
          </button>
        </>
      )}

      <button
        style={page === totalPages ? btnDisabled : btnBase}
        disabled={page === totalPages}
        onClick={() => onPage(page + 1)}
      >
        <div className="flex items-center gap-1">
          <span>Next</span>
          <ChevronRight size={14} strokeWidth={2.5} />
        </div>
      </button>
    </div>
  )
}

// ── Shared components ─────────────────────────────────────────────────────────
const SidePill = ({ side }: { side: string }) => {
  const isYes = side.toUpperCase() === POSITION_SIDE.YES
  return (
    <span
      className="font-base font-semibold py-1 px-2.5 rounded-full"
      style={{
        background: isYes ? "#18C96433" : "#FF5A5F33",
        color: isYes ? "#18C964" : "#FF5A5F",
      }}
    >
      {side.toUpperCase()}
    </span>
  )
}

const DirectionPill = ({ direction }: { direction: "Buy" | "Sell" }) => (
  <span
    className="font-base font-semibold py-1 px-2.5 rounded-full"
    style={{
      background: direction === "Buy" ? "#18C96433" : "#FF5A5F33",
      color: direction === "Buy" ? "#18C964" : "#FF5A5F",
    }}
  >
    {direction}
  </span>
)

const CategoryTag = ({ label }: { label: string }) => (
  <span className="font-xs font-semibold py-0.5 px-2 rounded-2sm bg-white/6 text-white/4 border border-white/10 ">
    {label}
  </span>
)

const EmptyState = ({ label }: { label: string }) => (
  <div className="py-6 px-5 text-center text-white/60 font-sm font-medium">{label}</div>
)

const StatusBadge = ({ status }: { status: PortfolioOrder["status"] }) => {
  const map = {
    [ORDER_STATUS.PENDING]: { bg: "#7B61FF33", color: "#7B61FF", label: "Pending" },
    [ORDER_STATUS.PARTIAL]: { bg: "#F59E0B33", color: "#F59E0B", label: "Partial" },
    [ORDER_STATUS.FILLED]: { bg: "#18C96433", color: "#18C964", label: "Filled" },
    [ORDER_STATUS.CANCELLED]: {
      bg: "#FF5A5F33",
      color: "#FF5A5F",
      label: "Cancelled",
    },
  }
  const s = map[status]
  return (
    <span
      className="font-base font-semibold py-1 px-2.5 rounded-full"
      style={{
        background: s.bg,
        color: s.color,
      }}
    >
      {s.label}
    </span>
  )
}

// ── Cancel button with inline confirm ────────────────────────────────────────
const CancelButton = ({
  orderId,
  onCancelled,
}: {
  orderId: string
  onCancelled: (id: string) => void
}) => {
  const [confirm, setConfirm] = useState(false)
  const [cancelOrderApi, { isLoading }] = useCancelOrderMutation()

  const handleCancel = async () => {
    try {
      await cancelOrderApi(orderId).unwrap()
      onCancelled(orderId)
      toast.success("Order cancelled")
    } catch {
      toast.error("Failed to cancel order")
      setConfirm(false)
    }
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="py-2 px-4 flex items-center justify-center  rounded-sm font-base font-bold  cursor-pointer transition-all whitespace-nowrap border border-no/20 text-no  bg-option-no  hover:text-background "
        onMouseEnter={(e) => (e.currentTarget.style.background = "#e11d48")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#411c29")}
      >
        Cancel
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1 overflow-hidden">
      <span className="font-xs text-white/60 ">Sure?</span>
      <button
        onClick={handleCancel}
        disabled={isLoading}
        className="py-1 px-1.5 rounded-sm  justify-center font-base font-bold  border border-yes/20 text-primary hover:text-background bg-option-yes hover:bg-primary flex items-center gap-1"
        style={{
          cursor: isLoading ? "not-allowed" : "pointer",
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        {isLoading && (
          <span className="w-2 h-2 rounded-full border border-white/30 border-t-white inline-block animate-spin " />
        )}
        Yes
      </button>
      <button
        onClick={() => setConfirm(false)}
        className="py-1 px-1.5 rounded-sm font-base font-bold  border border-no/20 text-no  bg-option-no hover:bg-no hover:text-background cursor-pointer "
      >
        No
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS TAB  (PENDING + PARTIALLY_FILLED, paginated)
// ─────────────────────────────────────────────────────────────────────────────

interface OrdersTabProps {
  search: string
}

export const PortfolioOrdersTab = ({ search }: OrdersTabProps) => {
  const [page, setPage] = useState(1)
  const skip = (page - 1) * PAGE_SIZE

  const {
    data: pendingData,
    isLoading: pendingLoading,
    refetch: refetchPending,
  } = useGetOrdersQuery({
    status: ORDER_STATUS_PARAM.PENDING,
    limit: PAGE_SIZE,
    skip,
  })
  const {
    data: partialData,
    isLoading: partialLoading,
    refetch: refetchPartial,
  } = useGetOrdersQuery({
    status: ORDER_STATUS_PARAM.PARTIALLY_FILLED,
    limit: PAGE_SIZE,
    skip,
  })

  const isLoading = pendingLoading || partialLoading

  const handleCancelled = () => {
    refetchPending()
    refetchPartial()
  }

  const pendingOrders = pendingData?.data.data.map(mapApiOrderToPortfolioOrder) ?? []
  const partialOrders = partialData?.data.data.map(mapApiOrderToPortfolioOrder) ?? []

  const combined: PortfolioOrder[] = [...pendingOrders, ...partialOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .filter((o) => o.marketTitle.toLowerCase().includes(search.toLowerCase()))

  const pendingCount = pendingData?.data.count ?? 0
  const partialCount = partialData?.data.count ?? 0
  const totalPages = Math.max(
    Math.ceil(pendingCount / PAGE_SIZE),
    Math.ceil(partialCount / PAGE_SIZE),
    1,
  )

  if (isLoading) return <OrdersTabSkeleton />

  return (
    <>
      <style>{`
        @keyframes ob-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes ob-spin    { to { transform: rotate(360deg); } }
      `}</style>

      <div>
        {/* column headers */}
        <div className="grid grid-cols-[repeat(8,1fr)] gap-2 py-4 px-6 border-b border-b-white/10 ">
          {["Market", "Outcome", "Order", "Type", "Price", "Shares", "Status", "Action"].map(
            (h, i) => (
              <div
                key={h}
                className="font-base font-medium uppercase text-white/60 tracking-widest "
                style={{
                  textAlign: i === 0 ? "left" : i === 7 ? "right" : "center",
                }}
              >
                {h}
              </div>
            ),
          )}
        </div>

        {combined.length === 0 ? (
          <EmptyState label="No open orders." />
        ) : (
          combined.map((order) => (
            <OrderRow key={order.id} order={order} onCancelled={handleCancelled} />
          ))
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          onPage={(p) => {
            setPage(p)
          }}
        />
      </div>
    </>
  )
}

const OrderRow = ({
  order,
  onCancelled,
}: {
  order: PortfolioOrder
  onCancelled: (id: string) => void
}) => {
  const fillPct = order.shares > 0 ? Math.round((order.filled / order.shares) * 100) : 0
  const isCancellable =
    order.status === ORDER_STATUS.PENDING || order.status === ORDER_STATUS.PARTIAL

  return (
    <div
      className="grid grid-cols-[repeat(8,1fr)] gap-2 py-3.5 px-6 not-last:border-b border-b-white/10 items-center transition-all "
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* market */}
      <div style={{ minWidth: 0 }}>
        <div className="font-default capitalize font-medium text-white truncate">
          {order.marketTitle}
        </div>
        <div className="flex gap-1 items-center">
          {order.category && <CategoryTag label={order.category} />}
          {order.status === ORDER_STATUS.PARTIAL && (
            <span className="" style={{ fontSize: 10, color: PORTFOLIO_COLORS.TEXT_MUTED }}>
              {fillPct}% filled
            </span>
          )}
        </div>
      </div>

      {/* outcome (Yes / No) */}
      <div className="text-center">
        <SidePill side={order.token.title} />
      </div>

      {/* order direction (Buy / Sell) */}
      <div className="text-center">
        <DirectionPill direction={order.direction} />
      </div>

      {/* type (Limit / Market) */}
      <div className="font-sm text-white/80 text-center">{order.orderType}</div>

      {/* price */}
      <div className="font-sm font-medium text-white text-center">{order.price}¢</div>

      {/* shares */}
      <div className="font-sm font-medium text-white text-center">
        {order.shares.toLocaleString()}
      </div>

      {/* status */}
      <div className="text-center">
        <StatusBadge status={order.status} />
      </div>

      {/* action */}
      <div className="flex justify-end">
        {isCancellable ? (
          <CancelButton orderId={order.id} onCancelled={onCancelled} />
        ) : (
          <span style={{ fontSize: 11, color: PORTFOLIO_COLORS.TEXT_MUTED_2 }}>—</span>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HISTORY TAB  (FILLED + CANCELLED, paginated)
// ─────────────────────────────────────────────────────────────────────────────

//  [ORDER_STATUS.PENDING]: { bg: "#7B61FF33", color: "#7B61FF", label: "Pending" },
//     [ORDER_STATUS.PARTIAL]: { bg: "#F59E0B33", color: "#F59E0B", label: "Partial" },
//     [ORDER_STATUS.FILLED]: { bg: "#18C96433", color: "#18C964", label: "Filled" },
//     [ORDER_STATUS.CANCELLED]: {
//       bg: "#FF5A5F33",
//       color: "#FF5A5F",
//       label: "Cancelled",

const HistoryTypeBadge = ({ type }: { type: HistoryItem["type"] }) => {
  const map = {
    [HISTORY_TYPE.BUY]: { bg: "#18C96433", color: "#18C964", label: "Buy" },
    [HISTORY_TYPE.SELL]: { bg: "#FF5A5F33", color: "#FF5A5F", label: "Sell" },
    [HISTORY_TYPE.REDEEM]: { bg: "#F59E0B33", color: "#F59E0B", label: "Redeem" },
  }
  const s = map[type]
  return (
    <span
      className="font-base font-semibold py-1 px-2.5 rounded-full"
      style={{
        background: s.bg,
        color: s.color,
      }}
    >
      {s.label}
    </span>
  )
}

interface HistoryTabProps {
  search: string
}

export const HistoryTab = ({ search }: HistoryTabProps) => {
  const [page, setPage] = useState(1)
  const skip = (page - 1) * PAGE_SIZE

  const { data: filledData, isLoading: filledLoading } = useGetOrdersQuery({
    status: ORDER_STATUS_PARAM.FILLED,
    limit: PAGE_SIZE,
    skip,
  })
  const { data: cancelledData, isLoading: cancelledLoading } = useGetOrdersQuery({
    status: ORDER_STATUS_PARAM.CANCELLED,
    limit: PAGE_SIZE,
    skip,
  })

  const isLoading = filledLoading || cancelledLoading

  const filledItems = filledData?.data.data.map(mapApiOrderToHistoryItem) ?? []
  const cancelledItems = cancelledData?.data.data.map(mapApiOrderToHistoryItem) ?? []

  const combined: HistoryItem[] = [...filledItems, ...cancelledItems]
    .sort((a, b) => new Date(b.settledAt).getTime() - new Date(a.settledAt).getTime())
    .filter((h) => h.marketTitle.toLowerCase().includes(search.toLowerCase()))

  const filledCount = filledData?.data.count ?? 0
  const cancelledCount = cancelledData?.data.count ?? 0
  const totalPages = Math.max(
    Math.ceil(filledCount / PAGE_SIZE),
    Math.ceil(cancelledCount / PAGE_SIZE),
    1,
  )

  if (isLoading) return <OrdersTabSkeleton />

  return (
    <div>
      {/* column headers */}
      <div className="grid grid-cols-[repeat(7,1fr)] gap-2 py-4 px-6 border-b border-b-white/10 ">
        {["Market", "Type", "Outcome", "Order Type", "Shares", "Total", "Date"].map((h, i) => (
          <div
            key={h}
            className="font-base font-medium uppercase text-white/60 tracking-widest"
            style={{
              textAlign: i === 0 ? "left" : i === 6 ? "right" : "center",
            }}
          >
            {h}
          </div>
        ))}
      </div>

      {combined.length === 0 ? (
        <EmptyState label="No trade history." />
      ) : (
        combined.map((item) => <HistoryRow key={item.id} item={item} />)
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPage={(p) => {
          setPage(p)
        }}
      />
    </div>
  )
}

const HistoryRow = ({ item }: { item: HistoryItem }) => (
  <div
    className="grid grid-cols-[repeat(7,1fr)] gap-2 py-3.5 px-6 not-last:border-b border-b-white/10  items-center transition-all  "
    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
  >
    {/* market */}
    <div style={{ minWidth: 0 }}>
      <div className="font-default capitalize font-medium text-white truncate ">
        {item.marketTitle}
      </div>
      <div className="flex gap-1 items-center">
        {item.category && <CategoryTag label={item.category} />}
      </div>
    </div>

    {/* type (Buy / Sell / Redeem) */}
    <div className="flex justify-center">
      <HistoryTypeBadge type={item.type} />
    </div>

    {/* outcome (Yes / No) */}
    <div className="flex justify-center">
      <SidePill side={item.side} />
    </div>

    {/* order type (Limit / Market) */}
    <div className="font-sm text-white/80 text-center">{item.orderType}</div>

    {/* shares */}
    <div className="font-sm text-white/80 text-center">{item.shares.toLocaleString()}</div>

    {/* total */}
    <div className="font-sm font-medium text-white text-center">${item.total.toFixed(2)}</div>

    {/* date */}
    <div className="font-sm text-white/80 text-right">{formatMarketDate(item.settledAt)}</div>
  </div>
)
