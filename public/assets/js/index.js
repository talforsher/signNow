// Register service worker to control making site work offline

if('serviceWorker' in navigator) {
  navigator.serviceWorker
           .register('sw.js')
           .then(function() { console.log('Service Worker Registered'); });
}

// Code to handle install prompt on desktop

let deferredPrompt;
const addBtn = document.getElementById('add-button');

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;

  addBtn.addEventListener('click', (e) => {
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
        deferredPrompt = null;
      });
  });
});