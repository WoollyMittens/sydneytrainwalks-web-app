// dependencies
import fsp from 'fs/promises';
import { long2tile, lat2tile, tile2long, tile2lat } from "../inc/slippy.js";
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
	const files = await filterDirectory(path, /.json$/i, /^_index/);
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
function generateIndex(guides) {
	const overview = {
		'key': '_index',
		'bounds': {},
		'markers': []
	};
	// for every guide
	let north = -999, west = 999, south = 999, east = -999;
	for (let key in guides) {
		// expand the bounds based on the guides
		north = Math.max(guides[key].bounds.north, north);
		west = Math.min(guides[key].bounds.west, west);
		south = Math.min(guides[key].bounds.south, south);
		east = Math.max(guides[key].bounds.east, east);
		// add a marker from the centre of the guide
		// TODO: add "start, finish, region, duration, length, revised" to the summary
		overview.markers.push({
			'type': 'walk',
			'lon': guides[key].lon,
			'lat': guides[key].lat,
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
	if (!startMarker.lon) {
		startMarker.lon = routeData[0][0];
		startMarker.lat = routeData[0][1];
	}
	let endMarker = guide.markers[guide.markers.length - 1];
	if (!endMarker.lon) {
		endMarker.lon = routeData[routeData.length - 1][0];
		endMarker.lat = routeData[routeData.length - 1][1];
	}
	// add the photo exif data to markers with a photo
	let alias = (guide.alias) ? guide.alias.key : key;
	for (let marker in guide.markers) {
		let markerData = guide.markers[marker];
		if (markerData.photo) {
			markerData.lon = exifCache[alias][markerData.photo].lon,
			markerData.lat = exifCache[alias][markerData.photo].lat
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
	// prefill the "bounds" from guides that are a subset of another guide
	if (guide.alias && guideCache[alias] && guideCache[alias].bounds) {
		guide.alias.bounds = guideCache[alias].bounds;
	}
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
	const files = await filterDirectory(guides, /.json$/i, /^_index/);
	for (let file of files) {
		// update the guid with the exif and route data
		let guide = populateGuide(file, guideCache, exifCache, routesCache);
		// save the updated guide
		let savedGuide = await fsp.writeFile(guides + file, JSON.stringify(guide, null, '\t'));
		console.log('saved guide:', guides + file, savedGuide);
	}
	// construct an index of the updated guides
	const index = generateIndex(guideCache);
	// convert to string
	let savedIndex = await fsp.writeFile(guides + '_index.json', JSON.stringify(index, null, '\t'));
	console.log('saved index:', guides + '_index.json', savedIndex);
}

// start processing the queue
parseGuides();
