import { getToken, type MessagePayload, type Messaging, onMessage } from "firebase/messaging"

import { getMessagingInstance } from "./firebase"

export type NotificationPermissionState = NotificationPermission | "unsupported"

export const getNotificationPermission = (): NotificationPermissionState =>
  typeof Notification === "undefined" ? "unsupported" : Notification.permission

// True when this browser can actually receive FCM pushes. Used to avoid asking
// for a permission that could never work (e.g. Brave defaults, iOS Safari tabs).
export const isPushSupported = async (): Promise<boolean> => (await getMessagingInstance()) !== null

// Registers the service worker and exchanges it for an FCM token.
// Only call once notification permission has been granted.
const fetchToken = async (messaging: Messaging): Promise<string | null> => {
  try {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js")
    await navigator.serviceWorker.ready

    return await getToken(messaging, {
      vapidKey: import.meta.env.VITE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    })
  } catch (err) {
    console.error(err)
    return null
  }
}

// Shows the native browser permission prompt, then returns a token if granted.
// Must be called from a user gesture (the "Enable notifications" button) — never on page load.
export const requestFCMToken = async (): Promise<string | null> => {
  const messaging = await getMessagingInstance()
  if (!messaging) return null

  const permission = await Notification.requestPermission()
  if (permission !== "granted") return null

  return fetchToken(messaging)
}

// Never prompts. Returns a token only when permission was already granted earlier,
// so it is safe to call on page load.
export const getFCMTokenIfGranted = async (): Promise<string | null> => {
  const messaging = await getMessagingInstance()
  if (!messaging) return null
  if (getNotificationPermission() !== "granted") return null

  return fetchToken(messaging)
}

// onPayload is called for every foreground message received.
// Resolves to an unsubscribe function (undefined when messaging is unsupported).
export const listenToMessages = async (
  onPayload?: (payload: MessagePayload) => void,
): Promise<(() => void) | undefined> => {
  const messaging = await getMessagingInstance()
  if (!messaging) {
    console.warn("Firebase Messaging is not supported in this browser.")
    return undefined
  }

  return onMessage(messaging, (payload) => {
    onPayload?.(payload)
  })
}
