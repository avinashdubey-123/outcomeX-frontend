import { ethers } from "ethers"
import { useState } from "react"
import { useSelector } from "react-redux"
import { toast } from "sonner"

import { useAppDispatch } from "@/app/hooks"
import type { RootState } from "@/app/store"
import { useCreateOrderMutation } from "@/features/api/orders/orderApi"
import { reserveAmount } from "@/features/auth/authSlice"
import { LOGIN_METHODS } from "@/features/auth/authTypes/loginMethodsTypes"
import { getActiveInjectedProvider } from "@/features/auth/lib/injectedProvider"
import { useMagic } from "@/features/auth/lib/magic"
import { switchToAmoy } from "@/features/auth/switchChain"
import { addOrder } from "@/features/orders/orderSlice"
import { ADDRESSES, ERC20_ABI } from "@/libs/contracts"

import type { TradeOrder } from "./TradeTypes"

// ── Typed contract interfaces ─────────────────────────────────────────────────
interface USDCContract extends ethers.BaseContract {
  allowance(owner: string, spender: string): Promise<bigint>
  approve(spender: string, amount: bigint): Promise<ethers.ContractTransactionResponse>
}

interface CTFContract extends ethers.BaseContract {
  isApprovedForAll(owner: string, operator: string): Promise<boolean>
  setApprovalForAll(
    operator: string,
    approved: boolean,
  ): Promise<ethers.ContractTransactionResponse>
}

interface ExchangeContract extends ethers.BaseContract {
  nonces(addr: string): Promise<bigint>
}

const CTF_ABI = [
  "function setApprovalForAll(address operator, bool approved) returns (bool)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
]

const EXCHANGE_ABI = ["function nonces(address) external view returns (uint256)"]

// ── Unit conversion reference ─────────────────────────────────────────────────
//
//  UI layer      Payload to backend         buildOrderStruct (backend)
//  ──────────    ─────────────────          ──────────────────────────
//  limitCents    price = limitCents×10_000  price  (already 1e6)
//  shares (raw)  shares = raw × 1_000_000  tokens (already 1e6 minor units)
//
//  Backend formula (must match exactly):
//    usdc  = (tokens × price) / 1_000_000
//    e.g.  = (1_000_000 × 500_000) / 1_000_000 = 500_000  ✓
//
//  Signed struct:
//    BUY:  makerAmount = usdc,   takerAmount = tokens
//    SELL: makerAmount = tokens, takerAmount = usdc

export const useTrade = () => {
  const { magic } = useMagic()
  const dispatch = useAppDispatch()
  const loginMethod = useSelector((s: RootState) => s.auth.loginMethod)
  const address = useSelector((s: RootState) => s.auth.publicAddress)
  const selectedMarket = useSelector((s: RootState) => s.markets.selectedMarket)
  const [isTrading, setIsTrading] = useState(false)
  const [tradeError, setTradeError] = useState<string | null>(null)
  const [approvalState, setApprovalState] = useState<
    "idle" | "approving-usdc" | "approving-ctf" | "signing" | "submitting"
  >("idle")

  const [createOrder] = useCreateOrderMutation()
  // ── Step 1: get signer ────────────────────────────────────────────────────

  const getSigner = async (): Promise<ethers.JsonRpcSigner> => {
    let provider: ethers.BrowserProvider

    if (loginMethod === LOGIN_METHODS.MetaMask) {
      const p = getActiveInjectedProvider()
      if (!p) throw new Error("Browser wallet not found")
      await switchToAmoy(p)
      provider = new ethers.BrowserProvider(p)
    } else {
      if (!magic?.rpcProvider) throw new Error("Magic not ready")
      provider = new ethers.BrowserProvider(magic.rpcProvider as ethers.Eip1193Provider)
    }

    return new ethers.JsonRpcSigner(provider, address!)
  }

  // ── Step 1b: read on-chain nonce ──────────────────────────────────────────
  const getNonce = async (): Promise<bigint> => {
    const rpcUrl = import.meta.env.VITE_RPC_URL || "https://polygon-amoy-bor-rpc.publicnode.com"
    const publicProvider = new ethers.JsonRpcProvider(rpcUrl)
    const exchange = new ethers.Contract(
      ADDRESSES.CTFExchange,
      EXCHANGE_ABI,
      publicProvider,
    ) as unknown as ExchangeContract
    return exchange.nonces(address!)
  }

  // ── Step 1c: Get dynamic gas overrides to satisfy Amoy minimums ──────────
  const getGasOverrides = async () => {
    const rpcUrl = import.meta.env.VITE_RPC_URL || "https://polygon-amoy-bor-rpc.publicnode.com"
    const publicProvider = new ethers.JsonRpcProvider(rpcUrl)
    const feeData = await publicProvider.getFeeData()
    const minPriorityFee = 30_000_000_000n
    const minFee = 40_000_000_000n

    const maxPriorityFeePerGas =
      feeData.maxPriorityFeePerGas && feeData.maxPriorityFeePerGas > minPriorityFee
        ? feeData.maxPriorityFeePerGas
        : minPriorityFee

    const maxFeePerGas =
      feeData.maxFeePerGas && feeData.maxFeePerGas > minFee ? feeData.maxFeePerGas : minFee

    return { maxPriorityFeePerGas, maxFeePerGas }
  }

  // ── Step 2: approve USDC spending ────────────────────────────────────────
  const approveUSDC = async (signer: ethers.JsonRpcSigner, amount: bigint) => {
    const rpcUrl = import.meta.env.VITE_RPC_URL || "https://polygon-amoy-bor-rpc.publicnode.com"
    const publicProvider = new ethers.JsonRpcProvider(rpcUrl)
    const usdcPublic = new ethers.Contract(
      ADDRESSES.USDC,
      ERC20_ABI,
      publicProvider,
    ) as unknown as USDCContract

    const allowance = await usdcPublic.allowance(address!, ADDRESSES.CTFExchange)
    if (allowance >= amount && amount > 0n) {
      return
    }

    const overrides = await getGasOverrides()
    const usdc = new ethers.Contract(ADDRESSES.USDC, ERC20_ABI, signer)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tx = await (usdc as any).approve(ADDRESSES.CTFExchange, ethers.MaxUint256, overrides)
    await tx.wait()
  }

  // ── Step 3: approve CTF token transfers ──────────────────────────────────
  const approveCTF = async (signer: ethers.JsonRpcSigner) => {
    const rpcUrl = import.meta.env.VITE_RPC_URL || "https://polygon-amoy-bor-rpc.publicnode.com"
    const publicProvider = new ethers.JsonRpcProvider(rpcUrl)
    const ctfPublic = new ethers.Contract(
      ADDRESSES.ConditionalTokens,
      CTF_ABI,
      publicProvider,
    ) as unknown as CTFContract

    const approved = await ctfPublic.isApprovedForAll(address!, ADDRESSES.CTFExchange)
    if (approved) {
      return
    }

    const overrides = await getGasOverrides()
    const ctf = new ethers.Contract(ADDRESSES.ConditionalTokens, CTF_ABI, signer)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tx = await (ctf as any).setApprovalForAll(ADDRESSES.CTFExchange, true, overrides)
    await tx.wait()
  }

  // ── Step 4: sign order (EIP-712) ──────────────────────────────────────────
  const signOrder = async (signer: ethers.JsonRpcSigner, order: TradeOrder) => {
    const tokenId = order.outcome === "Yes" ? order.yesTokenOnChainId : order.noTokenOnChainId

    const domain = {
      name: "PolymarketCTFExchange",
      version: "1",
      chainId: 80002n,
      verifyingContract: ADDRESSES.CTFExchange,
    }

    const types = {
      Order: [
        { name: "salt", type: "uint256" },
        { name: "maker", type: "address" },
        { name: "signer", type: "address" },
        { name: "taker", type: "address" },
        { name: "collateralToken", type: "address" },
        { name: "ctf", type: "address" },
        { name: "tokenId", type: "uint256" },
        { name: "makerAmount", type: "uint256" },
        { name: "takerAmount", type: "uint256" },
        { name: "side", type: "uint256" },
        { name: "expiry", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "feeRateBps", type: "uint256" },
        { name: "signatureType", type: "uint8" },
      ],
    }

    // ── Mirror backend buildOrderStruct exactly ──────────────────────────────
    //
    //  tokens = rawShares × 1_000_000  (1e6 minor units — same as backend "shares")
    //  price  = limitCents × 10_000    (1e6 USDC units)
    //  usdc   = (tokens × price) / 1_000_000
    //
    //  e.g. 5 shares at 50¢:
    //    tokens = 5 × 1_000_000 = 5_000_000
    //    price  = 50 × 10_000  =   500_000
    //    usdc   = (5_000_000 × 500_000) / 1_000_000 = 2_500_000  ✓

    const tokens = BigInt(Math.round(order.shares ?? 0)) * 1_000_000n // rawShares × 1e6
    const price = BigInt(Math.round((order.limitCents ?? 0) * 10_000)) // limitCents → 1e6
    const usdc = (tokens * price) / 1_000_000n // matches backend formula exactly

    const isBuy = order.action === "Buy"
    const nonce = await getNonce()

    const orderStruct = {
      salt: BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) + BigInt(Date.now()),
      maker: address!,
      signer: address!,
      taker: ethers.ZeroAddress,
      collateralToken: ADDRESSES.USDC,
      ctf: ADDRESSES.ConditionalTokens,
      tokenId: BigInt(tokenId as string),
      // BUY:  maker spends USDC,   taker delivers tokens
      // SELL: maker delivers tokens, taker pays USDC
      makerAmount: isBuy ? usdc : tokens,
      takerAmount: isBuy ? tokens : usdc,
      side: isBuy ? 0n : 1n,
      expiry: 0n,
      nonce: BigInt(nonce),
      feeRateBps: isBuy ? 200n : 0n,
      signatureType: 0n,
    }

    const signature = await signer.signTypedData(domain, types, orderStruct)
    return { orderStruct, signature }
  }

  // ── Main: executeTrade ────────────────────────────────────────────────────
  const executeTrade = async (order: TradeOrder) => {
    if (!address) return

    setIsTrading(true)
    setTradeError(null)

    try {
      const signer = await getSigner()

      if (order.action === "Buy") {
        setApprovalState("approving-usdc")
        // Calculate required USDC in micro-units (1e6)
        let usdcAmount: bigint
        if (order.orderType === "Market") {
          // order.amount is in dollars (e.g., 5.0)
          usdcAmount = BigInt(Math.round((order.amount ?? 0) * 1_000_000))
        } else {
          // Limit order: (shares * priceInCents / 100) -> dollars. Then * 1e6 -> micro-USDC.
          const totalDollars = ((order.shares ?? 0) * (order.limitCents ?? 0)) / 100
          usdcAmount = BigInt(Math.round(totalDollars * 1_000_000))
        }

        await approveUSDC(signer, usdcAmount)
      } else {
        setApprovalState("approving-ctf")
        await approveCTF(signer)
      }

      setApprovalState("signing")
      const { orderStruct, signature } = await signOrder(signer, order)
      const payload = {
        tokenId:
          order.outcome === "Yes" ? (order.yesTokenId as string) : (order.noTokenId as string),
        // Must match exactly what signOrder used to build the struct:
        //   price  = limitCents × 10_000  (1e6 units)
        //   shares = rawShares  × 1_000_000 (1e6 minor units — backend "tokens")
        price: Math.round((order.limitCents ?? 0) * 10_000).toString(),
        shares: (Math.round(order.shares ?? 0) * 1_000_000).toString(),
        type: order.action === "Buy" ? 1 : 2,
        nonce: orderStruct.nonce.toString(),
        salt: orderStruct.salt.toString(),
        signature,
      }

      setApprovalState("submitting")
      await createOrder(payload).unwrap()

      toast.success("Order placed successfully", {
        duration: 3000,
        position: "top-right",
        style: {
          fontSize: "12px",
          padding: "8px 12px",
          maxWidth: "320px",
        },
      })

      // ── Redux: derive display price & shares ─────────────────────────────
      const marketPriceCents: number = (() => {
        if (order.orderType === "Limit") return order.limitCents ?? 0
        const isYes = order.outcome === "Yes" || order.outcome === "Up"
        return isYes
          ? ((selectedMarket as { yesProbability?: number })?.yesProbability ?? 0)
          : ((selectedMarket as { noProbability?: number })?.noProbability ?? 0)
      })()

      const computedShares: number = (() => {
        if (order.orderType === "Limit") return order.shares ?? 0
        if (order.action === "Sell") return order.shares ?? 0
        const pricePerShare = marketPriceCents / 100
        if (pricePerShare <= 0) return 0
        return Math.floor((order.amount ?? 0) / pricePerShare)
      })()

      dispatch(
        addOrder({
          id: `temp-${Date.now()}`,
          marketId: order.marketId,
          marketTitle: selectedMarket?.title as string,
          outcome: order.outcome,
          side: order.action,
          orderType: order.orderType,
          price: marketPriceCents,
          originalShares: computedShares,
          filledShares: 0,
          remainingShares: computedShares,
          usdcAmount: order.amount ?? (computedShares * marketPriceCents) / 100,
          status: "pending",
          createdAt: new Date().toISOString(),
          token: { title: "", id: "" },
        }),
      )

      const usdcDollars = order.amount ?? (computedShares * marketPriceCents) / 100
      const usdcToReserve = BigInt(Math.round(usdcDollars * 1_000_000)).toString()
      dispatch(reserveAmount(usdcToReserve))
    } catch (err: unknown) {
      console.error("Trade error:", err)
      let message = "Trade failed. Please try again."

      if (err instanceof Error) {
        // Wallet / ethers errors
        const code = (err as unknown as { code?: number | string }).code
        if (code === 4001 || err.message.includes('reason="rejected"')) {
          message = "Transaction rejected by user."
        } else if (err.message.includes("MetaMask not found")) {
          message = "MetaMask not found. Please install the MetaMask extension."
        } else if (err.message.includes("Magic not ready")) {
          message = "Wallet not ready. Please try again."
        } else if (err.message.includes("insufficient funds")) {
          message = "Insufficient funds for gas fees."
        } else if (
          err.message.includes("Unexpected error") ||
          err.message.includes("eth_accounts") ||
          err.message.includes("UNKNOWN_ERROR")
        ) {
          message = "Wallet connection unstable. Please try again."
        } else if (err.message) {
          message = err.message
        }
      } else if (typeof err === "object" && err !== null) {
        // RTK Query / backend API errors: { status: number, data: { message: string } }
        const apiErr = err as { status?: number; data?: { message?: string; type?: string } }
        if (apiErr.data?.message) {
          message = apiErr.data.message
        }
      }

      setTradeError(message)
    } finally {
      setIsTrading(false)
      setApprovalState("idle")
    }
  }

  return { executeTrade, isTrading, tradeError, approvalState }
}
