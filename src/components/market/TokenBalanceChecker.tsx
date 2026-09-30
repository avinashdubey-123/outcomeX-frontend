/**
 * TokenBalanceChecker — TEMPORARY DEBUG COMPONENT
 *
 * Reads the ERC-1155 balanceOf for the YES and NO token IDs of the current
 * market directly from the ConditionalTokens contract on Polygon Amoy.
 *
 * Remove this component once debugging is done.
 */

import { ethers } from "ethers"
import { RefreshCw } from "lucide-react"
import { useCallback, useState } from "react"
import { useSelector } from "react-redux"

import type { RootState } from "@/app/store"
import { ADDRESSES, NETWORK } from "@/libs/contracts"

const CTF_BALANCE_ABI = ["function balanceOf(address account, uint256 id) view returns (uint256)"]

interface CTFBalanceContract extends ethers.BaseContract {
  balanceOf(account: string, id: bigint): Promise<bigint>
}

interface Props {
  yesTokenOnChainId: string | null
  noTokenOnChainId: string | null
}

interface Balances {
  yes: string
  no: string
}

export const TokenBalanceChecker = ({ yesTokenOnChainId, noTokenOnChainId }: Props) => {
  const address = useSelector((s: RootState) => s.auth.publicAddress)
  const [balances, setBalances] = useState<Balances | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBalances = useCallback(async () => {
    if (!address) {
      setError("No wallet connected.")
      return
    }
    if (!yesTokenOnChainId || !noTokenOnChainId) {
      setError("Token IDs not available for this market.")
      return
    }

    setLoading(true)
    setError(null)
    setBalances(null)

    try {
      const provider = new ethers.JsonRpcProvider(NETWORK.rpcUrl)
      const ctf = new ethers.Contract(
        ADDRESSES.ConditionalTokens,
        CTF_BALANCE_ABI,
        provider,
      ) as unknown as CTFBalanceContract

      const [yesBal, noBal] = await Promise.all([
        ctf.balanceOf(address, BigInt(yesTokenOnChainId)),
        ctf.balanceOf(address, BigInt(noTokenOnChainId)),
      ])

      // ConditionalTokens uses 1e6 scaling (same as USDC micro-units)
      const fmt = (raw: bigint) => {
        const whole = raw / 1_000_000n
        const frac = raw % 1_000_000n
        return frac === 0n
          ? whole.toString()
          : `${whole}.${frac.toString().padStart(6, "0").replace(/0+$/, "")}`
      }

      setBalances({ yes: fmt(yesBal), no: fmt(noBal) })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error fetching balances.")
    } finally {
      setLoading(false)
    }
  }, [address, yesTokenOnChainId, noTokenOnChainId])

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(17,20,27,0.95) 0%, rgba(20,24,34,0.98) 100%)",
        border: "1px solid rgba(255,215,0,0.25)",
        borderRadius: "10px",
        padding: "14px 16px",
        marginBottom: "12px",
        fontSize: "12px",
        fontFamily: "monospace",
        boxShadow: "0 0 16px rgba(255,215,0,0.06)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "rgba(255,215,0,0.7)",
            textTransform: "uppercase",
          }}
        >
          🔬 DEV · Token Balance Checker
        </span>
        <button
          onClick={fetchBalances}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            background: "rgba(255,215,0,0.1)",
            border: "1px solid rgba(255,215,0,0.3)",
            borderRadius: "6px",
            color: "rgba(255,215,0,0.9)",
            padding: "4px 10px",
            fontSize: "11px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            transition: "all 0.15s ease",
          }}
        >
          <RefreshCw
            size={11}
            style={{
              animation: loading ? "spin 0.8s linear infinite" : "none",
            }}
          />
          {loading ? "Fetching…" : "Check Balances"}
        </button>
      </div>

      {/* Token ID rows */}
      <div style={{ color: "rgba(255,255,255,0.35)", marginBottom: "10px", lineHeight: 1.8 }}>
        <div>
          <span style={{ color: "rgba(255,255,255,0.25)" }}>YES ID: </span>
          <span style={{ color: "rgba(255,255,255,0.55)", wordBreak: "break-all" }}>
            {yesTokenOnChainId ?? "—"}
          </span>
        </div>
        <div>
          <span style={{ color: "rgba(255,255,255,0.25)" }}>NO ID: </span>
          <span style={{ color: "rgba(255,255,255,0.55)", wordBreak: "break-all" }}>
            {noTokenOnChainId ?? "—"}
          </span>
        </div>
        <div>
          <span style={{ color: "rgba(255,255,255,0.25)" }}>Wallet: </span>
          <span style={{ color: "rgba(255,255,255,0.55)" }}>{address ?? "not connected"}</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            color: "#ff6b6b",
            background: "rgba(255,107,107,0.08)",
            border: "1px solid rgba(255,107,107,0.2)",
            borderRadius: "6px",
            padding: "6px 10px",
            marginTop: "6px",
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* Balances */}
      {balances && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            marginTop: "8px",
          }}
        >
          {(
            [
              { label: "YES tokens", value: balances.yes, color: "#22c55e" },
              { label: "NO tokens", value: balances.no, color: "#ef4444" },
            ] as const
          ).map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                background: `${color}10`,
                border: `1px solid ${color}30`,
                borderRadius: "8px",
                padding: "10px 12px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: `${color}cc`,
                  fontSize: "10px",
                  marginBottom: "4px",
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
              <div style={{ color, fontSize: "20px", fontWeight: 700, fontFamily: "monospace" }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
