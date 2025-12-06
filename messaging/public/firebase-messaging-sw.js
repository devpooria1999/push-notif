// /public/firebase-messaging-sw.js

importScripts(
  'https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js',
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js',
);
importScripts('./config-sw.js');

firebase.initializeApp(self.FIREBASE_CONFIG);
const messaging = firebase.messaging();

// THIS IS THE KEY LINE

messaging
  .getToken({
    vapidKey: self.vapidKey,
    serviceWorkerRegistration: self.registration, // ← THIS FIXES IT
  })
  .then((token) => {
    console.log(
      '=>(firebase-messaging-sw.js:16) self.registration',
      self.registration,
    );
    if (token) {
      console.log('FCM Token:', token);
      sendTokenToClients(token);
    } else {
      console.log('No token — permission blocked?');
    }
  })
  .catch((err) => {
    console.error('getToken failed:', err);
  });

// Optional: token refresh
// messaging.onTokenRefresh(() => {
//   messaging
//     .getToken({
//       vapidKey: self.vapidKey,
//       serviceWorkerRegistration: self.registration,
//     })
//     .then(sendTokenToClients);
// });

function sendTokenToClients(token) {
  self.clients
    .matchAll({ type: 'window', includeUncontrolled: true })
    .then((clients) => {
      for (const client of clients) {
        client.postMessage({
          type: 'FCM_TOKEN',
          token,
        });
      }
    });
}

// Background notifications
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'New message';
  const options = {
    body: payload.notification?.body,
    icon: '/favicon.ico',
    data: { url: payload.data?.click_action || '/' },
  };
  self.registration.showNotification(title, options);
});
