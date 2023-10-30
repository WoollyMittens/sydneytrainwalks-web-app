/* TILE SERVERS
// 4UMaps.eu
const tileTemplate = 'http://4umaps.com/{z}/{x}/{y}.png';
// OpenStreetMap
const tileTemplate = 'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png';
// OpenCycleMap
const tileTemplate = 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=b3f44588368a4290a39e55433a281e99';
// Transport
const tileTemplate = 'https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=b3f44588368a4290a39e55433a281e99';
// Landscape
const tileTemplate = 'https://tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=b3f44588368a4290a39e55433a281e99';
// Outdoors
const tileTemplate = 'https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=b3f44588368a4290a39e55433a281e99';
// Transport Dark
const tileTemplate = 'https://tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey=b3f44588368a4290a39e55433a281e99';
// Spinal Map
const tileTemplate = 'https://tile.thunderforest.com/spinal-map/{z}/{x}/{y}.png?apikey=b3f44588368a4290a39e55433a281e99';
// Pioneer
const tileTemplate = 'https://tile.thunderforest.com/pioneer/{z}/{x}/{y}.png?apikey=b3f44588368a4290a39e55433a281e99';
// Mobile Atlas
const tileTemplate = 'https://tile.thunderforest.com/mobile-atlas/{z}/{x}/{y}.png?apikey=b3f44588368a4290a39e55433a281e99';
// Neighbourhood
const tileTemplate = 'https://tile.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey=b3f44588368a4290a39e55433a281e99';
*/

import fs from 'fs';
import fsp from 'fs/promises';
import fetch from 'node-fetch';
import { long2tile, lat2tile, tile2long, tile2lat } from "./slippy.mjs";
const tilePath = '../src/tiles/{z}/{x}/';
const tileCache = '../src/tiles/{z}/{x}/{y}.png';
const tileTemplate = 'http://4umaps.com/{z}/{x}/{y}.png';
const tileMissing = '../inc/img/missing.png';
const guidesPath = '../inc/guides/';
const overviewZoom = 11;
const mapZoom = 15;

// check if a file exists
async function checkExists(path) {
  let exists;
  // attempt to retrieve state on the given file
  try { const stats = await fsp.stat(path); exists = stats; } 
  catch (error) { exists = null; }
  // return the result
  return exists;
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

// downloads a file to a local path
function downloadFile(source, destination) {
  return new Promise((resolve, reject) => {
    fetch(source).then(response => {
      if (response.status !== 200) { resolve(null); }
      else {
        const stream = fs.createWriteStream(destination);
        stream.on('error', (error) => { reject(null); });
        stream.on('close', () => { resolve(destination); });
        response.body.pipe(stream);
      }
    }).catch(error => { resolve(null); });
  });
}

// imports a folder full of JSON files into a single object
async function loadCache(path) {
	// create a cache object
	const cache = {};
	// get the files in the folder
	const files = await filterDirectory(path, /.json$/i);
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

function generateQueue(guideCache) {
  // get the file list
  const queue = [];
  const keys = Object.keys(guideCache);
  for (let key of keys) {
    // get the guide from the cache
    let guideData = guideCache[key];
    // if this map isn't a subset of a larger walk
    if (!guideData.alias) {
      // use the appropriate zoom level
      let zoom = (guideData.key === '_index') ? overviewZoom : mapZoom;
      // convert the bounds to tiles
      let minX = long2tile(guideData.bounds.west, zoom);
      let minY = lat2tile(guideData.bounds.north, zoom);
      let maxX = long2tile(guideData.bounds.east, zoom);
      let maxY = lat2tile(guideData.bounds.south, zoom);
      // create a list of tiles within the map bounds
      for (let x = minX; x <= maxX; x += 1) {
        for (let y = minY; y <= maxY; y += 1) {
          queue.push({
            path: tilePath.replace('{x}', x).replace('{y}', y).replace('{z}', zoom),
            local: tileCache.replace('{x}', x).replace('{y}', y).replace('{z}', zoom),
            remote: tileTemplate.replace('{x}', x).replace('{y}', y).replace('{z}', zoom),
            x: x - minX,
            y: y - minY
          });
        }
      }
    }
  }
	// truncate the guidesQueue for testing
	//queue.length = 3;
	// return the queue
  return queue.reverse();
}

async function importTiles() {
  // load the guide cache
	const guideCache = await loadCache(guidesPath);
  // generate a tiles wish list
  const tileQueue = generateQueue(guideCache);
  // for every item in the queue
  for (let tile of tileQueue) {
    // if the tile doesn't exist locally yet
    let exists = await checkExists(tile.local);
    if (!exists) {
      // create the path
      await fsp.mkdir(tile.path, {recursive: true});
      // download the tile
      let result = await downloadFile(tile.remote, tile.local);
      // or substitute the placeholder
      console.log('downloaded:', result);
      if (!result) await fsp.copyFile(tileMissing, tile.local);
    } else {
      // report a cache hit
      console.log('reused:', tile.local);
    }
  }
}

importTiles();
