// constants
var fs = require('fs');
var exifData = require('../inc/json/photos.json');
var gpsData = require('../inc/json/routes.json');
var srcPath = '../src/guides_old/';
var destPath = '../src/guides/';
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
var generateQueue = function() {
  // get the file list
  var queue = [],
    scripts = fs.readdirSync(srcPath),
    isScript = new RegExp('.js$', 'i');
  // for every script in the folder
  for (var a = 0, b = scripts.length; a < b; a += 1) {
    // if this isn't a bogus file
    if (isScript.test(scripts[a])) {
      // add the image to the queue
      queue.push(scripts[a]);
    }
  }
  // return the queue
  return queue.reverse();
};

// processes a script from the queue the master json object
var parseGuides = function(queue) {
  // if the queue is not empty
  if (queue.length > 0) {
    // pick an item from the queue
    var item = queue.pop();
    // process the item in the queue
    new fs.readFile(srcPath + item, function(error, data) {
      if (error) {
        console.log('ERROR: ' + error);
      } else {
        // report what was done
        console.log('indexed:', item);
        // parse the json and add to master object
        var key = item.replace('.js', '');
        GuideData[key] = JSON.parse(data.toString());
        // provide lat and lon for the end points
        var routeData = flattenCoordinates(gpsData[key]);
        var startMarker = GuideData[key].markers.start;
        if (!startMarker.lon) {
          startMarker.lon = routeData[0][0];
          startMarker.lat = routeData[0][1];
        }
        var endMarker = GuideData[key].markers.end;
        if (!endMarker.lon) {
          endMarker.lon = routeData[routeData.length - 1][0];
          endMarker.lat = routeData[routeData.length - 1][1];
        }
        // convert the markers into an array
        var markerData, markers = [];
        // add the start marker
        markerData = GuideData[key].markers.start;
        delete(markerData.icon);
        markers.push(markerData);
        // add all other markers
        for (var marker in GuideData[key].markers) {
          if (marker !== 'start' && marker !== 'end') {
            markerData = GuideData[key].markers[marker];
            delete(markerData.icon);
            markers.push(markerData);
          }
        }
        // convert the landmarks into markers of type "waypoint"
        var landmarkData;
        var alias = (GuideData[key].alias)
          ? GuideData[key].alias.prefix
          : key;
        for (var landmark in GuideData[key].landmarks) {
          landmarkData = GuideData[key].landmarks[landmark];
          markerData = {
            'type': 'waypoint',
            'photo': landmark + '.jpg',
            'lon': exifData[alias][landmark + '.jpg'].lon,
            'lat': exifData[alias][landmark + '.jpg'].lat,
            'description': landmarkData.replace(/OPTIONAL: |DETOUR: |ATTENTION: /g, '')
          }
          if (/OPTIONAL:/.test(landmarkData))
            markerData.optional = true;
          if (/DETOUR:/.test(landmarkData))
            markerData.detour = true;
          if (/ATTENTION:/.test(landmarkData))
            markerData.attention = true;
          markers.push(markerData);
        }
        // add the end marker
        markerData = GuideData[key].markers.end;
        delete(markerData.icon);
        markers.push(markerData);
        // delete the old landmarks
        delete(GuideData[key].landmarks);
        // clean up the bounds
        GuideData[key].bounds = {
          'west': GuideData[key].bounds['_southWest'].lng,
          'north': GuideData[key].bounds['_northEast'].lat,
          'east': GuideData[key].bounds['_northEast'].lng,
          'south': GuideData[key].bounds['_southWest'].lat
        };
        // remove the indicator icon
        delete(GuideData[key].indicator);
        // overwrite the old markers
        GuideData[key].markers = markers;
        // rename keys
        GuideData[key].distance = GuideData[key].length;
        delete(GuideData[key].length);
        GuideData[key].alias = GuideData[key].alias;
        delete(GuideData[key].alias);
        // save the converted guide
        fs.writeFile(destPath + key + '.json', JSON.stringify(GuideData[key]), function(error) {
          if (error) throw(error);
          console.log('SAVED AS:', './src/guides_redux/' + key + '.json');
          // next iteration in the queue
          parseGuides(queue);
        });
      }
    });
  }
};

// start processing the queue
parseGuides(generateQueue());
