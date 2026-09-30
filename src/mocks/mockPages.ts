// src/mocks/mockPages.ts
// Mock data for Profile, Rewards, Leaderboard
// TODO: replace each section with its API query when backend is ready

// ─── PROFILE ─────────────────────────────────────────────────────────────────

export interface UserProfile {
  address: string
  displayName: string
  email?: string
  joinedAt: string // ISO
  totalVolume: number
  totalTrades: number
  winRate: number // 0–100
  profitLoss: number
  rank: number
  badges: Badge[]
}

export interface Badge {
  id: string
  icon: string
  label: string
  color: string
}

export const MOCK_PROFILE: UserProfile = {
  address: "0xc634CfDD9bc3C89e3A888F3476816D1a3EdA6C62",
  displayName: "CryptoOracle",
  email: "user@example.com",
  joinedAt: "2024-01-15T00:00:00.000Z",
  totalVolume: 42850,
  totalTrades: 187,
  winRate: 63.4,
  profitLoss: 8240,
  rank: 142,
  badges: [
    { id: "b1", icon: "🔥", label: "Hot Streak", color: "rgba(251,146,60,0.15)" },
    { id: "b2", icon: "🎯", label: "Sharpshooter", color: "rgba(0,200,83,0.15)" },
    { id: "b3", icon: "💎", label: "Diamond Hands", color: "rgba(99,179,237,0.15)" },
    { id: "b4", icon: "⚡", label: "Speed Trader", color: "rgba(139,92,246,0.15)" },
    { id: "b5", icon: "🏆", label: "Top 200", color: "rgba(251,191,36,0.15)" },
  ],
}

export const MOCK_PROFILE_STATS = [
  {
    label: "Total Volume",
    value: "$42,850",
    sub: "+12% this month",
    trend: "up",
    accentColor: "var(--color-primary)",
  },
  {
    label: "Total Trades",
    value: "187",
    sub: "HIGH ACTIVITY",
    accentColor: "rgba(255,255,255,0.2)",
  },
  {
    label: "Win Rate",
    value: "63.4%",
    sub: "ELITE TIER",
    accentColor: "var(--color-primary)",
    green: false,
  },
  {
    label: "P/L",
    value: "+$8,240",
    sub: "Realized Profit",
    trend: "realized",
    accentColor: "var(--color-primary)",
    green: true,
  },
  {
    label: "Member Since",
    value: "Jan 2024",
    sub: "EARLY ADOPTER",
    accentColor: "rgba(255,255,255,0.2)",
  },
]

// ─── REWARDS ─────────────────────────────────────────────────────────────────

export interface RewardItem {
  id: string
  title: string
  description: string
  reward: string
  icon: string
  progress: number // 0–100
  target: string
  completed: boolean
  category: "trading" | "accuracy" | "social" | "milestone"
}

export const MOCK_REWARDS: RewardItem[] = [
  {
    id: "r1",
    icon: "target",
    category: "accuracy",
    title: "Prediction Master",
    description: "Win 10 trades in a row",
    reward: "+500 XP",
    progress: 70,
    target: "7/10 wins",
    completed: false,
  },
  {
    id: "r2",
    icon: "dollar",
    category: "trading",
    title: "High Roller",
    description: "Trade over $10,000 in a single month",
    reward: "+1,000 XP",
    progress: 100,
    target: "Completed!",
    completed: true,
  },
  {
    id: "r3",
    icon: "flame",
    category: "trading",
    title: "On Fire",
    description: "Place 50 trades total",
    reward: "+300 XP",
    progress: 100,
    target: "Completed!",
    completed: true,
  },
  {
    id: "r4",
    icon: "chart",
    category: "accuracy",
    title: "Market Analyst",
    description: "Achieve 70% win rate over 30 trades",
    reward: "+750 XP",
    progress: 45,
    target: "63.4% / 70%",
    completed: false,
  },
  {
    id: "r5",
    icon: "award",
    category: "milestone",
    title: "Top 100",
    description: "Reach top 100 on the leaderboard",
    reward: "+2,000 XP",
    progress: 30,
    target: "Rank 142 / 100",
    completed: false,
  },
  {
    id: "r6",
    icon: "zap",
    category: "trading",
    title: "Speed Demon",
    description: "Place 5 trades in a single day",
    reward: "+200 XP",
    progress: 100,
    target: "Completed!",
    completed: true,
  },
]

export const MOCK_REWARDS_SUMMARY = {
  totalXp: 3200,
  level: 12,
  nextLevelXp: 4000,
  currentXp: 3200,
  completed: 3,
  total: 6,
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number
  address: string
  displayName: string
  volume: number
  profitLoss: number
  winRate: number
  trades: number
  isCurrentUser?: boolean
}

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    address: "0xAB12...9F01",
    displayName: "WhaleHunter",
    volume: 284500,
    profitLoss: 92400,
    winRate: 71.2,
    trades: 412,
  },
  {
    rank: 2,
    address: "0xCD34...2E45",
    displayName: "PredictorX",
    volume: 241200,
    profitLoss: 78100,
    winRate: 68.9,
    trades: 389,
  },
  {
    rank: 3,
    address: "0xEF56...7A89",
    displayName: "MarketGod",
    volume: 198700,
    profitLoss: 61300,
    winRate: 66.4,
    trades: 341,
  },
  {
    rank: 4,
    address: "0x1234...BCDE",
    displayName: "OraclePrime",
    volume: 176300,
    profitLoss: 54800,
    winRate: 65.1,
    trades: 298,
  },
  {
    rank: 5,
    address: "0x5678...F012",
    displayName: "SatoshiSeer",
    volume: 154900,
    profitLoss: 48200,
    winRate: 63.8,
    trades: 276,
  },
  {
    rank: 6,
    address: "0x9ABC...3456",
    displayName: "AlphaTrader",
    volume: 143200,
    profitLoss: 44100,
    winRate: 62.5,
    trades: 254,
  },
  {
    rank: 7,
    address: "0xDEF0...7890",
    displayName: "NeuralBet",
    volume: 128700,
    profitLoss: 39600,
    winRate: 61.2,
    trades: 231,
  },
  {
    rank: 8,
    address: "0x2345...ABCD",
    displayName: "BlockSage",
    volume: 117400,
    profitLoss: 35900,
    winRate: 60.8,
    trades: 219,
  },
  {
    rank: 9,
    address: "0x6789...EF01",
    displayName: "ChainOracle",
    volume: 108900,
    profitLoss: 32400,
    winRate: 59.7,
    trades: 204,
  },
  {
    rank: 10,
    address: "0xABCD...2345",
    displayName: "FutureReader",
    volume: 98600,
    profitLoss: 29100,
    winRate: 58.4,
    trades: 187,
  },
  {
    rank: 11,
    address: "0xEF01...6789",
    displayName: "VelocityPunk",
    volume: 89200,
    profitLoss: 26400,
    winRate: 57.9,
    trades: 174,
  },
  {
    rank: 142,
    address: "0xc634...6C62",
    displayName: "CryptoOracle",
    volume: 42850,
    profitLoss: 8240,
    winRate: 63.4,
    trades: 187,
    isCurrentUser: true,
  },
]

export const MOCK_BIGGEST_WINS = [
  {
    rank: 1,
    displayName: "lfc123",
    subtitle: "PFK Ludogorets 1945...",
    initial: 197340,
    profit: 225158,
  },
  {
    rank: 2,
    displayName: "gmanas",
    subtitle: "Vastrom Catamounts vs...",
    initial: 87770,
    profit: 198909,
  },
  {
    rank: 3,
    displayName: "swisstony",
    subtitle: "Lille OSC vs FK Crvena...",
    initial: 209157,
    profit: 300566,
  },
  {
    rank: 4,
    displayName: "norrisfan",
    subtitle: "Lille OSC vs FK Crvena...",
    initial: 39275,
    profit: 109937,
  },
  {
    rank: 5,
    displayName: "c4c4",
    subtitle: "Rockets vs. Hornets.",
    initial: 121969,
    profit: 188483,
  },
]
