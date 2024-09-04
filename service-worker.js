/*
  source: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers
*/

const cacheName = 'cache-20230907';

const contentToCache = [
  './index.html',
  './inc/css/styles.css'
];

self.addEventListener('install', (e) => {
  //console.log('[Service Worker] Install');
  e.waitUntil(caches.open(cacheName).then((cache) => {
    //console.log('[Service Worker] Caching all: app shell and content');
    return cache.addAll(contentToCache);
  }));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keyList) => {
    return Promise.all(keyList.map((key) => {
      if (key !== cacheName) {
        return caches.delete(key);
      }
    }));
  }));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((r) => {
    //console.log('[Service Worker] Fetching resource: ' + e.request.url);
    return r || fetch(e.request).then((response) => {
      return caches.open(cacheName).then((cache) => {
        //console.log('[Service Worker] Caching new resource: ' + e.request.url);
        cache.put(e.request, response.clone());
        return response;
      });
    });
  }));
});
