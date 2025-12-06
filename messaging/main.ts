// main.ts — NO firebase/* imports! Bundle stays clean!

async function initPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
      {
        type: 'module',
      },
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
        sendTokenToServer(token);
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

function sendTokenToServer(token: string) {
  // your API call
  fetch('/api/save-fcm-token', {
    method: 'POST',
    body: JSON.stringify({ token }),
    headers: { 'Content-Type': 'application/json' },
  });
}

// Call it
initPush();
