# Firebase Cloud Messaging (Web) — Get started (converted)

This document is a markdown conversion and concise guide based on the official Firebase documentation: *Get started with Firebase Cloud Messaging — Web*. It includes the common setup steps, recommended code snippets (modular SDK), service worker notes, and examples for sending messages from the server.

---

## Prerequisites

* A Firebase project. Create one in the Firebase Console if you haven't already.
* Your web app registered in the Firebase project (obtain the Firebase config object).
* Your app served over HTTPS (required for service workers and notifications).
* To run code using service workers, you'll need to serve your code via HTTPS

---

## 1. Add Firebase to your web app

Choose either the **npm** (module) approach or the **CDN** approach.

### Using npm (recommended for modern toolchains)

```bash
npm install firebase
```

```js
// src/firebase.js (example)
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'PROJECT_ID.firebaseapp.com',
  projectId: 'PROJECT_ID',
  storageBucket: 'PROJECT_ID.appspot.com',
  messagingSenderId: 'SENDER_ID',
  appId: 'APP_ID',
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
```

### Using the CDN (script tags)

```html
<script type="module">
  import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.x.x/firebase-app.js';
  import { getMessaging } from 'https://www.gstatic.com/firebasejs/9.x.x/firebase-messaging.js';

  const firebaseConfig = { /* ... */ };
  const app = initializeApp(firebaseConfig);
  const messaging = getMessaging(app);
</script>
```

---

## 2. Configure the service worker

Web push notifications require a service worker to receive background messages.

Create a file at the public folder of your served site: `firebase-messaging-sw.js`.

**Example (using compat importScripts for the service worker):**

```js
// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.x.x/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.x.x/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
  messagingSenderId: 'SENDER_ID',
});

const messaging = firebase.messaging();

// Optional: handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize and show notification
  const notificationTitle = payload.notification?.title || 'Background Message Title';
  const notificationOptions = {
    body: payload.notification?.body || 'Background Message body.',
    // icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Optional: handle notificationclick
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // Focus or open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
```

Notes:

* The service worker file must be served from the site root (or from the same scope where you want to receive notifications).
* The `compat` version is commonly used in service workers because `importScripts` is synchronous and works with the compat libraries. Some setups may use modular approaches, but the compat approach remains compatible with many examples.

---

## 3. Register the service worker and request permission

Register the service worker from your main app and then request notification permission and the device token.

```js
// register-sw-and-get-token.js
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from './firebase';

async function registerServiceWorkerAndGetToken(vapidKey = 'YOUR_VAPID_KEY_HERE') {
  try {
    // Register service worker (path depends on where it's hosted)
    await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    // Request permission for notifications
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted.');
    }

    // Get FCM token (requires your public VAPID key from Firebase console)
    const currentToken = await getToken(messaging, { vapidKey });
    if (currentToken) {
      console.log('FCM token:', currentToken);
      // Send this token to your server and save it to send targeted messages
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
    return null;
  }
}

export { registerServiceWorkerAndGetToken };
```

Where to get the VAPID key:

* In the Firebase Console, open Project Settings → Cloud Messaging → Web configuration. Copy the public VAPID key.

---

## 4. Receive messages while the app is in the foreground

Use `onMessage` to listen for messages when your web app has focus.

```js
import { onMessage } from 'firebase/messaging';
import { messaging } from './firebase';

onMessage(messaging, (payload) => {
  console.log('Message received. ', payload);
  // Show in-app UI or notifications
});
```

Note: Background messages are handled in the service worker; foreground messages are handled with `onMessage` in-page.

---

## 5. Sending messages

### Quick: Firebase Console

You can send a test notification directly from the Firebase Console (Cloud Messaging → Send your first message). This is helpful for testing.

### Server: HTTP v1 API (recommended)

Use Google OAuth2 access tokens and the `fcm` v1 endpoint.

**Request**

```http
POST https://fcm.googleapis.com/v1/projects/YOUR_PROJECT_ID/messages:send
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{ "message": {
    "token": "USER_DEVICE_TOKEN",
    "notification": {
      "title": "Hello",
      "body": "World"
    }
  }
}
```

To obtain `ACCESS_TOKEN` server-side, use a service account and the Google OAuth 2.0 workflow (or libraries) to mint a short-lived access token with the appropriate scope (`https://www.googleapis.com/auth/firebase.messaging`).

### Server: Legacy HTTP API (server key)

```http
POST https://fcm.googleapis.com/fcm/send
Authorization: key=YOUR_SERVER_KEY
Content-Type: application/json

{
  "to": "USER_DEVICE_TOKEN",
  "notification": { "title": "Hello", "body": "World" }
}
```

The legacy API uses your Server key (found in Project Settings → Cloud Messaging → Legacy server key) and is simpler for quick tests but less recommended for new integrations.

---

## 6. Tips, caveats and troubleshooting

* Ensure your site is served over HTTPS when not on `localhost`.
* Service worker scope matters: `navigator.serviceWorker.register('/firebase-messaging-sw.js')` registers in public folder at root.
* Tokens can change, so update tokens on your server when you detect changes.
* Use the Firebase Console for quick testing and the HTTP v1 API for production.
* If notifications aren't appearing on mobile devices, check:

  * Notification permission status in browser settings
  * Service worker registration and scope
  * Place register in public folder at root
  * That the app is reachable via HTTPS
  * The VAPID key and token validity

---

## Appendix — common code snippets

### Example: notificationclick handler in the service worker

```js
self.addEventListener('notificationclick', (event) => {
  console.log('=>(firebase-messaging-sw.js:85) event', event);
  event.notification.close();
  const url = event.notification?.data?.deep_link || '/';
  event.waitUntil(self.clients.openWindow('/' + url));
});

```

---

## Where this content comes from

This file was converted from the Firebase documentation page: *Get started with Firebase Cloud Messaging (Web)* and adapted into a concise reference markdown file for quick use and implementation.

<!-- end of document -->
