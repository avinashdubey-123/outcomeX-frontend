import { useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router"

import { LoginModal } from "@/components/auth/LoginModal"
import {
  selectCashAmount,
  selectIsAuthenticated,
  selectPortfolioAmount,
} from "@/features/auth/authSlice"
import { formatCash, formatPortfolio } from "@/libs/formatCurrency"

// ─── Mini Profit/Loss Bar Chart ───────────────────────────────────────────────
// const PnlChart = () => {
//   const canvasRef = useRef<HTMLCanvasElement>(null)

//   useEffect(() => {
//     const canvas = canvasRef.current
//     if (!canvas) return
//     const ctx = canvas.getContext("2d")
//     if (!ctx) return

//     const W = canvas.offsetWidth || 300
//     const H = canvas.offsetHeight || 60
//     canvas.width = W
//     canvas.height = H

//     // mock bar data — all zero (no real positions)
//     const bars = Array.from({ length: 30 }, () => 0)

//     ctx.clearRect(0, 0, W, H)

//     const barW = W / bars.length - 1
//     bars.forEach((v, i) => {
//       const barH = Math.max(2, Math.abs(v) * H * 0.8)
//       const x = i * (barW + 1)
//       const y = v >= 0 ? H / 2 - barH : H / 2
//       ctx.fillStyle = v >= 0 ? "rgba(34,197,94,0.7)" : "rgba(239,68,68,0.7)"
//       ctx.beginPath()
//       ctx.roundRect(x, y, barW, barH, 2)
//       ctx.fill()
//     })

//     // center line
//     ctx.strokeStyle = "rgba(255,255,255,0.08)"
//     ctx.lineWidth = 1
//     ctx.beginPath()
//     ctx.moveTo(0, H / 2)
//     ctx.lineTo(W, H / 2)
//     ctx.stroke()
//   }, [])

//   return (
//     <canvas
//       ref={canvasRef}
//       className="w-full h-full"
//       style={{ width: "100%", height: "100%" }}
//     />
//   )
// }

// ─── Tab button ───────────────────────────────────────────────────────────────
const Tab = ({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={`text-sm font-semibold pb-2 border-b-2 transition-colors whitespace-nowrap ${
      active ? "border-white text-white" : "border-transparent text-white/40 hover:text-white/70"
    }`}
  >
    {label}
  </button>
)

// ─── Sort icon ────────────────────────────────────────────────────────────────
const SortIcon = () => (
  <img src="/icons/sort.svg" alt="" className="inline ml-1 opacity-40 w-[10px] h-[10px]" />
)

// ─── Time range button ────────────────────────────────────────────────────────
const TimeBtn = ({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
      active ? "bg-primary text-background" : "text-white/40 hover:text-white"
    }`}
  >
    {label}
  </button>
)

// ─── Portfolio Page ───────────────────────────────────────────────────────────
const PortfolioPage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const portfolioAmount = useSelector(selectPortfolioAmount)
  const cashAmount = useSelector(selectCashAmount)
  const navigate = useNavigate()

  const [loginOpen, setLoginOpen] = useState(() => localStorage.getItem("isSignedIn") !== "true")
  const [tab, setTab] = useState<"positions" | "orders" | "history">("positions")
  const [timeRange, setTimeRange] = useState("1D")
  const [search, setSearch] = useState("")
  const [hideBalance, setHideBalance] = useState(false)

  const handleLoginClose = () => {
    setLoginOpen(false)
    navigate(-1)
  }

  return (
    <>
      <LoginModal
        open={loginOpen}
        onClose={isAuthenticated ? () => setLoginOpen(false) : handleLoginClose}
      />

      <div className=" bg-background text-white">
        <div className="container py-6">
          {/* ── Top cards row ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            {/* Portfolio + Cash card */}
            <div className="bg-[#111720] border border-white/8 rounded-xl p-4 w-full h-fit">
              {/* Header row */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-white/80">Portfolio</span>
                <button
                  onClick={() => setHideBalance((p) => !p)}
                  className="text-white/30 hover:text-white/60 transition-colors"
                  title={hideBalance ? "Show balance" : "Hide balance"}
                >
                  {hideBalance ? (
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Portfolio value */}
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-xl font-bold text-white">
                  {hideBalance ? "••••" : formatPortfolio(portfolioAmount)}
                </span>
              </div>
              <div className="text-[10px] text-white/30 mb-3">$0.00 (0%) past day</div>

              {/* Available to trade */}
              <div className="flex items-center justify-between mb-3 px-2.5 py-1.5 bg-white/4 rounded-lg">
                <span className="text-[10px] text-white/50 font-medium uppercase tracking-wider">
                  Available to trade
                </span>
                <span className="text-xs font-bold text-white">
                  {hideBalance ? "••••" : formatCash(cashAmount)}
                </span>
              </div>

              {/* Deposit / Withdraw */}
              <div className="flex gap-2 mb-0 pb-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-background font-bold rounded-lg py-1.5 text-xs hover:bg-primary/90 transition-colors">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M12 2v16M5 15l7 7 7-7" />
                  </svg>
                  Deposit
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 border border-white/15 text-white/70 font-bold rounded-lg py-1.5 text-xs hover:bg-white/5 transition-colors">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M12 22V6M5 9l7-7 7 7" />
                  </svg>
                  Withdraw
                </button>
              </div>
            </div>

            {/* P&L card */}
            <div className="bg-[#111720] border border-white/8 rounded-xl p-4 w-full h-fit flex flex-col ">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-xs font-semibold text-primary">Profit/Loss</span>
                </div>
                <div className="flex items-center gap-0.5">
                  {["1D", "1W", "1M", "ALL"].map((t) => (
                    <TimeBtn
                      key={t}
                      label={t}
                      active={timeRange === t}
                      onClick={() => setTimeRange(t)}
                    />
                  ))}
                </div>
              </div>

              {/* P&L value */}
              <div className="text-xl font-bold text-white mb-0.5">$0.00</div>
              <div className="text-[10px] text-white/30 mb-21">Post Day</div>

              {/* Chart */}
              {/* <div className="flex-1 h-fit">
                <PnlChart />
              </div> */}
            </div>
          </div>

          {/* ── Tab bar ────────────────────────────────────────────────── */}
          <div className="bg-[#111720] border border-white/8 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-6 px-6 pt-5 pb-0 border-b border-white/8">
              <Tab
                label="Positions"
                active={tab === "positions"}
                onClick={() => setTab("positions")}
              />
              <Tab label="Open orders" active={tab === "orders"} onClick={() => setTab("orders")} />
              <Tab label="History" active={tab === "history"} onClick={() => setTab("history")} />
            </div>

            {/* Search + filter row */}
            <div className="flex items-center justify-between px-6 py-4 gap-3">
              <div className="relative flex-1 max-w-md">
                <img
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-[14px] h-[14px]"
                  src="/icons/search.svg"
                  alt=""
                />
                <input
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              {tab === "positions" && (
                <button className="flex items-center gap-1.5 text-xs text-white/50 font-semibold border border-white/10 rounded-lg px-3 py-2 hover:bg-white/5 transition-colors whitespace-nowrap">
                  <img src="/icons/list.svg" alt="" className="w-3 h-3" />
                  Current value
                </button>
              )}
            </div>

            {/* Table header */}
            {tab === "positions" && (
              <div className="px-6 pb-2">
                <div className="grid grid-cols-5 text-[10px] font-bold text-white/30 uppercase tracking-widest pb-2 border-b border-white/6">
                  <span>
                    Market <SortIcon />
                  </span>
                  <span className="text-right">
                    Avg → Now <SortIcon />
                  </span>
                  <span className="text-right">
                    Traded <SortIcon />
                  </span>
                  <span className="text-right">
                    To Win <SortIcon />
                  </span>
                  <span className="text-right">
                    Value <SortIcon />
                  </span>
                </div>

                {/* Empty state */}
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/4 flex items-center justify-center mb-4">
                    <img
                      src="/icons/monitor-empty.svg"
                      alt=""
                      className="w-[22px] h-[22px] opacity-20"
                    />
                  </div>
                  <p className="text-sm text-white/30 font-medium">No positions found.</p>
                  <p className="text-xs text-white/15 mt-1">
                    Your active market positions will appear here.
                  </p>
                </div>
              </div>
            )}

            {tab === "orders" && (
              <div className="px-6 pb-16">
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/4 flex items-center justify-center mb-4">
                    <img
                      src="/icons/clipboard-empty.svg"
                      alt=""
                      className="w-[22px] h-[22px] opacity-20"
                    />
                  </div>
                  <p className="text-sm text-white/30 font-medium">No open orders.</p>
                  <p className="text-xs text-white/15 mt-1">
                    Limit orders you place will appear here.
                  </p>
                </div>
              </div>
            )}

            {tab === "history" && (
              <div className="px-6 pb-6">
                {/* History column headers */}
                <div className="grid grid-cols-4 text-[10px] font-bold text-white/30 uppercase tracking-widest pb-2 border-b border-white/6 mb-2">
                  <span>Market</span>
                  <span className="text-right">Side</span>
                  <span className="text-right">Amount</span>
                  <span className="text-right">Date</span>
                </div>

                {/* Empty state */}
                <div className="py-14 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/4 flex items-center justify-center mb-4">
                    <img
                      src="/icons/history-empty.svg"
                      alt=""
                      className="w-[22px] h-[22px] opacity-20"
                    />
                  </div>
                  <p className="text-sm text-white/30 font-medium">No trade history.</p>
                  <p className="text-xs text-white/15 mt-1">
                    Past trades and settlements will appear here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default PortfolioPage
