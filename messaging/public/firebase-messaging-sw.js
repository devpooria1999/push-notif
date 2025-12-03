// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you do not serve/host your project using Firebase Hosting see https://firebase.google.com/docs/web/setup
// Use the CDN bundles so this service worker works even when not hosted
// on Firebase Hosting.
importScripts(
  'https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js',
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js',
);

const addResourcesToCache = async (resources) => {
  const cache = await caches.open('v1');
  await cache.addAll(resources);
};

self.addEventListener('install', (event) => {
  event.waitUntil(addResourcesToCache(['/index.html']));
});
// Initialize the Firebase app in the service worker with the same
// configuration as the main app. Replace values below with your
// project's config from `config.ts` if they change.
firebase.initializeApp({
  apiKey: 'AIzaSyCdYQbXIF_M2m0US25uW9Y5WAyogzO-Js8',
  authDomain: 'push-notif-67601998-e27b7.firebaseapp.com',
  projectId: 'push-notif-67601998-e27b7',
  storageBucket: 'push-notif-67601998-e27b7.firebasestorage.app',
  messagingSenderId: '890893705492',
  appId: '1:890893705492:web:5c124845e7d5976047e201',
  measurementId: 'G-FBR073MF3Q',
});

const messaging = firebase.messaging();

/**
 * Here is is the code snippet to initialize Firebase Messaging in the Service
 * Worker when your app is not hosted on Firebase Hosting.

 // Give the service worker access to Firebase Messaging.
 // Note that you can only use Firebase Messaging here. Other Firebase libraries
 // are not available in the service worker.
 importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
 importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

 // Initialize the Firebase app in the service worker by passing in
 // your app's Firebase config object.
 // https://firebase.google.com/docs/web/setup#config-object
 firebase.initializeApp({
 apiKey: 'api-key',
 authDomain: 'project-id.firebaseapp.com',
 databaseURL: 'https://project-id.firebaseio.com',
 projectId: 'project-id',
 storageBucket: 'project-id.appspot.com',
 messagingSenderId: 'sender-id',
 appId: 'app-id',
 measurementId: 'G-measurement-id',
 });

 // Retrieve an instance of Firebase Messaging so that it can handle background
 // messages.
 const messaging = firebase.messaging();
 **/

// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// Keep in mind that FCM will still show notification messages automatically
// and you should use data messages for custom notifications.
// For more info see:
// https://firebase.google.com/docs/cloud-messaging/concept-options
messaging.onBackgroundMessage(function (payload) {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload,
  );
  // Customize notification here
  // const notificationTitle = 'Background Message Title';

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body || 'BODY',
    title: payload.notification.title || 'TITLE.',
    icon: '/firebase-logo.png',
    image: payload.notification.image || '/firebase-logo.png',
    badge: '/firebase-logo.png',
    requireInteraction: true,
    vibrate: 100000,
    data: payload.data,
  });
});
self.addEventListener('notificationclick', (event) => {
  console.log('=>(firebase-messaging-sw.js:85) event', event);
  event.notification.close();
  const url = event.notification?.data?.deep_link || '/';
  console.log("=>(firebase-messaging-sw.js:95) url", url);
  event.waitUntil(self.clients.openWindow(url));
});
