import { Localmap } from "./localmap.js";

export class Overview {
  constructor(config, guideIds, loadGuide, loadRoute, updateView, updateSearch) {
    this.parent = parent;
    this.config = config;
    this.overviewMap = null;
    this.awaitTimeout = null;
    this.guideIds = guideIds;
    this.loadGuide = loadGuide;
		this.loadRoute = loadRoute;
		this.updateView = updateView;
    this.updateSearch = updateSearch;
    this.overviewElement = document.querySelector('.overview');
    this.creditTemplate = document.getElementById('credit-template');
    this.init();
  }

  async createMap() {
    // we only want one
    if (this.localmap) return false;
    // clear the container
    this.overviewElement.innerHTML = '';
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
    const guide = await this.loadGuide('_index');
    // for every marker
    for (let marker of guide.markers) {
      // modify the marker to be a button
      marker.type = 'waypoint';
      marker.description = '';
      marker.callback = this.onMarkerClicked.bind(this, marker.key);
    }
    // add markers for the start stations
    const stationLookup = {};
    const startStations = [];
    for (let marker of guide.markers) {
      if (!stationLookup[marker.startLocation]) {
        startStations.push({
          key: marker.startLocation,
          type: marker.startTransport,
          lon: marker.startLon,
          lat: marker.startLat,
          callback: this.onStationClicked.bind(this, marker.startLocation)
        });
        stationLookup[marker.startLocation] = true;
      }
    }
    // add markers for the end stations
    const endStations = [];
    for (let marker of guide.markers) {
      if (!stationLookup[marker.endLocation]) {
        endStations.push({
          key: marker.endLocation,
          type: marker.endTransport,
          lon: marker.endLon,
          lat: marker.endLat,
          callback: this.onStationClicked.bind(this, marker.endLocation)
        });
        stationLookup[marker.endLocation] = true;
      }
    }
    // add the stations to the markers
    guide.markers = [...guide.markers, ...startStations, ...endStations];
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
    this.updateView(id, 'guide');
  }

  onStationClicked(name, evt) {
    // populate the filter with the station name
    this.updateSearch(name);
  }

  init() {
    // wait for the viewport to become visible
    new IntersectionObserver((entries, observer) => {
      if (entries[0].isIntersecting) {
        // start the map
        this.createMap();
        // stop waiting
        observer.disconnect();
      }
    }).observe(this.overviewElement);
  }
}
