// src/components/withdraw/WithdrawModal.tsx
//
// Magic users  → shows magic.wallet.showUI() button (built-in send)
// MetaMask     → custom form: address + amount + usdc.transfer() on-chain

import { ethers } from "ethers"
import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { toast } from "sonner"

import type { RootState } from "@/app/store"
import { LOGIN_METHODS } from "@/features/auth/authTypes/loginMethodsTypes"
import { getActiveInjectedProvider } from "@/features/auth/lib/injectedProvider"
import { useMagic } from "@/features/auth/lib/magic"
import { ADDRESSES, ERC20_ABI } from "@/libs/contracts"

// ── Constants ─────────────────────────────────────────────────────────────────
const C = {
  bg: "#161a22",
  surface: "#1c2130",
  border: "rgba(255,255,255,0.08)",
  green: "#00c853",
  red: "#e53935",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.5)",
  muted2: "rgba(255,255,255,0.2)",
} as const

const MIN_WITHDRAW = 1 // $1 minimum
const USDC_DECIMALS = 6

// ── Types ─────────────────────────────────────────────────────────────────────
type WithdrawStep = "form" | "confirming" | "success" | "error"

interface WithdrawModalProps {
  open: boolean
  onClose: () => void
  availableBalance: number // USDC — shown as max withdrawable
}

interface USDCContract extends ethers.BaseContract {
  transfer(to: string, amount: bigint): Promise<ethers.ContractTransactionResponse>
  balanceOf(owner: string): Promise<bigint>
  decimals(): Promise<number>
  approve(spender: string, amount: bigint): Promise<ethers.ContractTransactionResponse>
  allowance(owner: string, spender: string): Promise<bigint>
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const isValidAddress = (addr: string) => {
  try {
    return ethers.isAddress(addr)
  } catch {
    return false
  }
}

const shortAddr = (addr: string) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "")

// ── Sub-components ────────────────────────────────────────────────────────────
const ModalHeader = ({
  title,
  subtitle,
  onClose,
}: {
  title: string
  subtitle: string
  onClose: () => void
}) => (
  <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10">
    {/* <div style={{ display: "flex", alignItems: "center", gap: 10 }}> */}
    {/* <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}
      >
        ↑
      </div> */}
    <div>
      <div className="font-lg font-bold text-white">{title}</div>
      <div className="font-sm text-white/60">{subtitle}</div>
    </div>
    {/* </div> */}
    <button
      onClick={onClose}
      className="w-8 h-8 bg-transparent text-xl text-white/60 flex items-center justify-center cursor-pointer"
      onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
      onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
    >
      ✕
    </button>
  </div>
)

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div
    className="flex justify-between items-center py-2.5 p-3.5 rounded-md bg-linear-to-b from-white/5 to-white/2 border border-white/10"
    // style={{
    //   display: "flex",
    //   justifyContent: "space-between",
    //   alignItems: "center",
    //   padding: "10px 14px",
    //   background: C.surface,
    //   borderRadius: 8,
    //   border: `1px solid ${C.border}`,
    // }}
  >
    <span className="font-sm font-semibold text-white/60 uppercase tracking-wider">{label}</span>
    <span className="font-sm font-semibold text-white ">{value}</span>
  </div>
)

// ── Magic withdraw view ───────────────────────────────────────────────────────
const MagicWithdrawView = ({
  availableBalance,
  onOpenMagic,
}: {
  availableBalance: number
  onOpenMagic: () => void
}) => (
  <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
    <div className="bg-primary/20 border border-primary/80 rounded-md py-3 px-3.5 font-sm text-white/60 ">
      Your USDC is in your Magic wallet. Use the Magic wallet interface to send USDC to any address.
    </div>

    <InfoRow label="Available" value={`$${availableBalance.toFixed(2)} USDC`} />
    <InfoRow label="Network" value="Polygon Amoy" />

    <button
      onClick={onOpenMagic}
      className="width-full p-3 bg-primary rounded-lg text-black font-black font-default  cursor-pointer flex items-center justify-center gap-2 mt-1"
    >
      Open Magic Wallet
    </button>

    <p className="font-sm text-tab-text align-center text-center">
      In Magic wallet, tap "Send" → enter destination address → confirm
    </p>
  </div>
)

// ── MetaMask withdraw form ────────────────────────────────────────────────────
const MetaMaskWithdrawForm = ({
  availableBalance,
  onWithdraw,
}: {
  availableBalance: number
  onWithdraw: (toAddress: string, amount: number) => Promise<void>
}) => {
  const [toAddress, setToAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [step, setStep] = useState<WithdrawStep>("form")
  const [txHash] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const amountNum = parseFloat(amount) || 0
  const addressValid = isValidAddress(toAddress)
  const amountValid = amountNum >= MIN_WITHDRAW && amountNum <= availableBalance
  const canSubmit = addressValid && amountValid && step === "form"

  const handleMax = () => setAmount(availableBalance.toFixed(2))

  const handleSubmit = async () => {
    if (!canSubmit) return
    setStep("confirming")
    try {
      await onWithdraw(toAddress, amountNum)
      setStep("success")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Withdrawal failed"
      if (msg as string) {
        setErrorMsg("withdrawl failed")
      }
      setStep("error")
    }
  }

  // ── Success state ──
  if (step === "success")
    return (
      <div
        style={{
          padding: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(0,200,83,0.12)",
            border: "2px solid rgba(0,200,83,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
          }}
        >
          ✓
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.green, marginBottom: 6 }}>
            Withdrawal Successful
          </div>
          <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
            ${amountNum.toFixed(2)} USDC sent to{" "}
            <span style={{ fontFamily: "monospace", color: C.text }}>{shortAddr(toAddress)}</span>
          </div>
        </div>
        {txHash && (
          <a
            href={`https://amoy.polygonscan.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12,
              color: C.green,
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid rgba(0,200,83,0.2)",
              background: "rgba(0,200,83,0.06)",
            }}
          >
            View on Polygonscan ↗
          </a>
        )}
      </div>
    )

  // ── Error state ──
  if (step === "error")
    return (
      <div
        style={{
          padding: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(229,57,53,0.12)",
            border: "2px solid rgba(229,57,53,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
          }}
        >
          ✕
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.red, marginBottom: 6 }}>
            Withdrawal Failed
          </div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{errorMsg}</div>
        </div>
        <button
          onClick={() => setStep("form")}
          style={{
            padding: "10px 24px",
            borderRadius: 10,
            background: C.surface,
            color: C.text,
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            border: `1px solid ${C.border}`,
          }}
        >
          Try again
        </button>
      </div>
    )

  // ── Confirming state ──
  if (step === "confirming")
    return (
      <div
        style={{
          padding: "40px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: `3px solid rgba(0,200,83,0.2)`,
            borderTopColor: C.green,
            animation: "wm-spin 0.8s linear infinite",
          }}
        />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>
            Confirm in MetaMask
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>
            Check your MetaMask popup and confirm the transaction
          </div>
        </div>
      </div>
    )

  // ── Form state ──
  return (
    <div className="p-6 flex flex-col gap-3.5">
      {/* balance info */}
      <InfoRow label="Available to withdraw" value={`$${availableBalance.toFixed(2)} USDC`} />

      {/* destination address */}
      <div className="flex flex-col gap-1.5">
        <label
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: C.muted2,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Destination Address
        </label>
        <input
          type="text"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value.trim())}
          placeholder="0x..."
          style={{
            background: C.surface,
            border: `1px solid ${toAddress && !addressValid ? C.red : addressValid ? "rgba(0,200,83,0.4)" : C.border}`,
            borderRadius: 10,
            padding: "12px 14px",
            fontSize: 13,
            color: C.text,
            fontFamily: "monospace",
            outline: "none",
            transition: "border-color 0.15s",
          }}
        />
        {toAddress && !addressValid && (
          <span style={{ fontSize: 11, color: C.red }}>Invalid Ethereum address</span>
        )}
      </div>

      {/* amount */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: C.muted2,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Amount (USDC)
        </label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="number"
            value={amount}
            min={MIN_WITHDRAW}
            max={availableBalance}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            style={{
              flex: 1,
              background: C.surface,
              border: `1px solid ${amount && !amountValid ? C.red : C.border}`,
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 14,
              fontWeight: 600,
              color: C.text,
              outline: "none",
            }}
          />
          <button
            onClick={handleMax}
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: C.surface,
              color: C.green,
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Max
          </button>
        </div>
        {amount && !amountValid && (
          <span style={{ fontSize: 11, color: C.red }}>
            {amountNum < MIN_WITHDRAW
              ? `Minimum withdrawal is $${MIN_WITHDRAW}`
              : `Cannot exceed available balance ($${availableBalance.toFixed(2)})`}
          </span>
        )}
      </div>

      {/* summary */}
      {canSubmit && (
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: C.muted }}>Sending</span>
            <span style={{ color: C.text, fontWeight: 700 }}>${amountNum.toFixed(2)} USDC</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: C.muted }}>To</span>
            <span style={{ color: C.text, fontFamily: "monospace" }}>{shortAddr(toAddress)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: C.muted }}>Network</span>
            <span style={{ color: C.text }}>Polygon Amoy</span>
          </div>
        </div>
      )}

      {/* warning */}
      <div
        style={{
          background: "rgba(245,158,11,0.06)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 12,
          color: "rgba(245,158,11,0.8)",
          lineHeight: 1.6,
          display: "flex",
          gap: 8,
        }}
      >
        <span style={{ flexShrink: 0 }}>⚠️</span>
        <span>
          Only send to a <strong style={{ color: "rgba(245,158,11,1)" }}>Polygon</strong> address.
          Wrong network = permanent loss.
        </span>
      </div>

      {/* submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        style={{
          width: "100%",
          padding: "13px",
          borderRadius: 12,
          background: canSubmit ? C.green : "rgba(255,255,255,0.06)",
          color: canSubmit ? "#000" : C.muted,
          fontWeight: 800,
          fontSize: 14,
          cursor: canSubmit ? "pointer" : "not-allowed",
          border: "none",
          transition: "all 0.15s",
        }}
      >
        Withdraw USDC
      </button>
    </div>
  )
}

// ── Main WithdrawModal ────────────────────────────────────────────────────────
export const WithdrawModal = ({ open, onClose, availableBalance }: WithdrawModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  const { magic } = useMagic()
  const loginMethod = useSelector((s: RootState) => s.auth.loginMethod)
  const address = useSelector((s: RootState) => s.auth.publicAddress)
  const isMetaMask = loginMethod === LOGIN_METHODS.MetaMask

  // close on overlay click
  const handleOverlay = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  // close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", h)
    return () => document.removeEventListener("keydown", h)
  }, [onClose])

  // ── MetaMask withdraw — calls usdc.transfer() on-chain ────────────────────
  const handleMetaMaskWithdraw = async (toAddress: string, amount: number) => {
    const p = getActiveInjectedProvider()
    if (!p) throw new Error("Browser wallet not found")

    const provider = new ethers.BrowserProvider(p)
    const signer = await provider.getSigner()
    const usdc = new ethers.Contract(ADDRESSES.USDC, ERC20_ABI, signer) as unknown as USDCContract
    const amountUnits = BigInt(Math.round(amount * Math.pow(10, USDC_DECIMALS)))
    const network = await provider.getNetwork()

    if (network.chainId !== 80002n) {
      throw new Error("Please switch to Polygon Amoy Testnet")
    }
    const tx = await usdc.transfer(toAddress, amountUnits)
    await tx.wait()

    toast.success(`$${amount.toFixed(2)} USDC withdrawn successfully`)
  }

  if (!open) return null

  return (
    <>
      <style>{`@keyframes wm-spin { to { transform: rotate(360deg); } }`}</style>

      <div
        ref={overlayRef}
        onClick={handleOverlay}
        className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      >
        <div className="w-full max-w-110 bg-black border border-white/10 rounded-xl overflow-hidden shadow-[0px_4px_100px_0px_#FFFFFF1A]">
          <ModalHeader
            title="Withdraw USDC"
            subtitle={isMetaMask ? `MetaMask · ${shortAddr(address ?? "")}` : "Magic Wallet"}
            onClose={onClose}
          />

          {isMetaMask ? (
            <MetaMaskWithdrawForm
              availableBalance={availableBalance}
              onWithdraw={handleMetaMaskWithdraw}
            />
          ) : (
            <MagicWithdrawView
              availableBalance={availableBalance}
              onOpenMagic={() => magic?.wallet.showUI()}
            />
          )}
        </div>
      </div>
    </>
  )
}
