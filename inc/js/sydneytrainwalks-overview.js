import { Localmap } from "./localmap.js";

export class Overview {
  constructor(config, cache, view) {
    this.parent = parent;
    this.config = config;
    this.overviewMap = null;
    this.awaitTimeout = null;
    this.guideCache = cache;
    this.overviewElement = document.querySelector('.localmap.overview');
    this.creditTemplate = document.getElementById('credit-template');
		this.parentView = view;
    this.init();
  }

  createMap() {
    // we only want one
    if (this.localmap) return false;
    // generate the map
    this.localmap = new Localmap({
      'key': '_index',
      'container': this.overviewElement,
      'legend': null,
      // assets
      'thumbsUrl': null,
      'photosUrl': null,
      'markersUrl': this.config.localUrl + '/img/marker-{type}.svg',
      'exifUrl': null,
      'guideUrl': null,
      'routeUrl': null,
      'mapUrl': this.config.localUrl + '/maps/{key}.jpg',
      'tilesUrl': this.config.localUrl + '/tiles/{z}/{x}/{y}.jpg',
      'tilesZoom': 11,
      // TODO: externalise/centralise the cache. what is needed will be cached.
      // cache
      'guideData': this.processMarkers(),
      'routeData': this.mergeRoutes(),
      'exifData': null,
      // offsets
      'distortX': function(x) { return x },
      'distortY': function(y) { return y - (-2 * y * y + 2 * y) / 150 },
      // attribution
      'creditsTemplate': this.creditTemplate.innerHTML,
      // legend
      'supportColour': function(name) {
        var colours = ['red', 'darkorange', 'green', 'teal', 'blue', 'purple', 'black'];
        var index = name.split('').reduce(function(a,b){
          a = (typeof a == 'string') ? a.charCodeAt() : a;
          b = (typeof b == 'string') ? b.charCodeAt() : b;
          return a + b;
        });
        return colours[index % colours.length];
      }
    });
  }

  processMarkers() {
    // add "onMarkerClicked" event handlers to markers
    this.guideCache['_index'].markers.map((marker) => {
      marker.type = 'waypoint';
      marker.description = '';
      marker.callback = this.onMarkerClicked.bind(this, marker.id);
    });
    return this.guideCache;
  }

  // TODO: routes would have to be imported from the entire library
  mergeRoutes() {
    var routes = {'_index':{'features':[]}};
    // if the GPX data is available anyway
    if (typeof GpxData != 'undefined') {
      // for every walk
      for (var key in GpxData) {
        // only if this isn't an alias
        if (!GuideData[key].alias) {
          // add the route
					routes['_index'].features = routes['_index'].features.concat(GpxData[key].features);
        }
      }
    }
    // return the result
    return routes;
  }

  onMarkerClicked(id, evt) {
    // update the app for this id
    this.parentView(id, 'map');
  }

  init() {
    // wait for the viewport to become visible
    new IntersectionObserver((entries, observer) => {
      if (entries[0].intersectionRatio > 0.5) {
        // start the map
        this.createMap();
        // stop waiting
        observer.disconnect();
      }
    }).observe(this.overviewElement);
  }
}
