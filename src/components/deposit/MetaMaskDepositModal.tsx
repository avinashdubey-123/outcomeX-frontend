// src/components/deposit/MetaMaskDepositModal.tsx
// Shows the user's wallet address + network info so they can receive USDC.
// TODO: replace with Transak/MoonPay widget for production

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { useAppSelector } from "@/app/hooks"
import { selectUserData } from "@/features/auth/authSlice"

const NETWORK_INFO = {
  name: "Polygon Amoy Testnet",
  shortName: "Polygon Amoy",
  chainId: "80002",
  explorer: "https://amoy.polygonscan.com",
} as const

const DEPOSIT_STEPS = [
  "Copy your wallet address above",
  `Make sure you're on ${NETWORK_INFO.name}`,
  "Send USDC from an exchange or another wallet to your address",
  "Your balance will update automatically after the transaction confirms",
] as const

const shortAddr = (addr: string) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "")

const CopyButton = ({ text, label }: { text: string; label: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
      toast.error(`Could not copy ${label}`)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy ${label}`}
      className={`shrink-0 px-3 py-1.5 rounded-md border font-sm font-semibold cursor-pointer transition-colors ${
        copied
          ? "border-primary/60 bg-primary/20 text-primary"
          : "border-white/10 bg-white/5 text-white/60 hover:text-white"
      }`}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  )
}

const InfoRow = ({
  label,
  value,
  displayValue = value,
  copyable = false,
  mono = false,
}: {
  label: string
  value: string
  displayValue?: string
  copyable?: boolean
  mono?: boolean
}) => (
  <div className="flex items-center justify-between gap-3 p-3.5 rounded-md bg-linear-to-b from-white/5 to-white/2 border border-white/10">
    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
      <span className="font-sm font-semibold text-white/60 uppercase tracking-wider">{label}</span>
      <span
        className={`font-sm font-semibold text-white truncate ${mono ? "font-mono" : ""}`}
        title={value}
      >
        {displayValue}
      </span>
    </div>
    {copyable && <CopyButton text={value} label={label} />}
  </div>
)

const Step = ({ num, text }: { num: number; text: string }) => (
  <div className="flex gap-2.5 items-start">
    <div className="w-5.5 h-5.5 shrink-0 mt-px rounded-full bg-primary/20 border border-primary/60 flex items-center justify-center text-xs font-extrabold text-primary">
      {num}
    </div>
    <span className="font-sm text-white/60 leading-relaxed">{text}</span>
  </div>
)

interface MetaMaskDepositModalProps {
  open: boolean
  onClose: () => void
}

export const MetaMaskDepositModal = ({ open, onClose }: MetaMaskDepositModalProps) => {
  const user = useAppSelector(selectUserData)
  const address = user?.publicAddress ?? ""
  const usdcAddress = import.meta.env.VITE_USDC_ADDRESS as string | undefined
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleOverlay = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlay}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="deposit-modal-title"
        className="w-full max-w-110 max-h-[calc(100dvh-2rem)] flex flex-col bg-black border border-white/10 rounded-xl overflow-hidden shadow-[0px_4px_100px_0px_#FFFFFF1A]"
      >
        <div className="shrink-0 flex items-center justify-between p-6 pb-4 border-b border-white/10">
          <div>
            <div id="deposit-modal-title" className="font-lg font-bold text-white">
              Deposit USDC
            </div>
            <div className="font-sm font-semibold text-white/60">
              {address ? shortAddr(address) : "Not connected"} · {NETWORK_INFO.name}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 bg-transparent text-xl text-white/60 hover:text-white flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body so tall content never overflows the viewport */}
        <div className="flex-1 min-h-0 overflow-y-scroll p-5 flex flex-col gap-3 [scrollbar-width:thin] [scrollbar-color:var(--color-muted-foreground)_var(--color-muted)]">
          <div className="shrink-0 bg-primary/20 border border-primary/80 rounded-md py-3 px-3.5 font-sm text-white/60">
            Send USDC to your wallet address below. Make sure you are on the correct network.
          </div>

          <InfoRow
            label="Your Wallet Address"
            value={address || "Not connected"}
            displayValue={address ? shortAddr(address) : "Not connected"}
            copyable={Boolean(address)}
            mono
          />
          <InfoRow
            label="Network"
            value={`${NETWORK_INFO.name} (Chain ID: ${NETWORK_INFO.chainId})`}
          />
          {usdcAddress && (
            <InfoRow label="USDC Contract Address" value={shortAddr(usdcAddress)} copyable mono />
          )}

          <div className="flex flex-col gap-3 p-3.5 rounded-md bg-linear-to-b from-white/5 to-white/2 border border-white/10">
            <span className="font-sm font-semibold text-white/60 uppercase tracking-wider">
              How to deposit
            </span>
            {DEPOSIT_STEPS.map((text, i) => (
              <Step key={text} num={i + 1} text={text} />
            ))}
          </div>

          <div className="flex gap-2 items-start bg-dispute/10 border border-dispute/40 rounded-md py-3 px-3.5 font-sm text-dispute/80">
            <span className="shrink-0">⚠️</span>
            <span>
              Only send USDC on <strong className="text-dispute">{NETWORK_INFO.shortName}</strong>.
              Sending on the wrong network will result in permanent loss of funds.
            </span>
          </div>

          {address && (
            <a
              href={`${NETWORK_INFO.explorer}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-3 rounded-lg bg-primary text-black font-black font-default cursor-pointer"
            >
              View on Polygonscan ↗
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
