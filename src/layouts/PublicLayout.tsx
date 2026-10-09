import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Outlet, useNavigate } from "react-router"
import { toast } from "sonner"

import type { RootState } from "@/app/store"
import { UsernameModal } from "@/components/auth/UsernameModal"
import { Footer } from "@/components/layout/footer/Footer"
import { Navbar } from "@/components/layout/Navbar"
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
import { useWalletBalance } from "@/hooks/useWalletBalance"
import { listenToMessages, requestFCMToken } from "@/services/firebase/fcm"

export function PublicLayout() {
  const [usernameOpen, setUsernameOpen] = useState(true)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { magic } = useMagic()
  useWalletBalance()
  const [loginToBackend] = useLoginMutation()
  const [submitName] = useSubmitNameMutation()
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
      // Step A: Request FCM token first so we can send it during login
      const fcmToken = await requestFCMToken()
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

    listenToMessages((payload) => {
      console.log("FCM Payload received: ", payload)
      const title = payload.notification?.title ?? payload.data?.title ?? "New notification"
      const body =
        payload.notification?.body ??
        payload.data?.body ??
        payload.data?.message ??
        payload.data?.description ??
        ""
      const redirectUrl = payload.data?.redirectUrl
      // Backend sends numeric type as a string in FCM data; 2 = fill, default = system
      const typeNum = Number(payload.data?.type ?? 3)
      const type = typeNum === 2 ? NOTIFICATION_TYPES.FILL : NOTIFICATION_TYPES.SYSTEM

      // 1. Push into the bell / notification list immediately
      dispatch(addNotification({ type, title, message: body, timestamp: new Date().toISOString() }))

      // 2. Show a foreground toast
      const toastOpts = {
        description: body,
        duration: 4000,
        ...(redirectUrl
          ? {
              action: {
                label: "View →",
                onClick: () => {
                  if (redirectUrl.startsWith("/")) navigate(redirectUrl)
                  else window.open(redirectUrl, "_blank")
                },
              },
            }
          : {}),
      }

      if (typeNum === 2) {
        toast.success(title, toastOpts)
      } else {
        toast.info(title, toastOpts)
      }
    })

    return () => {
      isMounted = false
    }
  }, [magic, dispatch, navigate, loginToBackend])

  return (
    <div className=" bg-background">
      <ToastProvider />
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
