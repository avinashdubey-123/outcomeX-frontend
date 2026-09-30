// src/components/auth/UsernameModal.tsx
// Shown after first login — user can set a username or skip
// Matches LoginModal design language exactly

import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"

// ── Types ─────────────────────────────────────────────────────────────────────
interface UsernameModalProps {
  open: boolean
  onConfirm: (username: string) => Promise<void> | void
  onSkip: () => void
  // optional: pre-fill from email prefix or wallet address
  defaultUsername?: string
}

// ── Validation ────────────────────────────────────────────────────────────────
const MIN_LEN = 3
const MAX_LEN = 20
const VALID_RE = /^[a-zA-Z0-9_]+$/

const validate = (val: string): string | null => {
  if (val.length < MIN_LEN) return `At least ${MIN_LEN} characters`
  if (val.length > MAX_LEN) return `Max ${MAX_LEN} characters`
  if (!VALID_RE.test(val)) return "Only letters, numbers and underscores"
  return null
}

// ── UsernameModal ─────────────────────────────────────────────────────────────
export const UsernameModal = ({
  open,
  onConfirm,
  onSkip,
  defaultUsername = "",
}: UsernameModalProps) => {
  const [username, setUsername] = useState(defaultUsername)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // auto-focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80)
      setUsername(defaultUsername)
      setError(null)
      setConfirmed(false)
    }
  }, [open, defaultUsername])

  const handleChange = (val: string) => {
    // only allow valid chars while typing
    const cleaned = val.replace(/[^a-zA-Z0-9_]/g, "").slice(0, MAX_LEN)
    setUsername(cleaned)
    setError(cleaned.length > 0 ? validate(cleaned) : null)
  }

  const handleConfirm = async () => {
    const err = validate(username)
    if (err) {
      setError(err)
      return
    }

    setLoading(true)
    try {
      await onConfirm(username)
      setConfirmed(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading && username.length >= MIN_LEN) {
      handleConfirm()
    }
    if (e.key === "Escape") onSkip()
  }

  const isValid = !error && username.length >= MIN_LEN
  const charCount = username.length

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/93"
      onClick={onSkip}
    >
      <div
        className="relative w-full max-w-md bg-black border border-white/10 rounded-2xl p-6 shadow-[0px_4px_100px_rgba(255,255,255,0.1)] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Close ── */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-white/40 hover:text-white/80 text-xl leading-none transition-colors"
        >
          ✕
        </button>

        {confirmed ? (
          // ── Success state ──
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-2xl">
              ✓
            </div>
            <div>
              <h2 className="text-white font-bold text-lg mb-1">You're all set!</h2>
              <p className="text-white/40 text-sm">
                Welcome, <span className="text-primary font-semibold">@{username}</span>
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <div className="flex flex-col items-center gap-3 mb-6 text-center">
              {/* avatar placeholder */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold select-none">
                {username ? username[0]?.toUpperCase() : "?"}
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">Choose your username</h2>
                <p className="text-white/40 text-sm mt-1">
                  This is how others will see you on the leaderboard
                </p>
              </div>
            </div>

            {/* ── Input ── */}
            <div className="relative mb-2">
              {/* @ prefix */}
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-semibold text-sm select-none">
                @
              </span>
              <input
                ref={inputRef}
                type="text"
                value={username}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="your_username"
                maxLength={MAX_LEN}
                className={`w-full bg-white/5 border rounded-2md pl-8 pr-12 py-3 text-white font-medium text-sm placeholder:text-white/25 focus:outline-none transition-all ${
                  error
                    ? "border-red-500/60 focus:ring-1 focus:ring-red-500/40"
                    : isValid && username.length > 0
                      ? "border-primary/50 focus:ring-1 focus:ring-primary/30"
                      : "border-white/10 focus:ring-1 focus:ring-primary/30"
                }`}
              />
              {/* char counter */}
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-white/25 select-none">
                {charCount}/{MAX_LEN}
              </span>
            </div>

            {/* ── Error / hint ── */}
            <div className="h-5 mb-4">
              {error && username.length > 0 ? (
                <p className="text-red-400 text-[11px] font-medium">{error}</p>
              ) : username.length === 0 ? (
                <p className="text-white/25 text-[11px]">Letters, numbers and underscores only</p>
              ) : isValid ? (
                <p className="text-primary text-[11px] font-medium">✓ Looks good!</p>
              ) : null}
            </div>

            {/* ── Buttons ── */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleConfirm}
                disabled={!isValid || loading}
                className="w-full bg-primary hover:bg-primary/80 text-black font-bold py-3 rounded-2sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Confirm username"
                )}
              </Button>

              <button
                onClick={onSkip}
                disabled={loading}
                className="w-full text-white/35 hover:text-white/60 text-sm font-medium py-2 transition-colors"
              >
                Skip for now
              </button>
            </div>

            {/* ── Footer note ── */}
            <p className="text-white/20 text-[11px] text-center mt-4">
              You can change your username later in settings
            </p>
          </>
        )}
      </div>
    </div>
  )
}
