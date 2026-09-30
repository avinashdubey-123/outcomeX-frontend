// src/components/deposit/MetaMaskDepositModal.tsx
// Shows wallet address + network info for MetaMask users to receive USDC
// TODO: replace with Transak/MoonPay widget for production

import { useEffect, useRef, useState } from "react"

import { useAppSelector } from "@/app/hooks"
import { selectUserData } from "@/features/auth/authSlice"

// ── Constants ─────────────────────────────────────────────────────────────────
const NETWORK_INFO = {
  name: "Polygon Amoy Testnet",
  chainId: "80002",
  symbol: "POL",
  explorer: "https://amoy.polygonscan.com",
} as const

const C = {
  bg: "#161a22",
  surface: "#1c2130",
  border: "rgba(255,255,255,0.08)",
  green: "#00c853",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.5)",
  muted2: "rgba(255,255,255,0.25)",
} as const

// ── Copy button ───────────────────────────────────────────────────────────────
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        padding: "6px 12px",
        borderRadius: 8,
        border: `1px solid ${copied ? "rgba(0,200,83,0.4)" : C.border}`,
        background: copied ? "rgba(0,200,83,0.12)" : C.surface,
        color: copied ? C.green : C.muted,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  )
}

// ── Info row ──────────────────────────────────────────────────────────────────
const InfoRow = ({
  label,
  value,
  copyable = false,
  mono = false,
}: {
  label: string
  value: string
  copyable?: boolean
  mono?: boolean
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "12px 16px",
      background: C.surface,
      borderRadius: 10,
      border: `1px solid ${C.border}`,
    }}
  >
    <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: C.muted2,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: C.text,
          fontFamily: mono ? "monospace" : "inherit",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    </div>
    {copyable && <CopyButton text={value} />}
  </div>
)

// ── Step indicator ────────────────────────────────────────────────────────────
const Step = ({ num, text }: { num: number; text: string }) => (
  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
    <div
      style={{
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: "rgba(0,200,83,0.15)",
        border: "1px solid rgba(0,200,83,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 800,
        color: C.green,
        flexShrink: 0,
        marginTop: 1,
      }}
    >
      {num}
    </div>
    <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{text}</span>
  </div>
)

// ── Main Modal ────────────────────────────────────────────────────────────────
interface MetaMaskDepositModalProps {
  open: boolean
  onClose: () => void
}

export const MetaMaskDepositModal = ({ open, onClose }: MetaMaskDepositModalProps) => {
  const user = useAppSelector(selectUserData)
  const address = user?.publicAddress ?? ""
  const overlayRef = useRef<HTMLDivElement>(null)

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

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlay}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 20px 16px",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* MetaMask fox icon approximation */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(245,130,32,0.15)",
                border: "1px solid rgba(245,130,32,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              🦊
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Deposit USDC</div>
              <div style={{ fontSize: 11, color: C.muted }}>MetaMask · {NETWORK_INFO.name}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: C.surface,
              color: C.muted,
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = C.text
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = C.muted
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          {/* info banner */}
          <div
            style={{
              background: "rgba(0,200,83,0.06)",
              border: "1px solid rgba(0,200,83,0.15)",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 12,
              color: "rgba(0,200,83,0.8)",
              lineHeight: 1.6,
            }}
          >
            Send USDC to your MetaMask address below. Make sure you are on the correct network.
          </div>

          {/* your address */}
          <InfoRow label="Your Wallet Address" value={address ?? "Not connected"} copyable mono />

          {/* network */}
          <InfoRow
            label="Network"
            value={`${NETWORK_INFO.name} (Chain ID: ${NETWORK_INFO.chainId})`}
          />

          {/* USDC contract */}
          <InfoRow
            label="USDC Contract Address"
            value={import.meta.env.VITE_USDC_ADDRESS}
            copyable
            mono
          />

          {/* steps */}
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.muted2,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              How to deposit
            </span>
            <Step num={1} text="Copy your wallet address above" />
            <Step num={2} text={`Make sure you're on ${NETWORK_INFO.name}`} />
            <Step num={3} text="Send USDC from an exchange or another wallet to your address" />
            <Step
              num={4}
              text="Your balance will update automatically after the transaction confirms"
            />
          </div>

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
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
            <span>
              Only send USDC on{" "}
              <strong style={{ color: "rgba(245,158,11,1)" }}>Polygon Amoy</strong>. Sending on the
              wrong network will result in permanent loss of funds.
            </span>
          </div>

          {/* explorer link */}
          <a
            href={`${NETWORK_INFO.explorer}/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "10px",
              borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: C.surface,
              color: C.muted,
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = C.text
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = C.muted
              e.currentTarget.style.borderColor = C.border
            }}
          >
            View on Polygonscan ↗
          </a>
        </div>
      </div>
    </div>
  )
}
