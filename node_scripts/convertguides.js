// constants
var fs = require('fs');
var exifData = require('../inc/json/photos.json');
var gpsData = require('../inc/json/routes.json');
var source = '../src/guides/';
var destPath = '../inc/js/guide-data.js';
var jsonPath = '../inc/json/guides.json';
var GuideData = {};

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
    srcPath,
    dstPath,
    scripts = fs.readdirSync(source),
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
    var item = queue[queue.length - 1];
    // process the item in the queue
    new fs.readFile(source + item, function(error, data) {
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
        // TODO: add the trackpoints
        // GuideData[key].trackpoints = routeData;
        // convert the markers into an array
        var markerData,
          markers = [];
        for (var marker in GuideData[key].markers) {
          markerData = GuideData[key].markers[marker];
          delete(markerData.icon);
          markers.push(markerData);
        }
        // convert the landmarks into markers of type "waypoint"
        var landmarkData;
        var alias = (GuideData[key].assets)
          ? GuideData[key].assets.prefix
          : key;
        for (var landmark in GuideData[key].landmarks) {
          landmarkData = GuideData[key].landmarks[landmark];
          console.log(alias, landmark);
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
        // save the converted guide
        fs.writeFile('./src/guides_redux/' + key + '.json', JSON.stringify(GuideData[key]), function(error) {
          // remove the item from the queue
          queue.length = queue.length - 1;
          // next iteration in the queue
          parseGuides(queue);
        });
      }
    });
  } else {
    // convert to string
    var data = JSON.stringify(GuideData);
    // write the JSON data to disk
    fs.writeFile(jsonPath, data, function(error) {
      if (error) {
        console.log('ERROR: ' + error);
      } else {
        console.log('SAVED AS: ' + jsonPath);
      }
    });
    // write the exif data to disk
    fs.writeFile(destPath, 'var GuideData = ' + data + ';', function(error) {
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
