self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open('video-store').then(function(cache) {
      return cache.addAll([
        '/index.html',
        '/VIP-interpreter-area.html',
        '/assets/interPage.js',
        '/assets/index.js',
        '/assets/script.js',
        '/logo/logo_blue192.png',
        '/logo/logo_blue512.png',
        '/logo/logo1400.png'
      ]);
    })
  );
 });
 
 self.addEventListener('fetch', function(e) {
   console.log(e.request.url);
   e.respondWith(
     caches.match(e.request).then(function(response) {
       return response || fetch(e.request);
     })
   );
 });