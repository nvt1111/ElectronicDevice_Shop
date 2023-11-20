
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
  apiKey: "AIzaSyBJXwiryfO9WeGAVSFABHboyOTIysigB80",
  authDomain: "push-notification-23d8d.firebaseapp.com",
  projectId: "push-notification-23d8d",
  storageBucket: "push-notification-23d8d.appspot.com",
  messagingSenderId: "753531528602",
  appId: "1:753531528602:web:2e95d5ea57cfa8ddf24623",
  measurementId: "G-57CKR9GDCP"
};

// eslint-disable-next-line no-undef
firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
// eslint-disable-next-line no-undef
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    icon: '/uploads/logo.png-1695573485876.png',
    body: payload.notification.body,
  };

  // eslint-disable-next-line no-restricted-globals
  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
