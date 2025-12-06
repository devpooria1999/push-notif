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
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload,
  );
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body || 'BODY',
    title: payload.notification.title || 'TITLE.',
    icon: '/firebase-logo.png',
    image: payload.notification.image || '/firebase-logo.png',
    badge: '/firebase-logo.png',
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    data: payload.data,
  });
});

self.addEventListener('notificationclick', (event) => {
  console.log('=>(firebase-messaging-sw.js:85) event', event);
  event.notification.close();
  const url = event.notification?.data?.deep_link || '/';
  console.log('=>(firebase-messaging-sw.js:95) url', url);
  event.waitUntil(self.clients.openWindow(url));
});
