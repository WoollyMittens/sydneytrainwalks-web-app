import { Localmap } from "./localmap.js";

export class Overview {
  constructor(config, guideIds, loadGuide, loadRoute, updateView) {
    this.parent = parent;
    this.config = config;
    this.overviewMap = null;
    this.awaitTimeout = null;
    this.guideIds = guideIds;
    this.loadGuide = loadGuide;
		this.loadRoute = loadRoute;
		this.updateView = updateView;
    this.overviewElement = document.querySelector('.localmap.overview');
    this.creditTemplate = document.getElementById('credit-template');
    this.init();
  }

  async createMap() {
    // we only want one
    if (this.localmap) return false;
    // generate the map
    this.localmap = new Localmap({
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
      // cache
      'guideData': await this.processMarkers(),
      'routeData': await this.mergeRoutes(),
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

  async processMarkers() {
    // add "onMarkerClicked" event handlers to markers
    let guide = await this.loadGuide('_index');
    // for every marker
    for (let marker of guide.markers) {
      // modify the marker to be a button
      marker.type = 'waypoint';
      marker.description = '';
      marker.callback = this.onMarkerClicked.bind(this, marker.id);
    }
    // return the result
    return guide;
  }

  async mergeRoutes() {
    // create a dummy routes cache
    var routes = {'features':[]};
    // for every walk
    for (let id of this.guideIds) {
      // load the route
      let route = await this.loadRoute(id);
      // add the route
      routes.features = routes.features.concat(route.features);
    }
    // return the result
    return routes;
  }

  onMarkerClicked(id, evt) {
    // update the app for this id
    this.updateView(id, 'map');
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
