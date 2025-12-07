// main.ts — NO firebase/* imports! Bundle stays clean!

async function initPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
    );
    console.log('=>(main.ts:11) registration', registration);
    await navigator.serviceWorker.ready;

    console.log('Service Worker registered');

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'FCM_TOKEN') {
        const token = event.data.token;
        console.log('Received FCM token in main app:', token);
        // Send to your backend
      }
    });

    // Optional: request permission (triggers getToken in SW)
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted');
      // Token will be sent automatically via postMessage
    }
  } catch (err) {
    console.error('SW registration failed:', err);
  }
}

document
  .getElementById('request-permission-button')!
  .addEventListener('click', initPush);

// Call it
initPush();
