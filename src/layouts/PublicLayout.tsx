import { AlertCircle, Bell, Eye } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Outlet, useNavigate } from "react-router"
import { toast } from "sonner"

import type { RootState } from "@/app/store"
import { UsernameModal } from "@/components/auth/UsernameModal"
import { Footer } from "@/components/layout/footer/Footer"
import { Navbar } from "@/components/layout/Navbar"
import { NotificationPermissionModal } from "@/components/notifications/NotificationPermissionModal"
import { ToastProvider } from "@/components/ui/ToastProvider"
import {
  useLoginMutation,
  useProfileQuery,
  useSubmitNameMutation,
} from "@/features/api/auth/authApi"
import { useGetMarketsQuery } from "@/features/api/markets/marketApi"
import { useGetNotificationsQuery } from "@/features/api/notifications/notificationApi"
import { checkAuth } from "@/features/auth/authChecks"
import { setDeviceToken } from "@/features/auth/authSlice"
import { useMagic } from "@/features/auth/lib/magic"
import { setBookmarkedIds, setMarkets } from "@/features/markets/marketSlice"
import { NOTIFICATION_TYPES } from "@/features/notifications/notificationConstants"
import { addNotification } from "@/features/notifications/notificationSlice"
import {
  clearPushPromptSnooze,
  isPushPromptSnoozed,
  snoozePushPrompt,
  usePushNotifications,
} from "@/hooks/notifications/usePushNotifications"
import { useWalletBalance } from "@/hooks/useWalletBalance"
import {
  getFCMTokenIfGranted,
  getNotificationPermission,
  isPushSupported,
  listenToMessages,
} from "@/services/firebase/fcm"

export function PublicLayout() {
  const [usernameOpen, setUsernameOpen] = useState(true)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { magic } = useMagic()
  useWalletBalance()
  const [loginToBackend] = useLoginMutation()
  const [submitName] = useSubmitNameMutation()
  const { enable: enablePush, syncGrantedPermission } = usePushNotifications()
  const [pushPromptOpen, setPushPromptOpen] = useState(false)
  const [pushPromptBlocked, setPushPromptBlocked] = useState(false)
  const { data: markets } = useGetMarketsQuery()

  // Get token explicitly to prevent premature API execution before authentication completes
  const token = useSelector((state: RootState) => state.auth.token)
  const email = useSelector((state: RootState) => state.auth.email)
  // Removed unused deviceToken and apiNotifications
  const { data: profile } = useProfileQuery(undefined, { skip: !token })
  useGetNotificationsQuery(undefined, { skip: !token })

  useEffect(() => {
    if (markets) {
      dispatch(setMarkets(markets))
      const bookmarked = markets.filter((m) => m.isBookmarked).map((m) => m.id)
      dispatch(setBookmarkedIds(bookmarked))
    }
  }, [markets, dispatch])
  // 1. Auth check & FCM Setup
  useEffect(() => {
    let isMounted = true

    const init = async () => {
      // Step A: Reuse the FCM token if the user already allowed notifications, so it is
      // sent at login. Never prompts here — the prompt is shown after login instead.
      const fcmToken = await getFCMTokenIfGranted()
      if (fcmToken && isMounted) {
        dispatch(setDeviceToken(fcmToken))
        console.log("token from fcm :", fcmToken)
      }

      // Step B: Now check auth, passing the token if we have it
      if (magic && isMounted) {
        void checkAuth(magic, dispatch, loginToBackend, fcmToken)
      }
    }

    init()

    let unsubscribeMessages: (() => void) | undefined
    void listenToMessages((payload) => {
      console.log("FCM Payload received: ", payload)
      const title = payload.notification?.title ?? payload.data?.title ?? "New notification"
      const body =
        payload.notification?.body ??
        payload.data?.body ??
        payload.data?.message ??
        payload.data?.description ??
        ""
      // Backend sends numeric type as a string in FCM data; 2 = fill, default = system
      const typeNum = Number(payload.data?.type ?? 3)
      const type = typeNum === 2 ? NOTIFICATION_TYPES.FILL : NOTIFICATION_TYPES.SYSTEM
      const redirectUrl = payload.data?.redirectUrl

      // 1. Push into the bell / notification list immediately
      dispatch(addNotification({ type, title, message: body, timestamp: new Date().toISOString() }))

      // 2. Show a foreground toast: green by default, red for cancelled / failed events.
      // Only the title is checked — descriptions contain market names that could match by chance.
      const isNegative = /cancel|fail|reject/i.test(title)
      const showToast = isNegative ? toast.error : toast.success
      showToast(title, {
        description: body,
        duration: 7000,
        className: isNegative ? "push-toast push-toast-error" : "push-toast",
        icon: isNegative ? (
          <AlertCircle className="app-toast-icon-svg" />
        ) : (
          <Bell className="app-toast-icon-svg" />
        ),
        ...(redirectUrl
          ? {
              action: {
                label: <Eye size={16} strokeWidth={2.5} aria-label="View" />,
                onClick: () => {
                  // Backend links are absolute (CLIENT_URL + path). Stay in the SPA when the
                  // link points at this app, otherwise open it in a new tab.
                  try {
                    const url = new URL(redirectUrl, window.location.origin)
                    if (url.origin === window.location.origin) navigate(url.pathname + url.search)
                    else window.open(url.href, "_blank")
                  } catch {
                    window.open(redirectUrl, "_blank")
                  }
                },
              },
            }
          : {}),
      })
    }).then((unsubscribe) => {
      unsubscribeMessages = unsubscribe
      if (!isMounted) unsubscribe?.()
    })

    return () => {
      isMounted = false
      unsubscribeMessages?.()
    }
  }, [magic, dispatch, navigate, loginToBackend])

  // Pre-prompt for notifications after login. Waits for the username modal (first login)
  // so the two never stack, skips browsers that can't receive pushes, and honours "Not now".
  const onboardingPending = usernameOpen && profile?.data.onboardingStatus === 1
  useEffect(() => {
    if (import.meta.env.DEV) {
      // Shows exactly which condition is holding the pre-prompt back.
      console.info("[push-prompt] gates", {
        loggedIn: !!token,
        profileLoaded: !!profile,
        usernameModalPending: onboardingPending,
        permission: getNotificationPermission(), // must be "default"
        snoozed: isPushPromptSnoozed(), // must be false
      })
    }
    if (!token) {
      setPushPromptOpen(false)
      return
    }
    if (!profile || onboardingPending) return
    // "granted": nothing to ask. "default": show the pre-prompt. "denied": the browser won't
    // show its prompt again, so show the unblock instructions instead.
    const permission = getNotificationPermission()
    if (permission === "granted") {
      setPushPromptOpen(false)
      // Already on. Drop any old snooze so the prompt can return if the permission is reset later.
      clearPushPromptSnooze()
      return
    }
    if (permission !== "default" && permission !== "denied") return
    // Only a blocked site is snoozed (the unblock instructions are a nag). While the site is
    // still on "Ask", keep offering the prompt on every login.
    if (permission === "denied" && isPushPromptSnoozed()) return

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    isPushSupported()
      .catch(() => false)
      .then((supported) => {
        if (import.meta.env.DEV) console.info("[push-prompt] browser supports push:", supported)
        if (!supported || cancelled) return
        timer = setTimeout(() => {
          setPushPromptBlocked(permission === "denied")
          setPushPromptOpen(true)
        }, 1200)
      })
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [token, profile, onboardingPending])

  // Clicking a system push notification focuses this tab; the service worker then asks the app
  // to route to the notification's link (e.g. /event/<marketId>).
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return
    const onWorkerMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; path?: unknown } | null
      if (data?.type === "PUSH_NOTIFICATION_CLICK" && typeof data.path === "string") {
        navigate(data.path)
      }
    }
    navigator.serviceWorker.addEventListener("message", onWorkerMessage)
    return () => navigator.serviceWorker.removeEventListener("message", onWorkerMessage)
  }, [navigate])

  // The user can flip the site's notification permission in the browser while the app is open
  // (off → on). That deletes the old push subscription, so the token saved on the backend
  // session is dead. Listen for the change and swap in a fresh token.
  useEffect(() => {
    if (!token || !("permissions" in navigator)) return

    let status: PermissionStatus | undefined
    let cancelled = false
    const onChange = () => {
      if (getNotificationPermission() === "granted") void syncGrantedPermission()
    }

    navigator.permissions
      .query({ name: "notifications" })
      .then((result) => {
        if (cancelled) return
        status = result
        result.addEventListener("change", onChange)
      })
      .catch(() => undefined) // Permissions API not available for notifications here

    return () => {
      cancelled = true
      status?.removeEventListener("change", onChange)
    }
  }, [token, syncGrantedPermission])

  const closePushPrompt = useCallback(() => {
    // Only the "blocked" instructions are snoozed. A site still on "Ask" is offered again next
    // login, and a granted one has nothing to snooze (it would hide the prompt after a reset).
    if (getNotificationPermission() === "denied") snoozePushPrompt()
    setPushPromptOpen(false)
  }, [])

  return (
    <div className=" bg-background">
      <ToastProvider />
      <NotificationPermissionModal
        open={pushPromptOpen}
        blocked={pushPromptBlocked}
        onEnable={enablePush}
        onClose={closePushPrompt}
      />
      <main>
        {
          <UsernameModal
            open={usernameOpen && profile?.data.onboardingStatus === 1 && token != null}
            defaultUsername={email?.split("@")[0]}
            onConfirm={async (username: string) => {
              await submitName({ name: username }).unwrap()
              setTimeout(() => setUsernameOpen(false), 1500)
            }}
            onSkip={() => setUsernameOpen(false)}
          ></UsernameModal>
        }
        <Navbar />
        <Outlet />
        <Footer />
      </main>
    </div>
  )
}
