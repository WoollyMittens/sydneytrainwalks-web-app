// constants
var ex = require('exif');
var fs = require('fs');
var source = './src/large/';
var destPath = './inc/js/exif-data.js';
var jsonPath = './inc/json/photos.json';
var exifs = {};

// generates a resize queue
var generateQueue = function () {
	// get the folder list
	var queue = [], images = [], srcPath, dstPath,
		folders = fs.readdirSync(source),
		isInvisible = new RegExp('^[.]'),
		isPhoto = new RegExp('.jpg$', 'i');
	// for every folder
	for (var a = 0, b = folders.length; a < b; a += 1) {
		// if this isn't a bogus folder
		if (!isInvisible.test(folders[a])) {
			// get the folder contents
			images = fs.readdirSync(source + folders[a]);
			// for every image in the folder
			for (var c = 0, d = images.length; c < d; c += 1) {
				// if this isn't a bogus file
				if (isPhoto.test(images[c])) {
					// add the image to the queue
					queue.push({folder : folders[a], image : images[c]});
				}
			}
		}
	}
	// truncate the queue for testing
	//queue.length = 16;
	// return the queue
	return queue.reverse();
};

// processes an original from the queue into a thumbnail and a full size
var parseImages = function (queue) {
	// if the queue is not empty
	if (queue.length > 0) {
		// pick an item from the queue
		var item = queue[queue.length - 1];
		// process the item in the queue
		new ex.ExifImage({ image : source + item.folder + '/' + item.image }, function (error, exifData) {
			if (error) {
				console.log('ERROR: ' + error);
			} else {
				var deg, min, sec, ref, lon, lat, time;
				// convert the lat into a usable format
				deg = exifData.gps.GPSLatitude[0];
				min = exifData.gps.GPSLatitude[1];
				sec = exifData.gps.GPSLatitude[2];
				ref = exifData.gps.GPSLatitudeRef;
				lat = (deg + min / 60 + sec / 3600) * (ref === "N" ? 1 : -1);
				// convert the lon into a usable format
				deg = exifData.gps.GPSLongitude[0];
				min = exifData.gps.GPSLongitude[1];
				sec = exifData.gps.GPSLongitude[2];
				ref = exifData.gps.GPSLongitudeRef;
				lon = (deg + min / 60 + sec / 3600) * (ref === "W" ? -1 : 1);
				// add the relevant exif data to the list
				exifs[item.folder] = exifs[item.folder] || {};
				exifs[item.folder][item.image.toLowerCase()] = { 'lon' : lon, 'lat' : lat };
				// report what was done
				console.log('indexed:', source + item.folder + '/' + item.image);
				// remove the item from the queue
				queue.length = queue.length - 1;
				// next iteration in the queue
				parseImages(queue);
			}
		});
	} else {
		var data = JSON.stringify(exifs);
		// export as json
		fs.writeFile(jsonPath, data, function (error) {
			if (error) {
				console.log('ERROR: ' + error);
			} else {
				console.log('SAVED AS: ' + jsonPath);
			}
		});
		// write the exif data to disk
		fs.writeFile(destPath, 'var ExifData = ' + data + ';', function (error) {
			if (error) {
				console.log('ERROR: ' + error);
			} else {
				console.log('SAVED AS: ' + destPath);
			}
		});
	}
};

// start processing the queue
parseImages(generateQueue());
