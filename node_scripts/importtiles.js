/* TILE SERVERS
// 4UMaps.eu
const tileTemplate = 'http://4umaps.eu/{z}/{x}/{y}.png';
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

const fs = require('fs');
const {Image, createCanvas} = require('canvas');
const request = require('request');
const guideCache = require('../inc/json/guides.json');
const targetPath = '../src/maps/';
const tileCache = '../src/tiles/{z}/{x}/{y}.png';
const tileTemplate = 'http://4umaps.eu/{z}/{x}/{y}.png';
const tileMissing = '../inc/img/missing.png';
const overviewZoom = 11;
const mapZoom = 15; // default = 15
const gridSize = 256;
var image = new Image();

// Slippy map tilenames - https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
var long2tile = function long2tile(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
var lat2tile = function lat2tile(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }
var tile2long = function tile2long(x,z) { return (x/Math.pow(2,z)*360-180); }
var tile2lat = function tile2lat(y,z) { var n=Math.PI-2*Math.PI*y/Math.pow(2,z); return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n)))); }

var generateQueue = function() {
  // get the file list
  var queue = [];
  Object.keys(guideCache).map(function(index){
    var guideData = guideCache[index];
    // if this map isn't a subset of a larger walk
    if (!guideData.alias) {
      // use the appropriate zoom level
      var zoom = (guideData.key === '_index') ? overviewZoom : mapZoom;
      // convert the bounds to tiles
      minX = long2tile(guideData.bounds.west, zoom);
      minY = lat2tile(guideData.bounds.north, zoom);
      maxX = long2tile(guideData.bounds.east, zoom);
      maxY = lat2tile(guideData.bounds.south, zoom);
      // create a list of tiles within the map bounds
      for (let x = minX; x <= maxX; x += 1) {
        for (let y = minY; y <= maxY; y += 1) {
          queue.push({
            cache: tileCache.replace('{x}', x).replace('{y}', y).replace('{z}', zoom),
            url: tileTemplate.replace('{x}', x).replace('{y}', y).replace('{z}', zoom),
            x: x - minX,
            y: y - minY
          });
        }
      }
    }
  });
	// truncate the guidesQueue for testing
	//queue.length = 3;
	// return the queue
  return queue.reverse();
};

var downloadTiles = function(queue) {
  // if there is a next tile
  if (queue.length > 0) {
    // download the last in the list
    var tile = queue.pop();
    // if the tile already exists in cache
    if (!fs.existsSync(tile.cache)) {
      // process the tile
      console.log('retrieving:', tile.url, tile.x, tile.y);
      // try to download the tile from the online service
      var path = tile.cache.split('/');
      var file = path.pop();
      fs.mkdir(path.join('/'), { recursive: true }, function(error){ if (error) throw error; });
      var req = request(tile.url)
        .on('error', onFailedTile.bind(this, tile, queue))
        .pipe(fs.createWriteStream(tile.cache))
        .on('close', onDownloadedTile.bind(this, tile, queue));
    } else {
      // skip the tile
      console.log('already exists:', tile.url, tile.x, tile.y);
      // download the next tile
      setTimeout(function() { downloadTiles(queue) }, 0);
    }
  }
};

var onDownloadedTile = function(tile, queue) {
  console.log('testing result:', tile.cache);
  // test if the tile works
  image.onerror = function() {
    // report the failure
    console.log('download failed. Using:', tileMissing);
    // substitute with a placeholder
    fs.copyFileSync(tileMissing, tile.cache);
    // download the next tile
    setTimeout(function() { downloadTiles(queue) }, 0);
  };
  image.onload = function() {
    // report the success
    console.log('downloaded succeeded:', tile.url);
    // download the next tile
    setTimeout(function() { downloadTiles(queue) }, 0);
  };
  image.src = tile.cache;
  // continue
  return true;
};

var onFailedTile = function(tile, queue) {
  // report the failure
  console.log('missing tile:', tile.url, 'substituting:', tileMissing);
  // substitute a placeholder
  fs.copyFileSync(tileMissing, tile.cache);
  // download the next tile
  setTimeout(function() { downloadTiles(queue) }, 0);
  // stop
  return false;
};


// start processing the guidesQueue
downloadTiles(generateQueue());
