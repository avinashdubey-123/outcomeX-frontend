// src/hooks/useRedeem.ts

import { ethers } from "ethers"
import { useState } from "react"
import { useSelector } from "react-redux"
import { toast } from "sonner"

import type { RootState } from "@/app/store"
import { LOGIN_METHODS } from "@/features/auth/authTypes/loginMethodsTypes"
import { getActiveInjectedProvider } from "@/features/auth/lib/injectedProvider"
import { useMagic } from "@/features/auth/lib/magic"
import { ADDRESSES } from "@/libs/contracts"
import { CTF_REDEEM_ABI } from "@/libs/contracts"
import type { Position } from "@/mocks/mockPortfolio"
// ── ABI — only what we need from ConditionalTokens ───────────────────────────

// ── Constants ─────────────────────────────────────────────────────────────────
// parentCollectionId is always bytes32(0) for top-level Polymarket markets
// const PARENT_COLLECTION_ID = ethers.ZeroHash   // "0x000...000" (32 bytes)

// indexSets: which positions to redeem
// 1 = YES (binary 01), 2 = NO (binary 10), [1,2] = both
const INDEX_SET_YES = 1n
const INDEX_SET_NO = 0n

// ── Types ─────────────────────────────────────────────────────────────────────
export type RedeemState = "idle" | "waiting-signature" | "redeeming" | "done" | "error"

// ── Hook ─────────────────────────────────────────────────────────────────────
export const useRedeem = () => {
  const { magic } = useMagic()
  const loginMethod = useSelector((s: RootState) => s.auth.loginMethod)
  const address = useSelector((s: RootState) => s.auth.publicAddress)

  const [redeemState, setRedeemState] = useState<RedeemState>("idle")
  const [redeemError, setRedeemError] = useState<string | null>(null)
  const [redeemingId, setRedeemingId] = useState<string | null>(null)
  // Optimistic local tracking — avoids needing a backend "mark as redeemed" call
  const [redeemedIds, setRedeemedIds] = useState<Set<string>>(new Set())

  // ── get signer (same pattern as useTrade) ────────────────────────────────
  const getSigner = async (): Promise<ethers.JsonRpcSigner> => {
    let provider: ethers.BrowserProvider

    if (loginMethod === LOGIN_METHODS.MetaMask) {
      const p = getActiveInjectedProvider()
      if (!p) throw new Error("Browser wallet not found")
      provider = new ethers.BrowserProvider(p)
    } else {
      if (!magic?.rpcProvider) throw new Error("Magic not ready")
      provider = new ethers.BrowserProvider(magic.rpcProvider as ethers.Eip1193Provider)
    }

    return provider.getSigner()
  }

  // ── main redeem function ──────────────────────────────────────────────────
  const redeem = async (position: Position) => {
    if (!address) {
      toast.error("Wallet not connected")
      return
    }

    // guard — should not be callable in these states but be safe
    if (!position.isResolved || position.isRedeemed) {
      toast.error("Position is not redeemable")
      return
    }

    if (position.winningOutcome !== position.side) {
      toast.error("This was a losing position — nothing to redeem")
      return
    }

    setRedeemingId(position.id)
    setRedeemState("waiting-signature")
    setRedeemError(null)

    try {
      const signer = await getSigner()

      // determine indexSet based on which side user held
      const indexSet = position.side === "YES" ? INDEX_SET_YES : INDEX_SET_NO

      const ctf = new ethers.Contract(ADDRESSES.ConditionalTokens, CTF_REDEEM_ABI, signer)

      setRedeemState("redeeming")

      // getFunction() is safer than optional chaining — throws clearly if ABI is wrong
      // Explicit gas overrides bypass Polygon Amoy's unreliable EIP-1559 fee estimation
      const tx = await ctf.getFunction("redeemPositions")(
        position.collateralToken,
        position.conditionId,
        [indexSet],
        {
          gasLimit: 500_000n,
          maxFeePerGas: ethers.parseUnits("50", "gwei"),
          maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),
        },
      )

      await tx.wait()

      setRedeemState("done")

      // Optimistic update — mark this position as redeemed locally so the button disappears
      // TODO: also call backend API to persist this when the endpoint is available
      setRedeemedIds((prev) => new Set(prev).add(position.id))

      toast.success(`Redeemed! USDC sent to your wallet.`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Redeem failed"
      const short = msg.split("(")[0]?.trim().slice(0, 60)
      setRedeemState("error")
      setRedeemError(short || null)
      toast.error(short)
      console.error("Redeem error:", err)
    } finally {
      setRedeemingId(null)
      // reset back to idle after short delay so button state is visible
      setTimeout(() => {
        setRedeemState("idle")
        setRedeemError(null)
      }, 3000)
    }
  }

  return {
    redeem,
    redeemState,
    redeemError,
    redeemingId,
    redeemedIds, // Set<string> of position IDs successfully redeemed this session
    isRedeeming: redeemState === "redeeming" || redeemState === "waiting-signature",
  }
}
