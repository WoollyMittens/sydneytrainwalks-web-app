import { Localmap } from "./localmap.js";

export class Overview {
  constructor(config, guideIds, loadGuide, loadRoute, updateView, updateSearch) {
    this.parent = parent;
    this.config = config;
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
      'mapUrl': null, // this.config.localUrl + '/maps/{key}.jpg',
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
    const markers = [];
    for (let marker of guide.markers) {
      // modify the marker to be a button
      markers.push({
        key: marker.key,
        type: 'waypoint',
        lon: marker.lon,
        lat: marker.lat,
        photo: '',
        callback: this.onMarkerClicked.bind(this, marker.key)
      });
    }
    // add markers for the start stations
    const stationLookup = {};
    const stations = [];
    for (let marker of guide.markers) {
      for (let station of marker.locations) {
        if (!stationLookup[station.location]) {
          stations.push({
            key: station.location,
            type: station.type,
            lon: station.lon,
            lat: station.lat,
            callback: this.onStationClicked.bind(this, station.location)
          });
          stationLookup[station.location] = true;
        }
      }
    }
    // add the stations to the markers
    guide.markers = [...markers, ...stations];
    // return the result
    return guide;
  }

  async mergeRoutes() {
    // create a dummy routes cache
    const routes = {'features':[]};
    // for every walk
    const total = this.guideIds.length;
    for (let index in this.guideIds) {
      // get the guide key
      let key = this.guideIds[index];
      // load the route
      let route = await this.loadRoute(key);
      // update a progress bar
      this.overviewElement.setAttribute('data-progress', Math.round(index / total * 100) + '%');
      // set the keys of the tracks
      for (let feature of route.features) {
        feature.properties.name = key;
      }
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

	updateMeta() {
		// format the guide data
		const title = `Overview map of bushwalks accessible using public transport - Sydney Hiking Trips`;
		const description = `This map shows the bushwalks that are accessible using public transport which are documented in this guide.`;
		const url = `/?screen=overview`;
		// update the route without refreshing
		window.history.pushState({'key': 'overview'}, title, url);
		// update the meta elements
		document.querySelector('title').innerHTML = title;
		document.querySelector('meta[name="description"]')?.setAttribute('content', description);
		document.querySelector('meta[property="og:url"]')?.setAttribute('content', this.config.remoteUrl + '/?screen=overview');
		document.querySelector('meta[property="og:image"]')?.setAttribute('content', this.config.remoteUrl + `/inc/img/favicon.png`);
		document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
		document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
		document.querySelector('link[rel="canonical"]')?.setAttribute('href', this.config.remoteUrl + '/?screen=overview');
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
