import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { AuthState } from "./authTypes/authStateTypes"
import type { LoginMethod } from "./authTypes/loginMethodsTypes"

const initialState: AuthState = {
  isAuthenticated: false,
  isAuthChecking: true,
  email: null,
  publicAddress: null,
  loading: false,
  cashAmount: "0",
  reservedAmount: "0",
  availableAmount: "0",
  portfolioAmount: "0",
  loginMethod: null,
  token: null,
  cashLoading: false,
  deviceToken: null,
  walletRefreshTrigger: false,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(
      state,
      action: PayloadAction<{
        email: string | null
        publicAddress?: string | null
        loading: boolean
        isAuthenticated?: boolean
        loginMethod: LoginMethod
        token: string | null
      }>,
    ) {
      if (action.payload.isAuthenticated === false) {
        state.isAuthenticated = action.payload.isAuthenticated
      } else {
        state.isAuthenticated = true
      }
      state.email = action.payload.email
      state.publicAddress = action.payload.publicAddress ?? null
      state.loading = action.payload.loading
      state.loginMethod = action.payload.loginMethod ?? null
      state.token = action.payload.token
      state.isAuthChecking = false
    },

    logout(state) {
      state.isAuthenticated = false
      state.email = null
      state.publicAddress = null
      state.loading = false
      state.loginMethod = null
      state.token = null
      state.isAuthChecking = false
      state.deviceToken = null
    },

    loadingTrue(state) {
      state.isAuthChecking = true
      state.loading = true
    },

    loadingFalse(state) {
      state.loading = false
      state.isAuthChecking = false
    },
    setTempToken(state, action: PayloadAction<{ token: string | null }>) {
      state.token = action.payload.token
    },
    setCashAmount(state, action: PayloadAction<{ cashAmount: string }>) {
      state.cashAmount = action.payload.cashAmount
      // recalculate available whenever total cash changes
      const cash = BigInt(action.payload.cashAmount)
      const reserved = BigInt(state.reservedAmount)
      state.availableAmount = (cash - reserved).toString()
    },
    setCashLoading: (state, action: PayloadAction<boolean>) => {
      state.cashLoading = action.payload
    },
    clearWalletBalance: (state) => {
      state.cashAmount = "0"
      state.reservedAmount = "0"
      state.availableAmount = "0"
      state.cashLoading = false
    },
    // ── Reserved balance reducers ──────────────────────────────────────────
    // Called after a new order is signed — locks the USDC until filled/cancelled
    reserveAmount: (state, action: PayloadAction<string>) => {
      const reserved = BigInt(state.reservedAmount ?? "0") + BigInt(action.payload)
      state.reservedAmount = reserved.toString()
      state.availableAmount = (BigInt(state.cashAmount ?? "0") - reserved).toString()
    },
    // Called when an order is cancelled — unlocks the USDC
    releaseAmount: (state, action: PayloadAction<string>) => {
      const next = BigInt(state.reservedAmount ?? "0") - BigInt(action.payload)
      state.reservedAmount = (next < 0n ? 0n : next).toString()
      state.availableAmount = (
        BigInt(state.cashAmount ?? "0") - BigInt(state.reservedAmount)
      ).toString()
    },
    // Utility — recompute available from current cashAmount and reservedAmount
    recalculateAvailable: (state) => {
      const cash = BigInt(state.cashAmount ?? "0")
      const reserved = BigInt(state.reservedAmount ?? "0")
      state.availableAmount = (cash - reserved).toString()
    },

    //set device token for notifications
    setDeviceToken: (state, action: PayloadAction<string>) => {
      state.deviceToken = action.payload
    },
    triggerWalletRefresh: (state) => {
      state.walletRefreshTrigger = !state.walletRefreshTrigger
    },
  },
})

export const {
  login,
  logout,
  loadingTrue,
  loadingFalse,
  setTempToken,
  setCashAmount,
  setCashLoading,
  clearWalletBalance,
  reserveAmount,
  releaseAmount,
  recalculateAvailable,
  setDeviceToken,
  triggerWalletRefresh,
} = authSlice.actions

export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
export const selectIsAuthChecking = (state: { auth: AuthState }) => state.auth.isAuthChecking
export const selectUserData = (state: { auth: AuthState }) => state.auth
export const selectUserLoading = (state: { auth: AuthState }) => state.auth.loading
export const selectCashAmount = (state: { auth: AuthState }) => state.auth.cashAmount
export const selectPortfolioAmount = (state: { auth: AuthState }) => state.auth.portfolioAmount
export const selectLoginMethod = (state: { auth: AuthState }) => state.auth.loginMethod
export const selectAvailableAmount = (state: { auth: AuthState }) => state.auth.availableAmount
export const selectReservedAmount = (state: { auth: AuthState }) => state.auth.reservedAmount
export const selectDeviceToken = (state: { auth: AuthState }) => state.auth.deviceToken
export const selectWalletRefreshTrigger = (state: { auth: AuthState }) =>
  state.auth.walletRefreshTrigger

export default authSlice.reducer
