// src/pages/leaderboard/LeaderboardPage.tsx
// TODO: replace mock data with useGetLeaderboardQuery() when API ready

import { BadgeCheck, ChevronDown, Clock } from "lucide-react"
import { useState } from "react"

import { useDropdown } from "@/hooks/ui/useDropdown"
import { type LeaderboardEntry, MOCK_BIGGEST_WINS, MOCK_LEADERBOARD } from "@/mocks/mockPages"

// ── Constants ─────────────────────────────────────────────────────────────────
const C = {
  bg: "#0d0f13",
  surface: "#161a22",
  border: "rgba(255,255,255,0.07)",
  green: "#00c853",
  red: "#e53935",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.45)",
  muted2: "rgba(255,255,255,0.25)",
  gold: "#fbbf24",
  silver: "#94a3b8",
  bronze: "#cd7c54",
} as const

const TIME_FILTERS = ["All Time", "This Month", "This Week"] as const
type TimeFilter = (typeof TIME_FILTERS)[number]

const CATEGORIES = ["Categories", "Crypto", "Politics"] as const
type Category = (typeof CATEGORIES)[number]

// ── Rank medal ────────────────────────────────────────────────────────────────
const RankDisplay = ({ rank }: { rank: number }) => {
  const medals: Record<number, { color: string; icon: string }> = {
    1: { color: C.gold, icon: "🥇" },
    2: { color: C.silver, icon: "🥈" },
    3: { color: C.bronze, icon: "🥉" },
  }
  const medal = medals[rank]

  if (medal) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="font-lg ">{medal.icon}</span>
        <span className="font-sm font-extrabold" style={{ color: medal.color }}>
          #{rank}
        </span>
      </div>
    )
  }

  return <span className="font-sm  text-white">#{rank}</span>
}

function getAvatarColor(author: string): string {
  const colors = [
    "linear-gradient(135deg,#6366f1,#8b5cf6)",
    "linear-gradient(135deg,#ec4899,#f43f5e)",
    "linear-gradient(135deg,#14b8a6,#06b6d4)",
    "linear-gradient(135deg,#f59e0b,#ef4444)",
    "linear-gradient(135deg,#22c55e,#16a34a)",
    "linear-gradient(135deg,#3b82f6,#6366f1)",
  ]
  let hash = 0
  for (const c of author) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff
  return colors[hash % colors.length] as string
}
// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({
  name,
  size = 32,
  square = false,
  isCurrentUser = false,
}: {
  name: string
  size?: number
  square?: boolean
  isCurrentUser?: boolean
}) => (
  <div
    className={`flex items-center justify-center font-extrabold shrink-0 ${
      square ? "rounded-[12px]" : "rounded-full"
    } ${isCurrentUser ? "bg-primary/10 text-primary" : "text-white"}`}
    style={{
      width: size,
      height: size,
      fontSize: size * 0.35,
      background: isCurrentUser ? undefined : getAvatarColor(name),
    }}
  >
    {name.slice(0, 2).toUpperCase()}
  </div>
)

// ── Top 3 podium ──────────────────────────────────────────────────────────────
const PodiumCard = ({ entry }: { entry: LeaderboardEntry }) => {
  const rank = entry.rank

  return (
    <div
      className="flex flex-col bg-linear-to-b from-white/5 to-white/2 border border-white/10 rounded-lg pt-7.5 pb-5 px-4 relative items-center transition-all duration-200 hover:border-primary cursor-pointer flex-1 min-w-[250px] "
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)"
      }}
    >
      {/* large background rank */}
      <div className="absolute top-2 right-3 text-[30px] md:text-[45px] lg:text-[55px] font-black text-white/10 hover:text-primary pointer-events-none select-none">
        #{rank}
      </div>

      {/* avatar container */}
      <div className="relative mb-3 w-fit mx-auto">
        <div className="w-14 h-14 rounded-lg border-2 border-primary overflow-hidden flex items-center justify-center">
          <Avatar name={entry.displayName} size={56} square isCurrentUser={entry.isCurrentUser} />
        </div>
        {/* rank bubble */}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center font-xs font-black text-white border-2 border-black">
          {rank}
        </div>
      </div>

      {/* user info */}
      <div className="text-center mb-4 w-full">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <span className="font-default font-semibold text-white truncate whitespace-nowrap">
            {entry.displayName}
          </span>
          <BadgeCheck size={13} className="text-market-blue  shrink-0" />
        </div>
        <div className="font-base text-tabs truncate whitespace-nowrap">{entry.address}</div>
      </div>

      {/* stats divider */}
      {/* <div
        style={{
          width: "100%",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
          marginBottom: 20,
        }}
      /> */}

      {/* stats grid */}
      <div className="flex w-full justify-between gap-2">
        <div className="flex-1 text-center">
          <div className="font-xs font-bold text-[#64748B] uppercase tracking-[0.15em] ">
            Profit
          </div>
          <div className="font-sm font-bold text-primary tracking-tight">
            +${(entry.profitLoss / 1000).toFixed(1)}k
          </div>
        </div>

        <div className="w-px h-8 bg-white/7 self-start" />

        <div className="flex-1 text-center">
          <div className="font-xs font-bold text-[#64748B] uppercase tracking-[0.15em] ">
            Volume
          </div>
          <div className="font-sm font-bold text-white tracking-tight">
            ${(entry.volume / 1000).toFixed(1)}k
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Table row ─────────────────────────────────────────────────────────────────
const LeaderRow = ({ entry }: { entry: LeaderboardEntry }) => (
  <div
    className={`grid grid-cols-[repeat(6,1fr)] gap-2 py-3.5 px-6 items-center relative transition-all duration-150 ${
      !entry.isCurrentUser ? "border-t border-white/10" : ""
    }`}
    style={{
      background: entry.isCurrentUser ? "rgba(0,200,83,0.05)" : "transparent",
      border: entry.isCurrentUser ? "1px solid rgba(0,200,83,0.2)" : undefined,
      borderRadius: entry.isCurrentUser ? 15 : 0,
    }}
    onMouseEnter={(e) => {
      if (!entry.isCurrentUser) e.currentTarget.style.background = "rgba(255,255,255,0.02)"
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = entry.isCurrentUser ? "rgba(0,200,83,0.05)" : "transparent"
    }}
  >
    {entry.isCurrentUser && (
      <div
        className="absolute left-0 top-1/2  bg-primary/50 rounded-r-sm"
        style={{
          transform: "translateY(-50%)",
          width: 3,
          height: "60%",
        }}
      />
    )}

    {/* rank */}
    <RankDisplay rank={entry.rank} />

    {/* user */}
    <div className="flex items-center gap-3 min-w-0">
      <Avatar name={entry.displayName} isCurrentUser={entry.isCurrentUser} />
      <div style={{ minWidth: 0 }}>
        <div
          className="font-sm max-xl:truncate whitespace-nowrap"
          style={{
            fontWeight: entry.isCurrentUser ? 800 : 600,
            color: entry.isCurrentUser ? C.green : C.text,
          }}
        >
          {entry.displayName}
          {entry.isCurrentUser && (
            <span className="ml-1.5 font-base font-semibold bg-primary/15 text-white py-0.5 px-1.5 rounded-sm  ">
              You
            </span>
          )}
        </div>
        <div className="font-base  text-white/30 font-mono">{entry.address}</div>
      </div>
    </div>

    {/* volume */}
    <div className="font-sm text-white text-right">${(entry.volume / 1000).toFixed(1)}k</div>

    {/* p/l */}
    <div
      className="font-sm font-bold text-right"
      style={{
        color: entry.profitLoss >= 0 ? C.green : C.red,
      }}
    >
      {entry.profitLoss >= 0 ? "+" : ""}${(entry.profitLoss / 1000).toFixed(1)}k
    </div>

    {/* win rate */}
    <div className="font-sm text-white/60 text-right">{entry.winRate}%</div>

    {/* trades */}
    <div className="font-sm text-white/60 text-right">{entry.trades}</div>
  </div>
)

// ── Biggest Wins Panel ────────────────────────────────────────────────────────
const fmt = (n: number) => `$${n.toLocaleString("en-US")}`

const BiggestWinItem = ({
  entry,
}: {
  entry: { rank: number; displayName: string; subtitle: string; initial: number; profit: number }
}) => (
  <div className="flex flex-col gap-4 p-4 rounded-lg transition-all duration-200 cursor-pointer relative group bg-linear-to-b from-white/5 to-white/2 border border-white/10 hover:border-primary/30 hover:bg-primary/15">
    {/* Top Row: Avatar, Info, Rank */}
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div className="relative">
        <Avatar name={entry.displayName} size={40} />
        <div className="absolute inset-0 rounded-full border border-white/10" />
      </div>

      {/* User info */}
      <div className="flex-1 min-w-0 pr-8">
        <div className="font-sm bold text-white truncate mb-0.5 mt-0.5">{entry.displayName}</div>
        <div className="truncate text-tabs font-xs">{entry.subtitle}</div>
      </div>

      {/* Rank badge - Squircle */}
      <div className="shrink-0 flex items-center justify-center font-black absolute top-5 right-4 w-7  rounded-sm bg-white/5 py-0.5 px-1.5 text-white font-xs">
        #{entry.rank}
      </div>
    </div>

    {/* Bottom: Profit value transition */}
    <div className="flex items-center gap-2">
      <span className="font-sm tracking-widest text-tabs truncate font-mono">
        {fmt(entry.initial)}
      </span>
      <span className="font-sm text-tabs">→</span>
      <span className="font-sm font-bold text-primary truncate">{fmt(entry.profit)}</span>
    </div>
  </div>
)

const BiggestWinsPanel = () => (
  <div className="w-full lg:w-[300px] xl:w-[340px] shrink-0 sticky top-6">
    <div>
      {/* Panel header */}
      <div className="mb-4 max-lg:mt-4">
        <h2 className="font-md text-white tracking-tight">Biggest Wins This Month</h2>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-2">
        {MOCK_BIGGEST_WINS.map((entry) => (
          <BiggestWinItem key={entry.rank} entry={entry} />
        ))}
      </div>
    </div>
  </div>
)

// ── Main Page ─────────────────────────────────────────────────────────────────
const LeaderboardPage = () => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All Time")
  const [category, setCategory] = useState<Category>("Categories")
  const { isOpen, toggle, ref, close } = useDropdown("leaderboard-category")

  // TODO: const { data: entries = [] } = useGetLeaderboardQuery({ period: timeFilter })
  const entries = MOCK_LEADERBOARD
  const top3 = entries.filter((e) => e.rank <= 3).sort((a, b) => a.rank - b.rank)
  const rest = entries.filter((e) => e.rank > 3)

  return (
    <div className="text-white">
      <div className="container mt-4 md:mt-6 mb-12 md:mb-18.5">
        {/* header */}
        <div className="flex justify-between items-end flex-wrap mb-8 gap-5">
          <div>
            <div className="font-sm  text-white/80 mb-2 ">Leaderboard</div>
            <h1 className="font-xxl font-black mb-2.5 text-white ">Global Leaderboard</h1>
            <div className="flex items-center gap-1.5 text-white font-sm  ">
              <Clock size={14} strokeWidth={2.5} />
              <span>Last update 10min ago</span>
            </div>
          </div>

          {/* filters */}
          <div className="flex items-center  gap-3.5">
            {/* category dropdown */}
            <div className="relative" ref={ref}>
              <div
                onClick={toggle}
                className="flex items-center gap-3 p-2.5 pr-1.5 bg-white/5 border border-white/10 rounded-2md text-white/90 font-base font-medium justify-between cursor-pointer min-w-42 "
              >
                <span>{category}</span>
                <ChevronDown
                  size={14}
                  strokeWidth={2.5}
                  className={`opacity-50 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              </div>

              {isOpen && (
                <div
                  className="absolute top-full left-0 right-0 mt-1.5 py-1 z-50 rounded-lg border border-white/10 shadow-2xl overflow-hidden"
                  style={{ background: "#12161d" }}
                >
                  {CATEGORIES.map((cat) => {
                    const isActive = category === cat
                    return (
                      <div
                        key={cat}
                        onClick={() => {
                          setCategory(cat)
                          close()
                        }}
                        className={`px-3 py-2.5 text-white font-base font-medium cursor-pointer transition-colors duration-150
                          ${isActive ? "bg-primary text-black" : "hover:bg-primary hover:text-black"}
                        `}
                      >
                        {cat}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* separator */}
            <div className="w-px h-6.5 bg-white/10" />

            {/* time filter */}
            <div className="flex gap-1 bg-white/5 border border-white/10 rounded-2md p-1">
              {TIME_FILTERS.map((f) => {
                const isActive = timeFilter === f
                return (
                  <button
                    key={f}
                    onClick={() => setTimeFilter(f)}
                    className="py-2 px-4 rounded-md font-base font-medium cursor-pointer transition-all duration-200 whitespace-nowrap "
                    style={{
                      background: isActive ? C.green : "transparent",
                      color: isActive ? "#000" : "#ffffff99",
                      boxShadow: isActive ? `0 4px 20px ${C.green}44` : "none",
                    }}
                  >
                    {f === "All Time"
                      ? "ALL"
                      : f === "This Month"
                        ? "1M"
                        : f === "This Week"
                          ? "1W"
                          : f}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* your rank banner hidden */}

        <div className="flex gap-5 items-start flex-wrap lg:flex-nowrap">
          {/* ── LEFT: existing leaderboard ── */}
          <div className="flex-1 min-w-0">
            {/* podium top 3 */}
            <div className="flex flex-wrap  items-stretch justify-center gap-4 mb-4">
              {top3.slice(0, 3).map((entry) => (
                <PodiumCard key={entry.rank} entry={entry} />
              ))}
            </div>

            {/* main table */}
            <div className="bg-linear-to-b from-white/5 to-white/2 border border-white/10 rounded-2xl overflow-x-auto no-scrollbar ">
              <div className="min-w-[680px]">
                {/* column headers */}
                <div className="grid grid-cols-[repeat(6,1fr)] gap-2 py-4 px-6 pt-8  ">
                  {["Rank", "Trader", "Volume", "P/L", "Win Rate", "Trades"].map((h, i) => (
                    <div
                      key={h}
                      className="text-white/60 font-base font-medium uppercase tracking-wide "
                      style={{
                        textAlign: i > 1 ? "right" : ("left" as React.CSSProperties["textAlign"]),
                      }}
                    >
                      {h}
                    </div>
                  ))}
                </div>

                {/* rows */}
                {rest.map((entry) => (
                  <LeaderRow key={entry.rank} entry={entry} />
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: biggest wins panel ── */}
          <BiggestWinsPanel />
        </div>
      </div>
    </div>
  )
}

export default LeaderboardPage
