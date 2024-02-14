/*
  source: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers
*/

const cacheName = 'cache-20230907';

const contentToCache = [
  './index.html',
  './inc/css/styles.css',
  './inc/js/scripts.js',
  './inc/img/action_redo_1.svg',
  './inc/img/alert.svg',
  './inc/img/amphora.svg',
  './inc/img/army_training.svg',
  './inc/img/attention_1.svg',
  './inc/img/background.jpg',
  './inc/img/bag_bagful.svg',
  './inc/img/banner-android.png',
  './inc/img/banner-ios.png',
  './inc/img/base.svg',
  './inc/img/bidet.svg',
  './inc/img/bridge_1.svg',
  './inc/img/bridge_2.svg',
  './inc/img/bulldozer.svg',
  './inc/img/busy.gif',
  './inc/img/busy.svg',
  './inc/img/button_backward_2.svg',
  './inc/img/button_delete_2.svg',
  './inc/img/cancel_2.svg',
  './inc/img/church.svg',
  './inc/img/close.svg',
  './inc/img/compas_1.svg',
  './inc/img/compas_2.svg',
  './inc/img/count_new.svg',
  './inc/img/crop.svg',
  './inc/img/day_rain.svg',
  './inc/img/drill_perforator.svg',
  './inc/img/duck_rubberduck.svg',
  './inc/img/elevation_5.svg',
  './inc/img/enter.svg',
  './inc/img/escalator.svg',
  './inc/img/eye_1.svg',
  './inc/img/factory_2.svg',
  './inc/img/favicon.ico',
  './inc/img/favicon.png',
  './inc/img/fish.svg',
  './inc/img/flower_3.svg',
  './inc/img/flowers.svg',
  './inc/img/forward.svg',
  './inc/img/fountain_1.svg',
  './inc/img/geography_globe.svg',
  './inc/img/glasses.svg',
  './inc/img/trophy.svg',
  './inc/img/house_3.svg',
  './inc/img/hovel_1.svg',
  './inc/img/icon-close.svg',
  './inc/img/icon-east.svg',
  './inc/img/icon-location.svg',
  './inc/img/icon-north.svg',
  './inc/img/icon-south.svg',
  './inc/img/icon-west.svg',
  './inc/img/icon-zoomin.svg',
  './inc/img/icon-zoomout.svg',
  './inc/img/icon.png',
  './inc/img/info_2.svg',
  './inc/img/lamp_on.svg',
  './inc/img/languages.svg',
  './inc/img/lift_2.svg',
  './inc/img/logo.png',
  './inc/img/logo.svg',
  './inc/img/map_1.svg',
  './inc/img/map_2.svg',
  './inc/img/map_2_inv.svg',
  './inc/img/map_3.svg',
  './inc/img/marker-bus.svg',
  './inc/img/marker-car.svg',
  './inc/img/marker-ferry.svg',
  './inc/img/marker-focus.svg',
  './inc/img/marker-hotel.svg',
  './inc/img/marker-hotspot.svg',
  './inc/img/marker-indicator.svg',
  './inc/img/marker-info.svg',
  './inc/img/marker-kiosk.svg',
  './inc/img/marker-landmark.svg',
  './inc/img/marker-location.svg',
  './inc/img/marker-photo.svg',
  './inc/img/marker-tent.svg',
  './inc/img/marker-toilet.svg',
  './inc/img/marker-train.svg',
  './inc/img/marker-tram.svg',
  './inc/img/marker-walk.svg',
  './inc/img/marker-warning.svg',
  './inc/img/missing.png',
  './inc/img/monkey.svg',
  './inc/img/music_1.svg',
  './inc/img/nature_1.svg',
  './inc/img/nature_2.svg',
  './inc/img/obelisk.svg',
  './inc/img/pen.svg',
  './inc/img/picture.svg',
  './inc/img/pillar.svg',
  './inc/img/play_ping_pong.svg',
  './inc/img/play_repeat.svg',
  './inc/img/profile_1.svg',
  './inc/img/railroad.svg',
  './inc/img/rating.svg',
  './inc/img/rating_high.svg',
  './inc/img/rating_lowstar.svg',
  './inc/img/registered_user.svg',
  './inc/img/rotate_cw_1.svg',
  './inc/img/search.svg',
  './inc/img/sign_bus.svg',
  './inc/img/sign_car.svg',
  './inc/img/sign_train_3.svg',
  './inc/img/sign_tramway.svg',
  './inc/img/sign_water_transport.svg',
  './inc/img/sink_bathroom.svg',
  './inc/img/skull_and_bones.svg',
  './inc/img/skyway.svg',
  './inc/img/smile_wink.svg',
  './inc/img/stability_1.svg',
  './inc/img/station_petrol.svg',
  './inc/img/strategy.svg',
  './inc/img/tank_1.svg',
  './inc/img/tank_2.svg',
  './inc/img/tramway.svg',
  './inc/img/water.svg',
  './inc/img/wet_floor.svg',
  './inc/img/wizard_1.svg'
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
