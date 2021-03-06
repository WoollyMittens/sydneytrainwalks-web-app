// constants
var fs = require('fs');
var guideCache = require('../inc/json/guides.json');
var exifCache = require('../inc/json/photos.json');
var gpsCache = require('../inc/json/routes.json');
var source = '../src/guides/';
var destPath = '../inc/js/guide-data.js';
var jsonPath = '../inc/json/guides.json';
var GuideData = {};

// Slippy map tilenames - https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
var long2tile = function long2tile(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
var lat2tile = function lat2tile(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }
var tile2long = function tile2long(x,z) { return (x/Math.pow(2,z)*360-180); }
var tile2lat = function tile2lat(y,z) { var n=Math.PI-2*Math.PI*y/Math.pow(2,z); return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n)))); }

// flatten geojson segments
var flattenCoordinates = function(route) {
	var features = route.features;
	var segments = features.map(
		feature => (feature.geometry.coordinates[0][0] instanceof Array)
		? [].concat.apply([], feature.geometry.coordinates)
		: feature.geometry.coordinates);
	return [].concat.apply([], segments);
};

// generates a resize queue
var generateQueue = function () {
	// get the file list
	var queue = [], srcPath, dstPath,
		scripts = fs.readdirSync(source),
		isScript = new RegExp('.js$|.json$', 'i');
	// for every script in the folder
	for (var a = 0, b = scripts.length; a < b; a += 1) {
		// if this isn't a bogus file
		if (isScript.test(scripts[a])) {
			// add the image to the queue
			queue.push(scripts[a]);
		}
	}
	// truncate the queue for testing
	//queue.length = 3;
	// return the queue
	return queue.reverse();
};

// compile a summary of the guide in the output file
var addIndex = function () {
	var overview = {
		'key': '_index',
		'bounds': {},
		'markers': []
	};
	// for every guide
	var north = -999, west = 999, south = 999, east = -999;
	for (var key in GuideData) {
		// expand the bounds based on the guides
		north = Math.max(GuideData[key].bounds.north, north);
		west = Math.min(GuideData[key].bounds.west, west);
		south = Math.min(GuideData[key].bounds.south, south);
		east = Math.max(GuideData[key].bounds.east, east);
		// add a marker from the centre of the guide
		overview.markers.push({
			'type': 'walk',
			'lon': GuideData[key].lon,
			'lat': GuideData[key].lat,
			'id': key
		});
	}
	// expand the bounds by one map tile
	north = tile2lat(lat2tile(north, 11) - 1, 11);
	west = tile2long(long2tile(west, 11) - 1, 11);
	south = tile2lat(lat2tile(south, 11) + 2, 11);
	east = tile2long(long2tile(east, 11) + 2, 11);
	// align the bounds to the tile grid
	overview.bounds.north = tile2lat(lat2tile(north, 11), 11);
	overview.bounds.west = tile2long(long2tile(west, 11), 11);
	overview.bounds.south = tile2lat(lat2tile(south, 11), 11);
	overview.bounds.east = tile2long(long2tile(east, 11), 11);
	// insert the index into the guides
	GuideData['_index'] = overview;
};

// processes a script from the queue the master json object
var parseGuides = function (queue) {
	// if the queue is not empty
	if (queue.length > 0) {
		// pick an item from the queue
		var item = queue.pop();
		// process the item in the queue
		new fs.readFile(source + item, function (error, data) {
			if (error) {
				console.log('ERROR: ' + error);
			} else {
				// report what was done
				console.log('indexed:', item);
				// parse the json and add to master object
				var key = item.split('.js')[0];
				GuideData[key] = JSON.parse(data.toString());
				// provide lat and lon for the end points
				var routeData = flattenCoordinates(gpsCache[key]);
				var startMarker = GuideData[key].markers[0];
				if (!startMarker.lon) {
					startMarker.lon = routeData[0][0];
					startMarker.lat = routeData[0][1];
				}
				var endMarker = GuideData[key].markers[GuideData[key].markers.length - 1];
				if (!endMarker.lon) {
					endMarker.lon = routeData[routeData.length - 1][0];
					endMarker.lat = routeData[routeData.length - 1][1];
				}
				// add the photo exif data to markers with a photo
				var markerData;
				var alias = (GuideData[key].alias) ? GuideData[key].alias.key : key;
				for (var marker in GuideData[key].markers) {
					markerData = GuideData[key].markers[marker];
					if (markerData.photo) {
						markerData.lon = exifCache[alias][markerData.photo].lon,
						markerData.lat = exifCache[alias][markerData.photo].lat
					}
				}
				// determine the centrepoint
				var halfWay = parseInt(routeData.length/2);
				GuideData[key].lon = routeData[halfWay][0];
				GuideData[key].lat = routeData[halfWay][1];
				// determine map bounds
				var north = -999, west = 999, south = 999, east = -999;
				for (var a = 0, b = routeData.length; a < b; a += 1) {
					// get min and max from flattened gps
					north = Math.max(routeData[a][1], north);
					west = Math.min(routeData[a][0], west);
					south = Math.min(routeData[a][1], south);
					east = Math.max(routeData[a][0], east);
				}
				// expand the bounds by one map tile
				north = tile2lat(lat2tile(north, 15) - 1, 15);
				west = tile2long(long2tile(west, 15) - 1, 15);
				south = tile2lat(lat2tile(south, 15) + 2, 15);
				east = tile2long(long2tile(east, 15) + 2, 15);
				// align the bounds to the tile grid
				GuideData[key].bounds.north = tile2lat(lat2tile(north, 15), 15);
				GuideData[key].bounds.west = tile2long(long2tile(west, 15), 15);
				GuideData[key].bounds.south = tile2lat(lat2tile(south, 15), 15);
				GuideData[key].bounds.east = tile2long(long2tile(east, 15), 15);
				// prefill the "bounds" from guides that are a subset of another guide
				if (GuideData[key].alias && guideCache[alias] && guideCache[alias].bounds) {
					GuideData[key].alias.bounds = guideCache[alias].bounds;
				}
				// save the converted guide
				fs.writeFile(source + item, JSON.stringify(GuideData[key], null, '\t'), function (error) {
					// next iteration in the queue
					parseGuides(queue);
				});
			}
		});
	} else {
		// add the index
		addIndex();
		// convert to string
		var data = JSON.stringify(GuideData);
		// write the JSON data to disk
		fs.writeFile(jsonPath, data, function (error) {
			if (error) {
				console.log('ERROR: ' + error);
			} else {
				console.log('SAVED AS: ' + jsonPath);
			}
		});
		// write the exif data to disk
		fs.writeFile(destPath, 'var GuideData = ' + data + ';', function (error) {
			if (error) {
				console.log('ERROR: ' + error);
			} else {
				console.log('SAVED AS: ' + destPath);
			}
		});
	}
};

// start processing the queue
parseGuides(generateQueue());
