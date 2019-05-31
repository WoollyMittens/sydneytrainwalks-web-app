/*
	Source:
	van Creij, Maurice (2014). "useful.photomap.js: Plots the GPS data of the photos in a slideshow on a map", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.

	Dependencies:
	http://www.leaflet.com/
	https://github.com/mapbox/togeojson
*/

// create the constructor if needed
var useful = useful || {};
useful.Photomap = useful.Photomap || function () {};

// extend the constructor
useful.Photomap.prototype.Indicator = function (parent) {

	// PROPERTIES

	"use strict";
	this.parent = parent;
	this.config = parent.config;
	// this methods
	this.add = function (lat, lon) {
		var icon;
		var map = this.config.map;
		var indicator = this.config.indicator;
		// if the indicator has coordinates
		if (lon && lat) {
			// store the coordinates
			this.lon = lon;
			this.lat = lat;
			// remove any previous indicator
			if (this.object) {
				map.object.removeLayer(this.object);
			}
			// create the icon
			icon = L.icon({
				iconUrl: this.config.indicator,
				iconSize: [28, 28],
				iconAnchor: [14, 28]
			});
			// report the location for reference
			console.log('location:', lat, lon);
			// add the marker with the icon
			this.object = L.marker(
				[this.lat, this.lon],
				{'icon': icon}
			);
			this.object.addTo(map.object);
			// focus the map on the indicator
			this.focus();
		}
	};

	this.remove = function () {
		var map = this.config.map;
		// remove the indicator
		if (this.object) {
			// remove the balloon
			this.object.closePopup();
			map.object.removeLayer(this.object);
			this.object = null;
		}
		// unfocus the indicator
		this.unfocus();
	};

	this.focus = function () {
		// focus the map on the indicator
		this.config.map.object.setView([this.lat, this.lon], this.config.zoom + 2);
		// call for a  redraw
		this.parent.redraw();
	};

	this.unfocus = function () {
		// focus the map on the indicator
		this.config.map.object.setView([this.lat, this.lon], this.config.zoom);
		// call for a  redraw
		this.parent.redraw();
	};
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Photomap.Indicator;
}
