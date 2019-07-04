/*
	Sydney Train Walks - Overview Map
*/

// create the constructor if needed
var SydneyTrainWalks = SydneyTrainWalks || function() {};

// extend the constructor
SydneyTrainWalks.prototype.Overview = function(parent) {

  // PROPERTIES

  this.parent = parent;
  this.config = parent.config;
  this.overviewMap = null;
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
    // generate the map
    this.overviewMap = new Localmap({
      'container': this.config.overview,
      'legend': null,
      'assetsUrl': null,
      'markersUrl': this.config.local + '/img/marker-{type}.svg',
      'guideUrl': null,
      'routeUrl': null,
      'mapUrl': this.config.local + '/maps/_index.jpg',
      'exifUrl': null,
      'guideData': this.processMarkers(),
      'routeData': this.mergeRoutes(),
      'exifData': null,
      'creditsTemplate': this.config.creditTemplate.innerHTML
    });
    // return the object
    return this;
  };

  this.processMarkers = function() {
    // add "onMarkerClicked" event handlers to markers
    var _this = this;
    GuideData['_index'].markers.map(function(marker) {
      marker.callback = _this.onMarkerClicked.bind(_this, marker.id);
    });
    return GuideData['_index'];
  };

  this.mergeRoutes = function() {
    var routes = {'features':[]};
    // if the GPX data is available anyway
    if (typeof GpxData != 'undefined') {
      // for every walk
      for (var key in GuideData) {
        // only if this isn't an alias
        if (!GuideData[key].local && GuideData[key].gps !== '_index') {
          // add the route
					routes.features = routes.features.concat(GpxData[key].features);
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

};

// return as a require.js module
if (typeof module !== 'undefined') {
  exports = module.exports = SydneyTrainWalks.Overview;
}
