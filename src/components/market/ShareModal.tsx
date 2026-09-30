// src/components/market/ShareModal.tsx
// npm install react-icons  ← required

import { useEffect, useRef, useState } from "react"
import { FaLink, FaTelegram, FaWhatsapp } from "react-icons/fa"
import { FaXTwitter } from "react-icons/fa6"

// ── Types ─────────────────────────────────────────────────────────────────────
interface ShareModalProps {
  open: boolean
  onClose: () => void
  title: string
  probability: number // 0–100 e.g. 65
  outcome: string // "Yes" or "No"
}

// ── Constants ─────────────────────────────────────────────────────────────────
const C = {
  bg: "#161a22",
  surface: "#1c2130",
  border: "rgba(255,255,255,0.10)",
  green: "#00c853",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.5)",
  muted2: "rgba(255,255,255,0.2)",
} as const

// ── Share options config ──────────────────────────────────────────────────────
const getShareOptions = (text: string, url: string) => [
  {
    id: "copy",
    label: "Copy link",
    color: "rgba(17, 21, 28,0.6)",
    hover: "rgba(255,255,255,0.13)",
    tcolor: C.text,
    icon: <FaLink size={16} />,
    action: () => navigator.clipboard.writeText(url),
  },
  {
    id: "twitter",
    label: "Share on X",
    color: "rgba(255,255,255,0.08)",
    hover: "rgba(255,255,255,0.5)",
    tcolor: C.text,
    icon: <FaXTwitter size={16} />,
    action: () =>
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        "_blank",
      ),
  },
  {
    id: "telegram",
    label: "Share on Telegram",
    color: "rgba(0,136,204,0.15)",
    hover: "rgba(0,136,204,0.25)",
    tcolor: "#29b6f6",
    icon: <FaTelegram size={18} />,
    action: () =>
      window.open(
        `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
        "_blank",
      ),
  },
  {
    id: "whatsapp",
    label: "Share on WhatsApp",
    color: "rgba(37,211,102,0.12)",
    hover: "rgba(37,211,102,0.22)",
    tcolor: "#25d366",
    icon: <FaWhatsapp size={18} />,
    action: () =>
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, "_blank"),
  },
]

// ── Main component ────────────────────────────────────────────────────────────
export const ShareModal = ({ open, onClose, title, probability, outcome }: ShareModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const url = window.location.href

  const shareText = `"${title}" — ${outcome} at ${probability}% 🎯\nTrade on OutcomeX:`

  const options = getShareOptions(shareText, url)

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

  // reset copied state when modal closes
  useEffect(() => {
    if (!open) setCopied(false)
  }, [open])

  if (!open) return null

  const handleOption = async (opt: ReturnType<typeof getShareOptions>[number]) => {
    if (opt.id === "copy") {
      await opt.action()
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      opt.action()
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlay}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-110 bg-black border border-white/10 rounded-xl overflow-hidden shadow-[0px_4px_100px_0px_#FFFFFF1A] ">
        {/* ── Header ── */}
        <div className="flex items-center justify-between p-6 pt-4 border-b border-b-white/10">
          <span className="font-lg  font-bold text-white ">Share market</span>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-transparent text-xl text-white/60 flex items-center justify-center cursor-pointer"
            onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
          >
            ✕
          </button>
        </div>

        {/* ── Market preview ──
        <div style={{ padding: "16px 20px 0" }}>
          <div style={{
            background:   C.surface,
            border:       `1px solid ${C.border}`,
            borderRadius: 12,
            padding:      "14px 16px",
            display:      "flex",
            flexDirection: "column",
            gap:          8,
          }}>
            <p style={{
              fontSize:   13,
              fontWeight: 600,
              color:      C.text,
              margin:     0,
              lineHeight: 1.5,
              display:    "-webkit-box",
              overflow:   "hidden",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            } as React.CSSProperties}>
              {title}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize:     11,
                fontWeight:   800,
                padding:      "3px 10px",
                borderRadius: 20,
                background:   outcome === "Yes" ? "rgba(0,200,83,0.15)" : "rgba(229,57,53,0.15)",
                color:        outcome === "Yes" ? C.green : "#e53935",
              }}>
                {outcome}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>
                {probability}%
              </span>
              <span style={{ fontSize: 12, color: C.muted }}>probability</span>
            </div>
          </div>
        </div> */}

        {/* ── Share options ── */}
        <div className="p-6 flex flex-col gap-2 ">
          {options.map((opt) => {
            const isCopyDone = opt.id === "copy" && copied
            return (
              <button
                key={opt.id}
                onClick={() => handleOption(opt)}
                className="flex items-center gap-3 rounded-lg py-3 px-4 font-sm  font-semibold cursor-pointer transition-all duration-150  text-left w-full"
                style={{
                  border: `1px solid ${C.border}`,
                  background: isCopyDone ? "rgba(0,200,83,0.12)" : opt.color,
                  color: isCopyDone ? C.green : opt.tcolor,
                }}
                onMouseEnter={(e) => {
                  if (!isCopyDone) e.currentTarget.style.background = opt.hover
                }}
                onMouseLeave={(e) => {
                  if (!isCopyDone) e.currentTarget.style.background = opt.color
                }}
              >
                {/* icon */}
                <span
                  className="flex items-center justify-center w-7 shrink-0 "
                  style={{
                    color: isCopyDone ? C.green : opt.tcolor,
                  }}
                >
                  {isCopyDone ? <span style={{ fontSize: 16 }}>✓</span> : opt.icon}
                </span>

                {/* label */}
                <span>{isCopyDone ? "Link copied!" : opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
