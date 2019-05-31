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
useful.Photomap.prototype.Markers = function (parent) {

	// PROPERTIES

	"use strict";
	this.parent = parent;
	this.config = parent.config;
	// add the Layer with the permanent markers
	this.add = function () {
		var name, marker, icon;
		// get the track points from the GPX file
		var points = this.parent.gpx.coordinates();
		// for all markers
		var _this = this;
		this.config.markers.map(function (marker, index) {
			// disregard the waypoints with photos
			if (!marker.photo) {
				// create the icon
				icon = L.icon({
					iconUrl: _this.config.marker.replace('{type}', marker.type),
					iconSize: [28, 28],
					iconAnchor: [14, 28]
				});
				// add the marker with the icon
				marker.object = L.marker(
					[marker.lat, marker.lon],
					{'icon': icon}
				);
				marker.object.addTo(_this.config.map.object);
				// if there is a desciption
				if (marker.description) {
					// add the popup to the marker
					marker.popup = marker.object.bindPopup(marker.description);
					// add the click handler
					marker.object.on('click', _this.onMarkerClicked(marker));
				}
			}
		});
	};

	this.onMarkerClicked = function (marker) {
		var _this = this;
		return function (evt) {
			// show the marker message in a balloon
			marker.object.openPopup();
		};
	};
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Photomap.Markers;
}
