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
const sourcePath = '../src/guides/';
const targetPath = '../src/maps/';
const tileCache = '../src/tiles/{z}/{x}/{y}.png';
const tileTemplate = 'http://4umaps.eu/{z}/{x}/{y}.png';
const tileMissing = '../inc/img/missing.png';
const mapZoom = 15; // default = 15
const gridSize = 256;
var canvas, ctx;
var guidesQueue, tilesQueue;
var image = new Image();

// Slippy map tilenames - https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
var long2tile = function long2tile(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
var lat2tile = function lat2tile(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }
var tile2long = function tile2long(x,z) { return (x/Math.pow(2,z)*360-180); }
var tile2lat = function tile2lat(y,z) { var n=Math.PI-2*Math.PI*y/Math.pow(2,z); return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n)))); }

var generateGuidesQueue = function() {
  // get the file list
  var guidesQueue = [];
  var scripts = fs.readdirSync(sourcePath);
  var isScript = new RegExp('.js$|.json$', 'i');
  // for every script in the folder
  for (var a = 0, b = scripts.length; a < b; a += 1) {
    // if this isn't a bogus file
    if (isScript.test(scripts[a])) {
      // add the image to the guidesQueue
      guidesQueue.push(scripts[a]);
    }
  }
	// truncate the guidesQueue for testing
	//guidesQueue.length = 3;
	// return the guidesQueue
  return guidesQueue.reverse();
};

var parseGuides = function() {
  // if the guidesQueue is not empty
  if (guidesQueue.length > 0) {
    // pick an item from the guidesQueue
    fileName = guidesQueue.pop();
    // process the item in the guidesQueue
    new fs.readFile(sourcePath + fileName, function(error, data) {
      if (error) throw error;
      // parse the guide as JSON
      var guideData = JSON.parse(data.toString());
      // if this map isn't a subset of a larger walk
      if (!guideData.assets) {
        // convert the bounds to tiles
        minX = long2tile(guideData.bounds.west, mapZoom);
        minY = lat2tile(guideData.bounds.north, mapZoom);
        maxX = long2tile(guideData.bounds.east, mapZoom);
        maxY = lat2tile(guideData.bounds.south, mapZoom);
        // the canvas needs to be based on the bounds in the guide
        canvas = createCanvas(Math.max(maxX - minX, 1) * 256, Math.max(maxY - minY, 1) * 256);
        ctx = canvas.getContext('2d');
        // create a list of tiles within the map bounds
        tilesQueue = [];
        for (let x = minX; x <= maxX; x += 1) {
          for (let y = minY; y <= maxY; y += 1) {
            tilesQueue.push({
              cache: tileCache.replace('{x}', x).replace('{y}', y).replace('{z}', mapZoom),
              url: tileTemplate.replace('{x}', x).replace('{y}', y).replace('{z}', mapZoom),
              x: x - minX,
              y: y - minY
            });
          }
        }
        downloadTiles(fileName.split('.')[0] + '_' + mapZoom);
      }
      // otherwise skip it
      else {
        parseGuides();
      }
    });
  } else {
    console.log('Finished.');
  }
};

var downloadTiles = function(fileName) {
  // if there is a next tile
  if (tilesQueue.length > 0) {
    // download the last in the list
    var tile = tilesQueue.pop();
    // load the tile into the image
    image.onload = function() {
      // process the tile
      console.log('processing:', tile.cache, tile.x, tile.y);
      ctx.drawImage(image, tile.x * gridSize, tile.y * gridSize);
      // download the next tile
      setTimeout(function() { downloadTiles(fileName) }, 0);
    };
    // if loading the tile fails
    image.onerror = function(error) {
      console.log('retrieving:', tile.url);
      // try to download the tile from the online service
      var path = tile.cache.split('/');
      var file = path.pop();
      fs.mkdir(path.join('/'), { recursive: true }, function(error){ if (error) throw error; });
      request(tile.url)
        .on('error', onFailedTile.bind(this, tile, image))
        .pipe(fs.createWriteStream(tile.cache))
        .on('close', onDownloadedTile.bind(this, tile, image));
    };
    // try the local store first
    image.src = tile.cache;
  // else
  } else {
    // save the map
    console.log('writing: ', targetPath + fileName + '.png');
    canvas.createPNGStream().pipe(fs.createWriteStream(targetPath + fileName + '.png')).on('close', function() { parseGuides() });
    //canvas.createJPEGStream({quality: 0.75, progressive: false, chromaSubsampling: true}).pipe(fs.createWriteStream(targetPath + fileName + '.jpg')).on('close', function() { parseGuides() });
  }
};

var onDownloadedTile = function(tile, image) {
  console.log('downloaded tile:', tile.cache);
  image.onerror = null;
  image.src = tile.cache;
};

var onFailedTile = function(tile, image) {
  console.log('missing tile:', tileMissing);
  image.onerror = null;
  image.src = tileMissing;
};

// start processing the guidesQueue
guidesQueue = generateGuidesQueue();
parseGuides()
