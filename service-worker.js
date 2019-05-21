/*
  Source: https://serviceworke.rs/offline-status_service-worker_doc.html
  Local: /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --user-data-dir=/tmp/foo --ignore-certificate-errors --unsafely-treat-insecure-origin-as-secure=https://local.sydneytrainwalks.com
*/

var CACHE_NAME = 'dependencies-cache';

var REQUIRED_FILES = [
  './index.php',
  './details.php',
  './overview.php',
  './about.php',
  './offline.html',
  './inc/css/styles.css',
  './inc/js/scripts.js',
  './inc/js/exif-data.js',
  './inc/js/guide-data.js',
  './inc/js/gpx-data.js',
  './inc/img/alert.svg',
  './inc/img/background.jpg',
  './inc/img/banner-android.png',
  './inc/img/banner-ios.png',
  './inc/img/base.svg',
  './inc/img/busy.gif',
  './inc/img/button_backward_2.svg',
  './inc/img/button_delete_2.svg',
  './inc/img/close.svg',
  './inc/img/favicon.ico',
  './inc/img/favicon.png',
  './inc/img/forward.svg',
  './inc/img/icon.png',
  './inc/img/info_2.svg',
  './inc/img/languages.svg',
  './inc/img/layers-2x.png',
  './inc/img/layers.png',
  './inc/img/logo.png',
  './inc/img/logo.svg',
  './inc/img/map_1.svg',
  './inc/img/map_2.svg',
  './inc/img/marker-bus.png',
  './inc/img/marker-ferry.png',
  './inc/img/marker-hotel.png',
  './inc/img/marker-icon-2x.png',
  './inc/img/marker-icon.png',
  './inc/img/marker-info.png',
  './inc/img/marker-kiosk.png',
  './inc/img/marker-landmark.png',
  './inc/img/marker-location.png',
  './inc/img/marker-photo.png',
  './inc/img/marker-shadow.png',
  './inc/img/marker-tent.png',
  './inc/img/marker-toilet.png',
  './inc/img/marker-train.png',
  './inc/img/marker-tram.png',
  './inc/img/marker-walk.png',
  './inc/img/marker-warning.png',
  './inc/img/missing.png',
  './inc/img/nature_1.svg',
  './inc/img/nature_2.svg',
  './inc/img/profile_1.svg',
  './inc/img/sign_bus.svg',
  './inc/img/sign_train_3.svg',
  './inc/img/sign_tramway.svg',
  './inc/img/sign_water_transport.svg',
  './inc/img/stability_1.svg'
];

self.addEventListener('install', event => {
  //console.log('install:', REQUIRED_FILES);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(REQUIRED_FILES))
      .then(self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  //console.log('activate:', CACHE_NAME);
  event.waitUntil(
    self.clients.claim()
  );
});

self.addEventListener('fetch', event => {
  //console.log('fetch:', event.request.url);
  event.respondWith(
    caches.match(event.request).then(result => {
      return caches.open(CACHE_NAME).then(cache => {
        return fetch(event.request).then(response => {
          //console.log('fresh:', event.request.url);
          return cache.put(event.request, response.clone()).then(() => {
            return response;
          });
        }).catch(error => {
          //console.log('cached:', event.request.url);
          return result;
        });
      });
    })
  );
});
