importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js")

firebase.initializeApp({
  apiKey: "AIzaSyCCpVLsGWPXGajTRmevW9RnA02YK6ObJhg",
  authDomain: "outcome-x-a8075.firebaseapp.com",
  projectId: "outcome-x-a8075",
  messagingSenderId: "224090784456",
  appId: "1:224090784456:web:361df2bb98b4655ad21bfd"
});

// Apply an updated worker straight away instead of waiting for every tab to close.
self.addEventListener("install", () => self.skipWaiting())
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()))

// Open the notification's link when it is clicked. Registered BEFORE firebase.messaging() so it
// runs ahead of the SDK's own click handler, which only opens `fcmOptions.link` (the backend
// sends the link as data.redirectUrl instead). Links are limited to this site's own origin.
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const data = event.notification.data
  const link = data && data.FCM_MSG && data.FCM_MSG.data && data.FCM_MSG.data.redirectUrl

  let target = new URL("/", self.location.origin)
  try {
    const candidate = new URL(link || "/", self.location.origin)
    if (candidate.origin === self.location.origin) target = candidate
  } catch (e) {
    // malformed link — fall back to the app root
  }

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      const open = windowClients.find((c) => new URL(c.url).origin === self.location.origin)
      if (!open) return self.clients.openWindow(target.href)

      // An app tab is already open: bring it to the front and ask the app to route to the
      // market (client-side, no reload). WindowClient.navigate() is unreliable for tabs the
      // worker doesn't control, so the page does the routing itself.
      return open.focus().then((focused) => {
        const client = focused || open
        client.postMessage({
          type: "PUSH_NOTIFICATION_CLICK",
          path: target.pathname + target.search + target.hash,
        })
      })
    }),
  )
})

// Creating the messaging instance is what registers Firebase's push handler. Because the
// backend sends a `notification` payload, Firebase shows the notification itself. Do NOT call
// showNotification again in onBackgroundMessage: that is what produced every push twice.
firebase.messaging()
