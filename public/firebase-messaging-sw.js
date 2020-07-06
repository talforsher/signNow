// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you do not serve/host your project using Firebase Hosting see https://firebase.google.com/docs/web/setup
importScripts('/__/firebase/7.13.1/firebase-app.js');
importScripts('/__/firebase/7.13.1/firebase-messaging.js');
importScripts('/__/firebase/init.js');



// [START initialize_firebase_in_sw]
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/7.13.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.13.1/firebase-messaging.js');
// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyAEY5uV17wbuhnewtN3_lwFXWX1dmbVQyU",
  authDomain: "signnow-app.firebaseapp.com",
  databaseURL: "https://signnow-app.firebaseio.com",
  projectId: "signnow-app",
  storageBucket: "signnow-app.appspot.com",
  messagingSenderId: "234114284988",
  appId: "1:234114284988:web:e5b781e90d99cd714a3fb9",
  measurementId: "G-V7FV2WCQEC"
});
// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();
// [END initialize_firebase_in_sw]

// Handle incoming messages. Called when:
// - a message is received while the app has focus
// - the user clicks on an app notification created by a service worker
//   `messaging.setBackgroundMessageHandler` handler.

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = 'SignNow';
  const notificationOptions = {
    body: 'בקשת תרגום',
    icon: '/logo/logo_blue192.png'
  };

  return self.registration.showNotification(notificationTitle,
    notificationOptions);
});