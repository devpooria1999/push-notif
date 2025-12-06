// /public/firebase-messaging-sw.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import {
  getMessaging,
  getToken,
  onBackgroundMessage,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging/sw.js';
import './config-sw.js';

const app = initializeApp(self.FIREBASE_CONFIG);
const messaging = getMessaging(app);

getToken(messaging, {
  vapidKey: self.vapidKey,
  serviceWorkerRegistration: self.registration,
})
  .then((token) => token && console.log(token))
  .catch((e) => console.error('Token error:', e));

onBackgroundMessage(messaging, (payload) => {
  console.log('=>(firebase-messaging-sw.js:22) payload', payload);
  const title = payload?.notification?.title || 'Background message';
  const options = {
    body: payload?.notification?.body || '',
    icon: payload?.notification?.image || '/firebase-logo.png',
    image: payload?.notification?.image || '/firebase-logo.png',
    data: payload?.data || {},
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200, 100, 200],
  };

  self.registration.showNotification(title, options);
});

// function sendTokenToMainApp(token) {
//   self.clients
//     .matchAll({ type: 'window', includeUncontrolled: true })
//     .then((clients) => {
//       clients.forEach((client) => {
//         client.postMessage({
//           type: 'FCM_TOKEN',
//           token: token,
//         });
//       });
//     });
// }

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => cache.addAll(['/index.html'])),
  );
});

// Background message handler (customize as needed)
// messaging.onBackgroundMessage(function (payload) {
//   console.log('[firebase-messaging-sw] Received background message: ', payload);
//
//   // If server sends a `notification` object, the browser may auto-display it.
//   // If you send data-only messages, show custom notification here:
//   // if (payload?.notification && Object.keys(payload.notification).length) {
//   //   // browser may have shown it automatically — skip or handle as needed
//   //   return;
//   // }
//
//   const title = payload?.notification?.title || 'Background message';
//   const options = {
//     body: payload?.notification?.body || '',
//     icon: payload?.notification?.image || '/firebase-logo.png',
//     image: payload?.notification?.image || '/firebase-logo.png',
//     data: payload?.data || {},
//     requireInteraction: true,
//     vibrate: [200, 100, 200, 100, 200, 100, 200],
//   };
//
//   self.registration.showNotification(title, options);
// });

self.addEventListener('notificationclick', (event) => {
  console.log('=>(firebase-messaging-sw.js:46) event', event);
  event.notification.close();
  const url = event.notification?.data?.deep_link || '/';
  event.waitUntil(self.clients.openWindow(url));
});
