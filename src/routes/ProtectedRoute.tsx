import { useSelector } from "react-redux"
import { Navigate } from "react-router"

import { selectIsAuthChecking, selectIsAuthenticated } from "@/features/auth/authSlice"

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  /** Rendered while the initial auth check runs. Defaults to nothing. */
  fallback?: React.ReactNode
}

// Renders children only when authenticated.
// While the initial auth check is still running it renders nothing to avoid
// a flash-redirect for users who are actually logged in but whose session
// hasn't been restored yet.
export const ProtectedRoute = ({
  children,
  redirectTo = "/",
  fallback = null,
}: ProtectedRouteProps) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isAuthChecking = useSelector(selectIsAuthChecking)

  if (isAuthChecking) return <>{fallback}</>

  if (!isAuthenticated) return <Navigate to={redirectTo} replace />

  return <>{children}</>
}
