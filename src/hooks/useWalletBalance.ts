import { ethers } from "ethers"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

import type { RootState } from "@/app/store"
import { useGetLockedBalanceQuery } from "@/features/api/auth/authApi"
import { reserveAmount, setCashAmount, setCashLoading } from "@/features/auth/authSlice"

// ← paste your USDC contract address from Magic wallet here
const USDC_ADDRESS = "0xb157f0dD6859722AfE1A5b4D983b94db1468b15A"

const USDC_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
]

export const useWalletBalance = () => {
  const dispatch = useDispatch()
  const address = useSelector((s: RootState) => s.auth.publicAddress)
  const token = useSelector((s: RootState) => s.auth.token)
  const walletRefreshTrigger = useSelector((s: RootState) => s.auth.walletRefreshTrigger)
  const {
    data: lockedData,
    refetch: refetchLocked,
    isFetching: isLockedFetching,
  } = useGetLockedBalanceQuery(undefined, {
    skip: !token,
  })

  const [isOnChainLoading, setIsOnChainLoading] = useState(false)

  // 1. Refetch backend on trigger
  useEffect(() => {
    if (token) {
      refetchLocked()
    }
  }, [walletRefreshTrigger, refetchLocked, token])

  // 2. Sync locked data to Redux
  useEffect(() => {
    if (lockedData) {
      dispatch(reserveAmount(lockedData?.data?.lockedAmount?.toString() || "0"))
    }
  }, [lockedData, dispatch])

  // 3. Fetch on-chain balance
  useEffect(() => {
    if (!address || !token) return
    const fetchBalance = async () => {
      setIsOnChainLoading(true)
      try {
        const rpcUrl = import.meta.env.VITE_RPC_URL || "https://polygon-amoy-bor-rpc.publicnode.com"
        const provider = new ethers.JsonRpcProvider(rpcUrl)
        const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider)
        const raw: bigint = await usdc.getFunction("balanceOf")(address)
        dispatch(setCashAmount({ cashAmount: raw.toString() }))
      } catch (err) {
        console.error("Balance fetch failed:", err)
        dispatch(setCashAmount({ cashAmount: "0" }))
      } finally {
        setIsOnChainLoading(false)
      }
    }

    fetchBalance()
  }, [address, token, dispatch, walletRefreshTrigger])

  // 4. Sync global loading state
  useEffect(() => {
    dispatch(setCashLoading(isOnChainLoading || isLockedFetching))
  }, [isOnChainLoading, isLockedFetching, dispatch])
}
