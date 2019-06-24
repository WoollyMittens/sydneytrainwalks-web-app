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
const mapZoom = 15;
const gridSize = 256;
var canvas, ctx;

// Slippy map tilenames - https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
var long2tile = function long2tile(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
var lat2tile = function lat2tile(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }
var tile2long = function tile2long(x,z) { return (x/Math.pow(2,z)*360-180); }
var tile2lat = function tile2lat(y,z) { var n=Math.PI-2*Math.PI*y/Math.pow(2,z); return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n)))); }

var generateQueue = function() {
  // get the file list
  var queue = [];
  var scripts = fs.readdirSync(sourcePath);
  var isScript = new RegExp('.js$|.json$', 'i');
  // for every script in the folder
  for (var a = 0, b = scripts.length; a < b; a += 1) {
    // if this isn't a bogus file
    if (isScript.test(scripts[a])) {
      // add the image to the queue
      queue.push(scripts[a]);
    }
  }
	// truncate the queue for testing
	//queue.length = 1;
	// return the queue
  return queue.reverse();
};

var parseGuides = function(queue) {
  // if the queue is not empty
  if (queue.length > 0) {
    // pick an item from the queue
    var name = queue[queue.length - 1];
    // process the item in the queue
    new fs.readFile(sourcePath + name, function(error, data) {
      if (error) throw error;
      // convert the bounds to tiles
      var guideData = JSON.parse(data.toString());
      minX = long2tile(guideData.bounds.west, 15);
      minY = lat2tile(guideData.bounds.north, 15);
      maxX = long2tile(guideData.bounds.east, 15);
      maxY = lat2tile(guideData.bounds.south, 15);
      // the canvas needs to be based on the bounds in the guide
      canvas = createCanvas((maxX - minX) * 256, (maxY - minY) * 256);
      ctx = canvas.getContext('2d');
      // create a list if tiles within the map bounds
      tilesList = [];
      for (let x = minX; x <= maxX; x += 1) {
        for (let y = minY; y <= maxY; y += 1) {
          tilesList.push({
            cache: tileCache.replace('{x}', x).replace('{y}', y).replace('{z}', mapZoom),
            url: tileTemplate.replace('{x}', x).replace('{y}', y).replace('{z}', mapZoom),
            x: x - minX,
            y: y - minY
          });
        }
      }
      downloadTiles(tilesList, name.split('.')[0], function() {
        // remove the guide from the queue
        queue.length = queue.length - 1;
        // next iteration in the queue
        parseGuides(queue);
      });
    });
  }
};

var downloadTiles = function(list, name, callback) {
  // download the last in the list
  var index = list.length - 1;
  var tile = list[index];
  downloadTile(tile, function() {
    // remove tile from the list
    list.length = list.length - 1;
    // if there is a next tile
    if (list.length > 0) {
      // next iteration in the list
      downloadTiles(list, name, callback);
      // else
    } else {
      // save the map
      canvas.createPNGStream().pipe(fs.createWriteStream(targetPath + name + '.png')).on('close', callback);
      //canvas.createJPEGStream({quality: 0.75, progressive: false, chromaSubsampling: true}).pipe(fs.createWriteStream(targetPath + name + '.jpg')).on('close', callback);
    }
  });
};

var downloadTile = function(tile, callback, retry) {
  // create an image
  var image = new Image();
  image.onload = function() {
    // process the tile
    console.log('processing:', tile.cache, tile.x, tile.y);
    ctx.drawImage(image, tile.x * gridSize, tile.y * gridSize);
    // report back
    callback();
  };
  // if loading the tile fails
  image.onerror = function(error) {
    console.log('retrieving:', tile.url, 'saving as:', tile.cache);
    // try to download the tile from the online service
    if (!retry) {
      request(tile.url)
        .pipe(fs.createWriteStream(tile.cache))
        .on('error', function() { console.log('missing tile:', tile.cache); image.src = tileMissing; })
        .on('close', downloadTile.bind(this, tile, callback, true));
    }
    // and failing that, substitute a missing tile
    else {
      console.log('missing tile:', tile.cache);
      image.src = tileMissing;
    }
  };
  // try the local store first
  image.src = tile.cache;
};

// start processing the queue
parseGuides(generateQueue());
