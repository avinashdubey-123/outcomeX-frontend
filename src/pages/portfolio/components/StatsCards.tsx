// src/pages/portfolio/components/StatsCards.tsx

import { Activity, Award, DollarSign, TrendingUp } from "lucide-react"

import { formatCash } from "@/libs/formatCurrency"

import { PORTFOLIO_COLORS } from "../portfolioConstants"

interface StatCardProps {
  label: string
  value: string
  subValue?: string
  subColor?: string
  icon: React.ReactNode
  iconBg: string
  cardBg?: string
}

const StatCard = ({ label, value, subValue, subColor, icon, iconBg, cardBg }: StatCardProps) => (
  <div
    className="flex-1 border border-white/10 rounded-2xl py-5 px-6 flex flex-col gap-3"
    style={{ background: cardBg }}
  >
    {/* label + icon row */}
    <div className="flex items-center justify-between">
      <span className="font-sm text-white/40 ">{label}</span>
      <div
        className="w-9 h-9 rounded-2md flex items-center justify-center font-default shrink-0"
        style={{
          background: iconBg,
        }}
      >
        {icon}
      </div>
    </div>

    {/* value */}
    <div className="flex flex-col gap-1">
      <div className="font-lg font-bold text-white leading-tight">{value}</div>
      {subValue && (
        <div
          className="font-sm font-medium"
          style={{
            color: subColor ?? PORTFOLIO_COLORS.TEXT_MUTED,
          }}
        >
          {subValue}
        </div>
      )}
    </div>
  </div>
)

interface StatsCardsProps {
  totalValue: number
  available: number
  pastMonthPnl: number
  pastMonthPct: number
  activePositions: number
  potentialValue: number
  onDeposit: () => void
  onWithdraw: () => void
}

export const StatsCards = ({
  totalValue,
  available,
  pastMonthPnl,
  pastMonthPct,
  activePositions,
  potentialValue,
}: StatsCardsProps) => {
  const pnlPositive = pastMonthPnl >= 0

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
      <StatCard
        label="Total Value"
        value={formatCash(totalValue)}
        icon={<DollarSign size={16} color="#2D7FF9" />}
        iconBg="#2D7FF933"
        cardBg="linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)"
      />
      <StatCard
        label="Available"
        value={formatCash(available)}
        icon={<Activity size={16} color="#7B61FF" />}
        iconBg="#7B61FF33"
        cardBg="linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)"
      />
      <StatCard
        label="Past Month P/L"
        value={`${pnlPositive ? "+" : ""}${formatCash(pastMonthPnl)}`}
        subValue={`${pnlPositive ? "+" : ""}${pastMonthPct.toFixed(2)}%`}
        subColor={pnlPositive ? "#18C964" : PORTFOLIO_COLORS.RED}
        icon={<TrendingUp size={16} color={pnlPositive ? "#18C964" : "#e53935"} />}
        iconBg={pnlPositive ? "#18C96433" : "rgba(229, 57, 53, 0.15)"}
        cardBg={
          pnlPositive
            ? "linear-gradient(135deg, rgba(24, 201, 100, 0.1) 0%, rgba(24, 201, 100, 0.05) 100%)"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)"
        }
      />
      <StatCard
        label="Active Positions"
        value={String(activePositions)}
        subValue={`${formatCash(potentialValue)} potential`}
        subColor={PORTFOLIO_COLORS.TEXT_MUTED}
        icon={<Award size={16} color="#2D7FF9" />}
        iconBg="#2D7FF933"
        cardBg="linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)"
      />
    </div>
  )
}
