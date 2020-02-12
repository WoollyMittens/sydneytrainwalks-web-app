// extend the class
SydneyTrainWalks.prototype.Overview = function (parent) {

  // PROPERTIES

  this.parent = parent;
  this.config = parent.config;
  this.overviewMap = null;
  this.awaitTimeout = null;
  this.config.extend = function(properties) {
    for (var name in properties) {
      this[name] = properties[name];
    }
  };
  this.config.extend({
    'overview': document.querySelector('.localmap.overview'),
    'creditTemplate': document.getElementById('credit-template')
  });

  // METHODS

  this.init = function() {
    // wait for the viewport to become visible
    var observer = this.awaitView.bind(this);
    var mutationObserver = new MutationObserver(observer);
    mutationObserver.observe(document.body, {
      'attributes': true,
      'attributeFilter': ['id', 'class', 'style'],
      'subtree': true
    });
    // try at least once
    this.awaitView();
  };

  this.awaitView = function(mutations, observer) {
    var overview = this.config.overview;
    var resolver = this.createMap.bind(this);
    clearTimeout(this.awaitTimeout);
    this.awaitTimeout = setTimeout(function() {
      if (overview.getBoundingClientRect().right > 0) {
        // generate the map
        resolver();
        // stop waiting
        if(observer) observer.disconnect();
      }
    }, 100);
  };

  this.createMap = function() {
    // we only want one
    if (this.localmap) return false;
    // generate the map
    this.localmap = new Localmap({
      'key': '_index',
      'container': this.config.overview,
      'legend': null,
      // assets
      'thumbsUrl': null,
      'photosUrl': null,
      'markersUrl': this.config.local + '/img/marker-{type}.svg',
      'exifUrl': null,
      'guideUrl': null,
      'routeUrl': null,
      'mapUrl': this.config.local + '/maps/{key}.jpg',
      'tilesUrl': this.config.local + '/tiles/{z}/{x}/{y}.jpg',
      'tilesZoom': 11,
      // cache
      'guideData': this.processMarkers(),
      'routeData': this.mergeRoutes(),
      'exifData': null,
      // attribution
      'creditsTemplate': this.config.creditTemplate.innerHTML
    });
  };

  this.processMarkers = function() {
    // add "onMarkerClicked" event handlers to markers
    var _this = this;
    GuideData['_index'].markers.map(function(marker) {
      marker.description = '';
      marker.callback = _this.onMarkerClicked.bind(_this, marker.id);
    });
    return GuideData;
  };

  this.mergeRoutes = function() {
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
  };

  // EVENTS

  this.onMarkerClicked = function(id, evt) {
    // update the app for this id
    this.parent.update(id, 'map');
  };

  if(parent) this.init();

};
