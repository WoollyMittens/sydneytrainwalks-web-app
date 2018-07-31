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
	this.overviewMarker = null;
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
		var a, b;
		// get the markers from the exif data
		var markers = this.getMarkers();
		// calculate the bounds of the map
		var bounds = this.getBounds(markers);
		// start a map
		var map = L.map(this.config.overview.id);
		// add the scale
		L.control.scale({imperial:false}).addTo(map);
		// add the tiles
		var tiles = L.tileLayer(this.config.onlineTiles, {
			attribution: this.config.creditTemplate.innerHTML,
			errorTileUrl: this.config.missing,
			minZoom: 8,
			maxZoom: 15
		}).addTo(map);
		// add a fallback for offline mode
		tiles.on('tileloadstart', this.onTileFailure.bind(this, this.config.offlineTiles));
		// create an icon
		var icon = L.icon({
			iconUrl: "./inc/img/marker-walk.png",
			iconSize: [28, 28],
			iconAnchor: [14, 28]
		});
		// add the markers
		var marker;
		for (a = 0, b = markers.length; a < b; a += 1) {
			// add the marker with the icon
			marker = L.marker([
				markers[a].lat,
				markers[a].lon
			], {
				'icon': icon,
				'title': markers[a].id
			});
			marker.addTo(map);
			marker.on('click', this.onMarkerClicked.bind(this, markers[a].id));
		}
		// limit the bounds
		map.fitBounds([
			[bounds.minLat, bounds.minLon],
			[bounds.maxLat , bounds.maxLon]
		]);
		map.setMaxBounds([
			[bounds.minLat, bounds.minLon],
			[bounds.maxLat, bounds.maxLon]
		]);
		map.setView([bounds.avgLat, bounds.avgLon], 8);
		// watch the location
		this.watchLocation();
		// return the object
		this.overviewMap = map;
		return this;
	};

	this.getMarkers = function() {
		var route,
			landmarks,
			markers = [],
			prefix,
			photo;
		// for every walk
		for (route in GuideData) {
			// get the source of the assets
			prefix = (GuideData[route].assets) ? GuideData[route].assets.prefix : route;
			// pick a point halfway through the route
			landmarks = Object.keys(GuideData[route].landmarks);
			photo = landmarks[parseInt(landmarks.length/2)].toLowerCase() + '.jpg';
			// create a marker between the start and end point
			markers.push({
				'lon': ExifData[prefix][photo].lon,
				'lat': ExifData[prefix][photo].lat,
				'id': route
			});
		}
		// return the result
		return markers;
	};

	this.getBounds = function(markers) {
		var minLat = 999,
			minLon = 999,
			maxLat = -999,
			maxLon = -999,
			totLat = 0,
			totLon = 0;
		// calculate the bounds of the map
		for (a = 0, b = markers.length; a < b; a += 1) {
			minLon = (markers[a].lon < minLon) ? markers[a].lon : minLon;
			minLat = (markers[a].lat < minLat) ? markers[a].lat : minLat;
			maxLon = (markers[a].lon > maxLon) ? markers[a].lon : maxLon;
			maxLat = (markers[a].lat > maxLat) ? markers[a].lat : maxLat;
			totLat += markers[a].lat;
			totLon += markers[a].lon;
		}
		// return the result
		return {
			'minLat': minLat - 0.3,
			'maxLat': maxLat + 0.3,
			'minLon': minLon - 0.3,
			'maxLon': maxLon + 0.3,
			'avgLat': totLat / markers.length,
			'avgLon': totLon / markers.length
		};
	};

	this.watchLocation = function(evt) {
		// if geolocation is available
		if (navigator.geolocation) {
			// request the position
			navigator.geolocation.watchPosition(
				this.onGeoSuccess(),
				this.onGeoFailure(),
				{ maximumAge : 10000,  timeout : 5000,  enableHighAccuracy : true }
			);
		}
	};

	// EVENTS

	this.onMarkerClicked = function(id, evt) {
		// update the app for this id
		this.parent.update(id, 'map');
	};

	this.onTileFailure = function(url, element) {
		var src = element.tile.getAttribute('src');
		element.tile.setAttribute('data-failed', 'false');
		element.tile.addEventListener('error', function() {
			// if this tile has not failed before
			if (element.tile.getAttribute('data-failed') === 'false') {
				// mark the element as a failure
				element.tile.setAttribute('data-failed', 'true');
				// recover the coordinates
				var parts = src.split('/'),
					length = parts.length,
					z = parseInt(parts[length - 3]),
					x = parseInt(parts[length - 2]),
					y = parseInt(parts[length - 1]);
				// try the local source instead
				element.tile.src = url.replace('{z}', z).replace('{x}', x).replace('{y}', y);
			}
		});
	};

	// geo location events
	this.onGeoSuccess = function () {
		var _this = this;
		return function (geo) {
			// if the marker doesn't exist yet
			if (_this.overviewMarker === null) {
				// create the icon
				var icon = L.icon({
					iconUrl: "./inc/img/marker-location.png",
					iconSize: [28, 28],
					iconAnchor: [14, 28]
				});
				// add the marker with the icon
				_this.overviewMarker = L.marker(
					[geo.coords.latitude, geo.coords.longitude],
					{'icon': icon}
				);
				_this.overviewMarker.addTo(_this.overviewMap);
			} else {
				_this.overviewMarker.setLatLng([geo.coords.latitude, geo.coords.longitude]);
			}
		};
	};

	this.onGeoFailure = function () {
		return function () {
			console.log('geolocation failed');
		};
	};

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = SydneyTrainWalks.Overview;
}
