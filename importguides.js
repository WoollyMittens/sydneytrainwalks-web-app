// constants
var fs = require('fs');
var source = './src/guides/';
var destination = './inc/js/guide-data.js';
var GuideData = {};

// generates a resize queue
var generateQueue = function () {
	// get the file list
	var queue = [], srcPath, dstPath,
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
var parseGuides = function (queue) {
	var rawJS;
	// if the queue is not empty
	if (queue.length > 0) {
		// pick an item from the queue
		var item = queue[queue.length - 1];
		// process the item in the queue
		new fs.readFile(source + item, function (error, data) {
			if (error) {
				console.log('ERROR: ' + error);
			} else {
				// report what was done
				console.log('indexed:', item);
				// sanitise the incoming string
				rawJS = data.toString().split('"] = ').reverse()[0].replace('};', '}');
				// parse the json and add to master object
				GuideData[item.replace('.js', '')] = JSON.parse(rawJS);
				// remove the item from the queue
				queue.length = queue.length - 1;
				// next iteration in the queue
				parseGuides(queue);
			}
		});
	} else {
		// write the exif data to disk
		fs.writeFile(destination, 'var GuideData = ' + JSON.stringify(GuideData) + ';', function (error) {
			if (error) {
				console.log('ERROR: ' + error);
			} else {
				console.log('SAVED AS: ' + destination);
			}
		});
	}
};

// start processing the queue
parseGuides(generateQueue());
