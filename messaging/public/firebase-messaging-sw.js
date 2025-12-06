// /public/firebase-messaging-sw.js
importScripts(
  'https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js',
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js',
);
// load your constants (must set them on `self` inside config-sw.js)
importScripts('/config-sw.js');

firebase.initializeApp(self.FIREBASE_CONFIG);
const messaging = firebase.messaging();

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => cache.addAll(['/index.html'])),
  );
});

// Background message handler (customize as needed)
messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw] Received background message: ', payload);

  // If server sends a `notification` object, the browser may auto-display it.
  // If you send data-only messages, show custom notification here:
  if (payload?.notification && Object.keys(payload.notification).length) {
    // browser may have shown it automatically — skip or handle as needed
    return;
  }

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

self.addEventListener('notificationclick', (event) => {
  console.log('=>(firebase-messaging-sw.js:46) event', event);
  event.notification.close();
  const url = event.notification?.data?.deep_link || '/';
  event.waitUntil(self.clients.openWindow(url));
});
