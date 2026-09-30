import type { RouteObject } from "react-router"

import { ROUTES } from "@/constants/routes"
import DisputePage from "@/pages/dispute/DisputePage"
import Event from "@/pages/event/Event"
import Home from "@/pages/Home"
import LeaderboardPage from "@/pages/leaderboard/LeaderboardPage"
import MarketPage from "@/pages/market/MarketPage"
import MarketsPage from "@/pages/market/MarketPage"
import NotificationsPage from "@/pages/notifications/NotificationsPage"
import PortfolioPage from "@/pages/portfolio/Portfolio"
import ProfilePage from "@/pages/profile/ProfilePage"
import RewardsPage from "@/pages/rewards/RewardsPage"
import SettingsPage from "@/pages/settings/SettingsPage"
import StaticPage from "@/pages/static/StaticPage"
import TermsPage from "@/pages/terms/TermsPage"

import { ProtectedRoute } from "./ProtectedRoute"

export const publicRoutes: RouteObject[] = [
  {
    path: ROUTES.HOME,
    element: <Home />,
  },
  {
    path: ROUTES.EVENT,
    element: <Event />,
  },
  {
    path: ROUTES.PORTFOLIO,
    element: <PortfolioPage />,
  },
  {
    path: ROUTES.Markets,
    element: <MarketPage />,
  },
  {
    path: ROUTES.PROFILE,
    element: <ProfilePage />,
  },
  {
    path: ROUTES.LEADERBOARD,
    element: <LeaderboardPage />,
  },
  {
    path: ROUTES.REWARDS,
    element: <RewardsPage />,
  },
  {
    path: ROUTES.TERMS,
    element: <TermsPage />,
  },
  {
    path: ROUTES.DISPUTE,
    element: <DisputePage />,
  },

  { path: ROUTES.MarketSearch, element: <MarketsPage /> },
  {
    path: ROUTES.MarketCategory,
    element: <MarketsPage />,
  },

  { path: "/page/:slug", element: <StaticPage /> },
  {
    path: ROUTES.SETTINGS,
    element: (
      <ProtectedRoute>
        <SettingsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.NOTIFICATIONS,
    element: (
      <ProtectedRoute>
        <NotificationsPage />
      </ProtectedRoute>
    ),
  },
]
