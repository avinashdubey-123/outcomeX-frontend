import { initializeApp } from "firebase/app"
import { getMessaging, isSupported } from "firebase/messaging"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_API_ID,
}

export const app = initializeApp(firebaseConfig)

// getMessaging() requires ServiceWorker + Notification + IndexedDB.
// Guard with isSupported() so it doesn't crash in unsupported browsers
// or when the page is served over plain HTTP.
export const getMessagingInstance = async () => {
  const supported = await isSupported()
  if (!supported) return null
  return getMessaging(app)
}
