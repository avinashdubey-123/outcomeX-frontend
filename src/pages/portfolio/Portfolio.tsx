// src/pages/portfolio/PortfolioPage.tsx
// Main portfolio page — clean orchestration only, all UI in sub-components
import { Filter, MoreVertical, Search, X } from "lucide-react"
import { useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router"

import { LoginModal } from "@/components/auth/LoginModal"
import { MetaMaskDepositModal } from "@/components/deposit/MetaMaskDepositModal"
import { WithdrawModal } from "@/components/withdrawl/withdrawModal"
import {
  selectAvailableAmount,
  selectIsAuthenticated,
  selectLoginMethod,
} from "@/features/auth/authSlice"
import { LOGIN_METHODS } from "@/features/auth/authTypes/loginMethodsTypes"
import { useMagic } from "@/features/auth/lib/magic"
import { MOCK_PORTFOLIO_CHART, MOCK_PORTFOLIO_STATS } from "@/mocks/mockPortfolio"

import { PortfolioChart } from "./components/PortfolioChart"
import { StatsCards } from "./components/StatsCards"
import { HistoryTab, PortfolioOrdersTab } from "./components/tabs/OrdersAndHistoryTabs"
import { PositionsTab } from "./components/tabs/PositionsTab"
import { PORTFOLIO_COLORS, PORTFOLIO_TABS, type PortfolioTab } from "./portfolioConstants"

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS: { key: PortfolioTab; label: string }[] = [
  { key: PORTFOLIO_TABS.POSITIONS, label: "Positions" },
  { key: PORTFOLIO_TABS.ORDERS, label: "Orders" },
  { key: PORTFOLIO_TABS.HISTORY, label: "History" },
]

// ─── PortfolioPage ────────────────────────────────────────────────────────────
const PortfolioPage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const availableAmountRaw = useSelector(selectAvailableAmount)
  const loginMethod = useSelector(selectLoginMethod)
  const { magic } = useMagic()
  const navigate = useNavigate()

  const [loginOpen, setLoginOpen] = useState(() => localStorage.getItem("isSignedIn") !== "true")
  const [activeTab, setActiveTab] = useState<PortfolioTab>(PORTFOLIO_TABS.POSITIONS)
  const [search, setSearch] = useState("")
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [metamaskDepositOpen, setMetamaskDepositOpen] = useState(false)

  // micro-USDC (6 decimals string) → plain USDC number
  const availableBalance = Number(BigInt(availableAmountRaw ?? "0")) / 1_000_000

  const handleLoginClose = () => {
    setLoginOpen(false)
    if (!isAuthenticated) navigate(-1)
  }

  const handleDeposit = async () => {
    if (!isAuthenticated) {
      setLoginOpen(true)
      return
    }
    if (loginMethod === LOGIN_METHODS.MetaMask) {
      setMetamaskDepositOpen(true)
      return
    }
    await magic?.wallet.showUI()
  }

  // TODO: replace MOCK_PORTFOLIO_STATS with useGetPortfolioStatsQuery()
  const stats = MOCK_PORTFOLIO_STATS

  return (
    <>
      <MetaMaskDepositModal
        open={metamaskDepositOpen}
        onClose={() => setMetamaskDepositOpen(false)}
      />
      <LoginModal
        open={loginOpen}
        onClose={isAuthenticated ? () => setLoginOpen(false) : handleLoginClose}
      />
      <WithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        availableBalance={availableBalance}
      />

      <div
        className="container font-inter "
        style={{
          background: PORTFOLIO_COLORS.PAGE_BG,
          color: PORTFOLIO_COLORS.TEXT_PRIMARY,
        }}
      >
        <div
          className="mt-4 md:mt-6 mb-12 md:mb-18.5 "
          //  style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}
        >
          {/* ── Page header ── */}
          <div className="flex flex-col md:flex-row items-start gap-4 md:items-center justify-between mb-7">
            <div>
              <h1 className="font-xxl font-bold text-white">Portfolio</h1>
              <p className="font-default mt-1 text-white/60 ">
                Track your positions and performance
              </p>
            </div>

            {/* action buttons */}
            <div className="flex gap-2.5 items-center">
              <ActionBtn onClick={handleDeposit} icon={<IconDeposit />} label="Deposit" />
              <ActionBtn
                onClick={() => setWithdrawOpen(true)}
                icon={<IconWithdraw />}
                label="Withdraw"
              />
              <button className="w-9 h-9 border rounded-2md border-white/10 bg-white/5 font-sm font-medium text-white flex items-center justify-center cursor-pointer transition-all">
                <IconMore />
              </button>
            </div>
          </div>

          {/* ── Stats cards ── */}
          <div className="mb-6">
            <StatsCards
              totalValue={stats.totalValue}
              available={stats.available}
              pastMonthPnl={stats.pastMonthPnl}
              pastMonthPct={stats.pastMonthPct}
              activePositions={stats.activePositions}
              potentialValue={stats.potentialValue}
              onDeposit={handleDeposit}
              onWithdraw={() => setWithdrawOpen(true)}
            />
          </div>

          {/* ── Portfolio value chart ── */}
          <div className="mb-6">
            <PortfolioChart
              data={MOCK_PORTFOLIO_CHART}
              portfolioValue={stats.portfolioValue}
              delta={stats.portfolioDelta}
              deltaPct={stats.portfolioDeltaPct}
            />
          </div>

          {/* tab bar + search */}

          <div className="flex items-center justify-between  flex-wrap pb-4 pt-0 gap-4">
            {/* tabs */}
            <div className="flex gap-4 bg-white/5 border border-white/10 rounded-2md p-1 max-w-fit max-lg:overflow-x-auto max-lg:[scrollbar-width:none] max-lg:[-ms-overflow-style:none] max-lg:[&::-webkit-scrollbar]:hidden">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => {
                    setActiveTab(t.key)
                    setSearch("")
                  }}
                  className="py-1.5 px-4.5 rounded-sm font-sm  font-semibold transition-all cursor-pointer whitespace-nowrap"
                  style={{
                    background: activeTab === t.key ? PORTFOLIO_COLORS.GREEN : "transparent",
                    color: activeTab === t.key ? "#000" : PORTFOLIO_COLORS.TEXT_MUTED,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* filter + search */}
            <div className="flex gap-2.5 items-center">
              <button className="flex items-center gap-1.5 py-2.5 px-3.5  rounded-2md border border-white/10 bg-white/5 text-white font-base font-semibold cursor-pointer">
                <Filter className="text-white size-3.5" /> Filter
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search positions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2md py-2.5 pl-8.5 pr-8.5 text-sm leading-4 text-white focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all placeholder-[#6B7280] max-w-67.5 "
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ──  table ── */}
          <div className="bg-linear-to-b from-white/5 to-white/2 border border-white/10 rounded-2xl overflow-x-auto no-scrollbar ">
            {/* tab content */}
            <div className="min-w-[900px]">
              {activeTab === PORTFOLIO_TABS.POSITIONS && <PositionsTab search={search} />}
              {activeTab === PORTFOLIO_TABS.ORDERS && <PortfolioOrdersTab search={search} />}
              {activeTab === PORTFOLIO_TABS.HISTORY && <HistoryTab search={search} />}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PortfolioPage

// ── Action button ─────────────────────────────────────────────────────────────
const ActionBtn = ({
  onClick,
  icon,
  label,
  variant = "solid",
}: {
  onClick: () => void
  icon: React.ReactNode
  label: string
  variant?: "solid" | "outline"
}) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 py-1.5 px-4.5 rounded-2md font-sm font-medium border border-white/10 bg-white/5 text-white cursor-pointer transition-all "
    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
    onMouseLeave={(e) =>
      (e.currentTarget.style.background =
        variant === "solid" ? PORTFOLIO_COLORS.CARD_BG : "transparent")
    }
  >
    <span style={{ display: "flex", alignItems: "center" }}>{icon}</span> {label}
  </button>
)

// ── Icons ───────────────────────────────────────────────────────────────────
const IconDeposit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 17V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V17"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M12 3V15M12 15L8 11M12 15L16 11"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
)

const IconWithdraw = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 17V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V17"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M12 15V3M12 3L8 7M12 3L16 7"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
)

const IconMore = () => <MoreVertical size={18} className="text-white" />
