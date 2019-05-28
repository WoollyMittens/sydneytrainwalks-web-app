const fs = require('fs');
const {Image, createCanvas} = require('canvas');
//const request = require('request');
const sourcePath = '../src/guides_redux/';
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
  // return the queue
  queue.length = 1;
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
      // TODO: the canvas needs to be based on the bounds in the guide
      canvas = createCanvas(256, 512);
      ctx = canvas.getContext('2d');
      // TODO: create a list if tiles within the map bounds
      downloadTiles([
        { url:'https://b.tile.openstreetmap.org/17/120563/78560.png', x:0, y:0 },
        { url:'https://b.tile.openstreetmap.org/17/120563/78561.png', x:0, y:1 },
      ], name.split('.')[0], function() {
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
      canvas.createPNGStream().pipe(fs.createWriteStream(name + '.png')).on('close', callback);
    }
  });
};

var downloadTile = function(tile, callback) {
  /*
    NOTE: download the tile instead
    request(url).pipe(fs.createWriteStream('test.png')).on('close', callback);
  */
  // load the image
  var image = new Image();
  image.onload = function() {
    // process the tile
    console.log('processing:', tile.url, tile.x, tile.y);
    ctx.drawImage(image, tile.x * gridSize, tile.y * gridSize);
    // report back
    callback();
  };
  image.onerror = function(error) { throw error; };
  image.src = tile.url;
};

// start processing the queue
parseGuides(generateQueue());
