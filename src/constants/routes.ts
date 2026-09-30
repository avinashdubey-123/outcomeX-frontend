export const ROUTES = {
  HOME: "/",
  EVENT: "/event/:id",
  PORTFOLIO: "/portfolio",
  Markets: "/markets/:group",
  MarketCategory: "/markets/category/:category",
  MarketSearch: "/markets/search",
  PROFILE: "/profile/:id",
  REWARDS: "/rewards/:id",
  LEADERBOARD: "/leaderboard/:id",
  TERMS: "/terms",
  STATIC_PAGE: "/page/:slug",
  DISPUTE: "/dispute/:id",
  SETTINGS: "/settings",
  NOTIFICATIONS: "/notifications",
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]
