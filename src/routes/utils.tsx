import { type ReactNode, Suspense } from "react"

import { LoadingFallback } from "@/components/ui/LoadingFallback"

/**
 * Wraps a component with React Suspense and a loading fallback.
 * Used for lazy-loaded routes to avoid boilerplate.
 */
export function withSuspense(element: ReactNode): ReactNode {
  return <Suspense fallback={<LoadingFallback />}>{element}</Suspense>
}

//metamask-sessions
const KEY = "metamask_logged_out"

export const setMetaMaskLoggedOut = () => localStorage.setItem(KEY, "true")
export const clearMetaMaskLoggedOut = () => localStorage.removeItem(KEY)
export const wasMetaMaskLoggedOut = () => localStorage.getItem(KEY) === "true"
