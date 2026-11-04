// Shared "enable push notifications" logic for the post-login prompt and the bell dropdown.
// Uses only endpoints that already exist: the backend learns the device token at login,
// so after the user enables notifications we re-run the (silent) Magic login to attach it.

import { useCallback } from "react"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { useLoginMutation } from "@/features/api/auth/authApi"
import { login, selectLoginMethod, setDeviceToken } from "@/features/auth/authSlice"
import { LOGIN_METHODS } from "@/features/auth/authTypes/loginMethodsTypes"
import { useMagic } from "@/features/auth/lib/magic"
import {
  getFCMTokenIfGranted,
  getNotificationPermission,
  requestFCMToken,
} from "@/services/firebase/fcm"

export type EnableResult =
  | "granted" // on, and active for the current session
  | "granted-next-login" // on, but the backend only learns the token at the next sign-in
  | "denied" // blocked in the browser
  | "error"

// "Not now" hides the pre-prompt for a week so we don't nag on every login.
const SNOOZE_KEY = "pushPromptSnoozedUntil"
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000

export const isPushPromptSnoozed = (): boolean => {
  try {
    return Number(localStorage.getItem(SNOOZE_KEY) ?? 0) > Date.now()
  } catch {
    return false
  }
}

export const snoozePushPrompt = (): void => {
  try {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS))
  } catch {
    // storage unavailable (private mode) — worst case we ask again next login
  }
}

export const clearPushPromptSnooze = (): void => {
  try {
    localStorage.removeItem(SNOOZE_KEY)
  } catch {
    // storage unavailable — nothing to clear
  }
}

export const usePushNotifications = () => {
  const dispatch = useAppDispatch()
  const { magic } = useMagic()
  const [loginToBackend] = useLoginMutation()
  const loginMethod = useAppSelector(selectLoginMethod)
  const email = useAppSelector((s) => s.auth.email)
  const publicAddress = useAppSelector((s) => s.auth.publicAddress)

  // Re-runs the Magic login with the new device token and swaps in the new session.
  // Returns false (and keeps the current session) if anything looks off.
  const attachTokenToSession = useCallback(
    async (fcmToken: string): Promise<boolean> => {
      if (!magic) return false
      try {
        const didToken = await magic.user.getIdToken()
        const res = await loginToBackend({ didToken, deviceToken: fcmToken }).unwrap()

        // A 2FA challenge returns a short-lived challenge token, not a login session —
        // never replace the working session with it.
        const data = res.data as { token?: string; requires2fa?: boolean }
        if (data.requires2fa || !data.token) return false

        dispatch(login({ email, publicAddress, loading: false, loginMethod, token: data.token }))
        try {
          if (localStorage.getItem("auth_token")) localStorage.setItem("auth_token", data.token)
        } catch {
          // storage unavailable — redux already has the new token
        }
        return true
      } catch (err) {
        console.warn("Could not attach the device token to the session", err)
        return false
      }
    },
    [magic, loginToBackend, dispatch, email, publicAddress, loginMethod],
  )

  // Stores a fresh token and, where possible, attaches it to the current session.
  const applyToken = useCallback(
    async (fcmToken: string): Promise<EnableResult> => {
      dispatch(setDeviceToken(fcmToken))

      // Wallet (MetaMask) users would need another signature to re-login, so for them the
      // token is picked up at their next sign-in instead.
      const isMagicUser =
        loginMethod === LOGIN_METHODS.Email || loginMethod === LOGIN_METHODS.Google
      if (!isMagicUser) return "granted-next-login"

      return (await attachTokenToSession(fcmToken)) ? "granted" : "granted-next-login"
    },
    [dispatch, loginMethod, attachTokenToSession],
  )

  // Must be called from a click: it triggers the native browser prompt.
  const enable = useCallback(async (): Promise<EnableResult> => {
    const fcmToken = await requestFCMToken()
    if (!fcmToken) return getNotificationPermission() === "denied" ? "denied" : "error"
    return applyToken(fcmToken)
  }, [applyToken])

  // Never prompts. Used when permission was switched to "granted" outside the app (e.g. the
  // user toggled it off and on in the browser): that deletes the old push subscription, so the
  // token stored on the session is dead and a fresh one has to replace it.
  const syncGrantedPermission = useCallback(async (): Promise<EnableResult> => {
    const fcmToken = await getFCMTokenIfGranted()
    if (!fcmToken) return "error"
    return applyToken(fcmToken)
  }, [applyToken])

  return { enable, syncGrantedPermission }
}
