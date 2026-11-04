// src/components/notifications/NotificationPermissionModal.tsx
// Soft pre-prompt shown after login. Only "Enable notifications" triggers the native
// browser prompt, so "Not now" never burns the browser's one-shot permission block.
// Matches the UsernameModal / LoginModal design language.

import { Bell, BellOff, Check } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import type { EnableResult } from "@/hooks/notifications/usePushNotifications"
import { getNotificationPermission } from "@/services/firebase/fcm"

interface NotificationPermissionModalProps {
  open: boolean
  // Runs the native prompt + token registration. Must happen from this click.
  onEnable: () => Promise<EnableResult>
  onClose: () => void
  // The browser already blocked notifications for this site, so the native prompt can't be
  // shown again. Open straight on the "how to unblock" screen instead.
  blocked?: boolean
}

const BENEFITS = ["When your orders are filled", "When a market you traded resolves"]

type Phase = "ask" | "loading" | EnableResult

export const NotificationPermissionModal = ({
  open,
  onEnable,
  onClose,
  blocked = false,
}: NotificationPermissionModalProps) => {
  const [phase, setPhase] = useState<Phase>(blocked ? "denied" : "ask")

  useEffect(() => {
    if (open) setPhase(blocked ? "denied" : "ask")
  }, [open, blocked])

  // success states close themselves
  useEffect(() => {
    if (phase !== "granted" && phase !== "granted-next-login") return
    const t = setTimeout(onClose, 2200)
    return () => clearTimeout(t)
  }, [phase, onClose])

  if (!open) return null

  const loading = phase === "loading"

  const handleEnable = async () => {
    setPhase("loading")
    try {
      const result = await onEnable()
      // The browser permission is what the user chose. If it is granted, don't show a failure
      // screen just because the push token couldn't be fetched right now — close quietly.
      if (result === "error" && getNotificationPermission() === "granted") {
        onClose()
        return
      }
      setPhase(result)
    } catch {
      if (getNotificationPermission() === "granted") {
        onClose()
        return
      }
      setPhase("error")
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={loading ? undefined : onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notif-modal-title"
        className="relative w-full max-w-md bg-black border border-white/10 rounded-2xl p-6 shadow-[0px_4px_100px_rgba(16,210,96,0.12)] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
          className="absolute top-4 right-4 text-white/40 hover:text-white/80 text-xl leading-none transition-colors disabled:opacity-40"
        >
          ✕
        </button>

        {(phase === "granted" || phase === "granted-next-login") && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Check className="text-primary" size={26} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg mb-1">Notifications are on</h2>
              <p className="text-white/40 text-sm">
                {phase === "granted"
                  ? "We'll let you know when something happens."
                  : "They'll start working the next time you sign in with your wallet."}
              </p>
            </div>
          </div>
        )}

        {(phase === "denied" || phase === "error") && (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <BellOff className="text-white/60" size={24} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg mb-1">
                {phase === "denied" ? "Notifications are blocked" : "Couldn't turn them on"}
              </h2>
              {phase === "denied" ? (
                <>
                  <p className="text-white/40 text-sm">
                    Your browser is blocking alerts for this site, so we can't ask again. To turn
                    them on:
                  </p>
                  <ol className="mt-3 flex flex-col gap-2 text-left text-sm text-white/70">
                    {[
                      "Click the lock (or tune) icon left of the address bar",
                      "Set Notifications to Allow",
                      "Reload this page",
                    ].map((step, i) => (
                      <li key={step} className="flex items-center gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold text-primary">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <p className="text-white/40 text-sm">
                  push notifications This browser may not support . You can try again later from the
                  bell menu.
                </p>
              )}
            </div>
            <Button
              onClick={onClose}
              className="w-full bg-white/10 hover:bg-white/15 text-white font-semibold py-3 rounded-2sm"
            >
              Got it
            </Button>
          </div>
        )}

        {(phase === "ask" || phase === "loading") && (
          <>
            <div className="flex flex-col items-center gap-3 mb-5 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,210,96,0.25)]">
                <Bell className="text-primary" size={24} />
              </div>
              <div>
                <h2 id="notif-modal-title" className="font-bold text-white text-lg">
                  Turn on notifications
                </h2>
                <p className="text-white/40 text-sm mt-1">
                  Get an instant alert, even when this tab is in the background.
                </p>
              </div>
            </div>

            <ul className="flex flex-col gap-2.5 mb-6">
              {BENEFITS.map((b) => (
                <li
                  key={b}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2md px-4 py-3 text-sm text-white/80"
                >
                  <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Check className="text-primary" size={12} strokeWidth={3} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleEnable}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/80 text-black font-bold py-3 rounded-2sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                    Waiting for your browser…
                  </>
                ) : (
                  "Enable notifications"
                )}
              </Button>
              <button
                onClick={onClose}
                disabled={loading}
                className="w-full text-white/35 hover:text-white/60 text-sm font-medium py-2 transition-colors disabled:opacity-40"
              >
                Not now
              </button>
            </div>

            <p className="text-white/20 text-[11px] text-center mt-4">
              You can change this anytime in your browser settings.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
