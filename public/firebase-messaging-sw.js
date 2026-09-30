importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js")

firebase.initializeApp({
  apiKey: "AIzaSyBoCKMmZMDiE_pOU1t778xt4IzTzVVtF-Q",
  authDomain: "outcome-x-poly.firebaseapp.com",
  projectId:"outcome-x-poly",
  messagingSenderId: "240322390664",
  appId: "1:240322390664:web:27c048eead6227f7b00d3d",
})  

const messaging = firebase.messaging()

messaging.onBackgroundMessage(function (payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
  })
})