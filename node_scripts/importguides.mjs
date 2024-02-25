// dependencies
import fsp from 'fs/promises';
import { long2tile, lat2tile, tile2long, tile2lat } from "./slippy.mjs";
const guides = '../inc/guides/';
const exifs = '../inc/exifs/';
const routes = '../inc/routes/';

// flatten geojson segments
function flattenCoordinates(route) {
	const features = route.features;
	const segments = features.map(
		feature => (feature.geometry.coordinates[0][0] instanceof Array)
		? [].concat.apply([], feature.geometry.coordinates)
		: feature.geometry.coordinates);
	return [].concat.apply([], segments);
}

// import a list of files in a directory
async function filterDirectory(path, include, exclude) {
	// default filters
	include = include || /.*/;
	exclude = exclude || /$^/;
	// read the folder listing
	const files = await fsp.readdir(path);
	// return only the filtered results
	return files.filter(file => (include.test(file) && !exclude.test(file)));
}

// imports a folder full of JSON files into a single object
async function loadCache(path) {
	// create a cache object
	const cache = {};
	// get the files in the folder
	const files = await filterDirectory(path, /.json$/i, /^_/);
	// for every file
	for (let file of files) {
		// import the content
		let contents = await fsp.readFile(path + file);
		console.log('cached:', path + file);
		// add the content to the cache object
		let key = file.split('.')[0];
		let data = JSON.parse(contents);
		cache[key] = data;
	}
	// return the filled cache object
	return cache;
}

// compile a summary of the guide in the output file
function generateGuideIndex(guides) {
	const overview = {
		'key': '_index',
		'bounds': {},
		'markers': []
	};
	// for every guide
	let north = -999, west = 999, south = 999, east = -999, start, end;
	for (let key in guides) {
		let guide = guides[key];
		// expand the bounds based on the guides
		north = Math.max(guide.bounds.north, north);
		west = Math.min(guide.bounds.west, west);
		south = Math.min(guide.bounds.south, south);
		east = Math.max(guide.bounds.east, east);
		// add a marker from the end points of the guide
		start = guide.markers[0];
		end = guide.markers.slice(-1)[0];
		// gather the transport nodes
		let locations = guide.markers.filter(marker => marker.location);
		// populate the index entry
		overview.markers.push({
			'key': key,
			'type': 'walk',
			'lon': guide.lon,
			'lat': guide.lat,
			'locations': locations,
			'region': guide.location,
			'distance': guide.distance,
			'revised': guide.updated,
			'transit': (start.type !== 'car' && end.type !== 'car'),
			'car': (start.type === 'car' || end.type === 'car'),
			'kiosks': guide.markers.filter(marker => marker.type === 'kiosk').length,
			'toilets': guide.markers.filter(marker => marker.type === 'toilet').length,
			'looped': (start.location === end.location),
			'rain': guide.rain,
			'fireban': guide.fireban
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
	return overview;
}

// compile a summary of the trophies in the output file
function generateTrophyIndex(guides) {
	const overview = {
		'key': '_index',
		'bounds': {},
		'markers': []
	};
	// for every guide
	const duplicates = [];
	let north = -999, west = 999, south = 999, east = -999, start, end;
	for (let key in guides) {
		let guide = guides[key];
		// for every marker
		for (let marker of guide.markers) {
			// report duplicates
			if (marker.radius && duplicates.includes(marker.title)) {
				console.log('duplicate trophy:', marker.title, 'in', key);
			}
			// if this marker is a trophy
			if (marker.radius && !duplicates.includes(marker.title)) {
				// store reference for duplicates
				duplicates.push(marker.title);
				// expand the bounds to fit the trophy
				north = Math.max(marker.lat, north);
				west = Math.min(marker.lon, west);
				south = Math.min(marker.lat, south);
				east = Math.max(marker.lon, east);
				// add a marker for the trophy
				overview.markers.push({
					'key': key,
					'type': 'trophy',
					'photo': marker.photo,
					'lon': marker.lon,
					'lat': marker.lat,
					'radius': marker.radius,
					'description': marker.description,
					'title': marker.title,
					'badge': marker.badge,
					'explanation': marker.explanation
				});
			}
		}
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
	return overview;
}

// populate the guide using the exif and route date
function populateGuide(file, guideCache, exifCache, routesCache) {
	// get the key from the filename
	let key = file.split('.')[0];
	// get the cached guide file
	let guide = guideCache[key];
	// provide lat and lon for the end points
	let routeData = flattenCoordinates(routesCache[key]);
	let startMarker = guide.markers[0];
	startMarker.lon = startMarker.lon || routeData[0][0];
	startMarker.lat = startMarker.lat || routeData[0][1];
	let endMarker = guide.markers[guide.markers.length - 1];
	endMarker.lon = endMarker.lon ||routeData[routeData.length - 1][0];
	endMarker.lat = endMarker.lat || routeData[routeData.length - 1][1];
	// add the photo exif data to markers with a photo
	for (let marker in guide.markers) {
		let markerData = guide.markers[marker];
		if (markerData.photo && exifCache[key][markerData.photo]) {
			markerData.lon = markerData.lon || exifCache[key][markerData.photo].lon,
			markerData.lat = markerData.lat || exifCache[key][markerData.photo].lat
		}
		if (markerData.photo && !exifCache[key][markerData.photo]) {
			markerData.missing = true;
		}
		if (key === 'portkembla-grandpacificdrive-kiama' && markerData.type === 'waypoint' && markerData.photo && exifCache[key][markerData.photo]) {
			console.log('overriding photo:', markerData.photo);
			markerData.lon = exifCache[key][markerData.photo].lon,
			markerData.lat = exifCache[key][markerData.photo].lat
		}
	}
	// determine the centrepoint
	let halfWay = parseInt(routeData.length/2);
	guide.lon = routeData[halfWay][0];
	guide.lat = routeData[halfWay][1];
	// determine map bounds
	let north = -999, west = 999, south = 999, east = -999;
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
	guide.bounds.north = tile2lat(lat2tile(north, 15), 15);
	guide.bounds.west = tile2long(long2tile(west, 15), 15);
	guide.bounds.south = tile2lat(lat2tile(south, 15), 15);
	guide.bounds.east = tile2long(long2tile(east, 15), 15);
	// return the updated guide
	return guide;
}

// processes a script from the queue the master json object
async function parseGuides() {
	// load the guide cache
	const guideCache = await loadCache(guides);
	// load the EXIF cache
	const exifCache = await loadCache(exifs);
	// load the GPX cache
	const routesCache = await loadCache(routes);
	// get the list of guide files
	const files = await filterDirectory(guides, /.json$/i, /^_/);
	for (let file of files) {
		// update the guide with the exif and route data
		let guide = populateGuide(file, guideCache, exifCache, routesCache);
		// save the updated guide
		let savedGuide = await fsp.writeFile(guides + file, JSON.stringify(guide, null, '\t'));
		console.log('saved guide:', guides + file, savedGuide);
	}
	// construct an index of all trophies in the guides
	const trophiesIndex = generateTrophyIndex(guideCache);
	const savedTrophies = await fsp.writeFile(guides + '_trophies.json', JSON.stringify(trophiesIndex, null, '\t'));
	console.log('saved index:', guides + '_trophies.json', savedTrophies);
	// construct an index of the updated guides
	const guidesIndex = generateGuideIndex(guideCache);
	const savedGuides = await fsp.writeFile(guides + '_index.json', JSON.stringify(guidesIndex, null, '\t'));
	console.log('saved index:', guides + '_index.json', savedGuides);
}

// start processing the queue
parseGuides();
