const CACHE_NAME = 'my-restaurant';

const urlsToCache = [
  './',
  './css/output.css',
  './js/main.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});


self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchRes => {
        return caches.open(CACHE_NAME).then(cache => {

          if (event.request.url.includes('themealdb.com/images')) {
            cache.put(event.request.url, fetchRes.clone());
          }
          return fetchRes;
        });
      });
    })
  );
});
