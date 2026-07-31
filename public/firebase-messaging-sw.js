importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCVD9P_hhnOPU3QAowGmL1RB_CyHPFhduI",
  projectId: "master-dashboard-5d7b9",
  messagingSenderId: "814127742088",
  appId: "1:814127742088:web:b400179db78c231eb6333d"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icon.png',
    requireInteraction: true
  });
});