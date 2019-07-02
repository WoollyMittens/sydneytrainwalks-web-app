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
		'overview': document.querySelector('.overview'),
		'creditTemplate': document.getElementById('credit-template')
	});

	// METHODS

	this.init = function() {
		// TODO: generate the map
		this.overviewMap = null;
		// return the object
		return this;
	};

	this.getMarkers = function() {
		var markers = [];
		// for every walk
		for (var key in GuideData) {
			// create a marker between the start and end point
			markers.push({
				'lon': GuideData[key].lon,
				'lat': GuideData[key].lat,
				'id': key
			});
		}
		// return the result
		return markers;
	};

	this.getRoutes = function() {
		var routes = [];
		// if the GPX data is available anyway
		if (typeof GpxData != 'undefined') {
			// for every walk
			for (var key in GuideData) {
				// only if this isn't an alias
				if (!GuideData[key].assets) {
					// TODO: add the route
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
