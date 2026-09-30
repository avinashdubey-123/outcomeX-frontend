import { lazy } from "react"
import { createBrowserRouter } from "react-router"

import { PublicLayout } from "@/layouts/PublicLayout"

import { publicRoutes } from "./public"
import { withSuspense } from "./utils"

// Lazy-loaded common components
const NotFound = lazy(() => import("@/pages/NotFound").then((m) => ({ default: m.NotFound })))

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: publicRoutes,
  },
  {
    path: "*",
    element: withSuspense(<NotFound />),
  },
])
