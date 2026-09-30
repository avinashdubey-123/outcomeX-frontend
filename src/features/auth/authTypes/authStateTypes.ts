import type { LoginMethod } from "./loginMethodsTypes"

export interface AuthState {
  isAuthenticated: boolean
  email: string | null
  publicAddress: string | null // for wallet later
  loading: true | false
  portfolioAmount?: string
  cashAmount?: string
  reservedAmount: string // micro-USDC integer as string (e.g. "12345678" = 12.345678 USDC)
  availableAmount: string // cashAmount - reservedAmount, always derived
  loginMethod: LoginMethod
  token: string | null
  cashLoading: boolean
  isAuthChecking: boolean
  deviceToken: string | null
  walletRefreshTrigger: boolean
}
