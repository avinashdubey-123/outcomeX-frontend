// src/pages/profile/ProfilePage.tsx
// TODO: replace MOCK_PROFILE / MOCK_PROFILE_STATS with useGetProfileQuery()

import {
  Award,
  Calendar,
  Copy,
  Diamond,
  Flame,
  Heart,
  Landmark,
  Mail,
  // Settings,
  Share2,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react"
import { useSelector } from "react-redux"

// import { useNavigate } from "react-router"
import {
  //  selectIsAuthenticated,
  selectUserData,
} from "@/features/auth/authSlice"
import { formatMarketDate } from "@/libs/formatDate"
import type { Badge } from "@/mocks/mockPages"
import { MOCK_PROFILE, MOCK_PROFILE_STATS } from "@/mocks/mockPages"

// ── Constants ─────────────────────────────────────────────────────────────────
const C = {
  bg: "#0d0f13",
  surface: "#111418", // Darker card background
  border: "rgba(255,255,255,0.08)",
  green: "#10d260", // Brand primary green
  red: "#ea3943",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.45)",
  muted2: "rgba(255,255,255,0.25)",
} as const

// ── Emoji Mapping ─────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  "🏆": Trophy,
  "💚": Heart,
  "🔥": Flame,
  "🎯": Target,
  "💎": Diamond,
  "⚡": Zap,
  "🏅": Award,
}

const EmojiIcon = ({
  emoji,
  size = 16,
  color,
}: {
  emoji: string
  size?: number
  color?: string
}) => {
  const Icon = ICON_MAP[emoji]
  if (!Icon) return null

  const iconProps = {
    size,
    className: `transition-colors ${color ? "" : "text-primary group-hover:text-white"} ${emoji === "💚" ? "fill-current" : ""}`,
    style: color ? { color } : undefined,
  }

  return <Icon {...iconProps} />
}

// ── Avatar initials ───────────────────────────────────────────────────────────
const BigAvatar = ({ name }: { name: string }) => {
  const initials = name.slice(0, 2).toUpperCase()
  return (
    <div className="w-20 h-20 rounded-full md:w-30 md:h-30 lg:w-40 lg:h-40 md:rounded-lg bg-primary/10 flex items-center justify-center  text-3xl md:text-5xl lg:text-6xl border border-white/5 font-extrabold text-white  shrink-0 ">
      {initials}
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  sub,
  green,
  trend,
}: {
  label: string
  value: string
  sub: string
  green?: boolean
  trend?: string
  accentColor?: string
}) => (
  <div className="bg-white/5  py-4 px-5 flex rounded-lg flex-col gap-1 justify-center min-h-24 border border-white/10 hover:translate-y-[-4px] hover:border-primary transition-all duration-200 ease-in-out cursor-pointer">
    <span className="font-base font-bold text-white/45 uppercase tracking-widest">{label}</span>
    <span
      className="font-lg font-black tracking-tight my-1 "
      style={{
        color: green ? C.green : C.text,
      }}
    >
      {value}
    </span>
    <div className="flex items-center gap-1.5 mt-1">
      {trend === "up" && <TrendingUp size={12} className="text-primary" />}
      {trend === "realized" && <Landmark size={12} className="text-primary" />}
      <span
        className="font-xs font-medium "
        style={{
          color: trend ? C.green : "#ffffff70",
          textTransform: trend ? "none" : "uppercase",
          letterSpacing: trend ? "0" : "0.05em",
        }}
      >
        {sub}
      </span>
    </div>
  </div>
)

// ── Badge chip ────────────────────────────────────────────────────────────────
const BadgeChip = ({ icon, label, color }: { icon: string; label: string; color: string }) => (
  <div className="group transition-all hover:bg-white/5 flex items-center gap-2.5 py-2.5 px-4 rounded-md bg-primary/5 border border-primary/10 font-base font-bold text-white cursor-pointer w-fit">
    <EmojiIcon emoji={icon} size={18} color={color.includes("0.15") ? undefined : color} />
    {label}
  </div>
)

const AccuracySection = ({ winRate, trades }: { winRate: number; trades: number }) => (
  <div className="bg-white/5 border border-white/10 rounded-lg py-4 px-6 flex-2">
    <div className="flex justify-between flex-col md:flex-row items-start md:items-center gap-4 mb-8">
      <div>
        <h2 className="text-xl font-bold mb-1.5">Trading Accuracy</h2>
        <p className="text-sm text-white/60 max-w-[320px]">
          Statistical success rate across all {trades} executed predictions
        </p>
      </div>
      <div className="font-xl font-black text-primary tracking-tighter shrink-0">{winRate}%</div>
    </div>

    <div className="relative h-4 bg-white/5 rounded-full overflow-hidden mb-10 w-full flex-1">
      <div
        className="h-full bg-primary transition-all duration-75 ease  shadow-[0_0_20px_#10D26044]"
        style={{
          width: `${winRate}%`,
        }}
      />
    </div>

    <div className="grid grid-cols-2 gap-20">
      <div className="flex flex-col gap-1">
        <span className="font-xs font-bold text-white/60 uppercase tracking-widest">
          Correct Predictions
        </span>
        <span className="font-sm font-bold">118 Positions</span>
      </div>
      <div className="flex flex-col gap-1 text-right">
        <span className="font-xs font-bold text-white/60 uppercase tracking-widest">Losses</span>
        <span className="font-sm font-bold">69 Positions</span>
      </div>
    </div>
  </div>
)

const BadgesSection = ({ badges }: { badges: Badge[] }) => (
  <div className="bg-white/5 border border-white/10 rounded-lg py-4 px-6 flex-1 lg:min-w-[380px] min-w-0">
    <div className="flex justify-between items-center mb-6">
      <h2 className="font-sm font-bold uppercase tracking-[0.2em]  shrink-0">Badges Earned</h2>
    </div>

    <div className="flex flex-wrap gap-3">
      {badges.map((b) => (
        <BadgeChip key={b.id} icon={b.icon} label={b.label} color={b.color} />
      ))}
    </div>
  </div>
)

interface ProfileStat {
  label: string
  value: string
  sub: string
  green?: boolean
  trend?: string
  accentColor?: string
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const ProfilePage = () => {
  // TODO: const { data: profile } = useGetProfileQuery()
  const profile = MOCK_PROFILE
  const stats = MOCK_PROFILE_STATS
  const { email } = useSelector(selectUserData)
  // const isAuthenticated = useSelector(selectIsAuthenticated)
  // const navigate = useNavigate()

  const shortAddr = profile.address.slice(0, 6) + "..." + profile.address.slice(-4)

  return (
    <div className="container font-inter">
      <div className=" mt-4 md:mt-6 mb-12 md:mb-18.5">
        {/* ── Header card ── */}
        <div className="flex  flex-wrap justify-start items-center gap-3 sm:gap-10 mb-14">
          <BigAvatar name={profile.displayName} />

          <div className="mt-2">
            <div className=" flex flex-wrap gap-3 mb-4 ">
              <h1 className="font-2xl font-black  tracking-tight">{profile.displayName} </h1>
              <div className="block lg:hidden bg-primary/10 border border-primary/70 rounded-md h-fit mt-1 w-fit py-0.5 px-3  ">
                <span className="font-base text-primary uppercase font-bold">Global Rank</span>
                <span className="font-base text-primary font-bold"> #{profile.rank}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex items-center gap-2.5 text-white/60 font-medium font-sm cursor-pointer hover:text-white/80 transition-colors">
                  <Copy size={16} /> {shortAddr}
                </div>
                <div className="flex items-center gap-2.5 text-white/60 font-medium font-sm ">
                  <Calendar size={14} /> Member since {formatMarketDate(profile.joinedAt)}
                </div>
              </div>

              {email && (
                <div className="flex items-center gap-3 text-white/60 font-medium text-sm">
                  <Mail size={16} /> {email}
                </div>
              )}

              {/* Share + Settings buttons */}
              <div className="flex items-center gap-2 mt-1">
                <button className="flex items-center gap-2.5 text-black py-2 px-5 bg-primary border border-white/10 rounded-sm font-bold font-sm hover:bg-primary/60 w-fit transition-all">
                  <Share2 size={15} className="text-black [&_svg]:[stroke:2.5px]" /> Share Profile
                </button>

                {/* {isAuthenticated && (
                  <button
                    onClick={() => navigate(ROUTES.SETTINGS)}
                    className="flex items-center gap-2 py-2 px-4 bg-white/5 border border-white/10 rounded-sm font-bold font-sm text-white/70 hover:text-white hover:bg-white/10 w-fit transition-all"
                  >
                    <Settings size={15} />
                    Settings
                  </button>
                )} */}
              </div>
            </div>
          </div>

          <div className="hidden lg:flex bg-primary/10 border border-primary/20 rounded-lg py-4 px-6 items-center gap-7 justify-between lg:ml-auto max-h-21 ">
            <div className="flex flex-col gap-1">
              <span className="font-base text-primary uppercase font-bold">Global Rank</span>
              <span className="font-xl text-primary font-black">#{profile.rank}</span>
            </div>
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.slice(0, 4).map((s: ProfileStat) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              sub={s.sub}
              green={s.green}
              trend={s.trend}
              accentColor={s.accentColor}
            />
          ))}
        </div>

        {/* ── Middle Row: Accuracy & Badges ── */}
        <div className="flex flex-wrap flex-col lg:flex-row gap-5">
          <AccuracySection winRate={profile.winRate} trades={profile.totalTrades} />
          <BadgesSection badges={profile.badges} />
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
