// constants
var gm = require('gm');
var fs = require('fs');
var large = '../src/large/';
var medium = '../inc/medium/';
var small = '../inc/small/';
var gpx = '../inc/gpx/';

// generates a resize queue
var generateQueue = function() {
  // get the folder list
  var queue = [],
    images = [],
    srcPath, dstPath,
    folders = fs.readdirSync(gpx),
    isInvisible = new RegExp('^[.]'),
    isPhoto = new RegExp('.jpg$', 'i'),
    folder;
  // for every folder
  for (var a = 0, b = folders.length; a < b; a += 1) {
    // if this isn't a bogus file
    if (!isInvisible.test(folders[a])) {
      // construct the folder name
      folder = folders[a].split('.')[0];
      // create the folders in the destination folder
      if (!fs.existsSync(small + folder)) {
        fs.mkdirSync(small + folder);
      }
      if (!fs.existsSync(medium + folder)) {
        fs.mkdirSync(medium + folder);
      }
      // get the folder contents
      images = (fs.existsSync(large + folder)) ? fs.readdirSync(large + folder) : [];
      //images.length = 1;
      // for every image in the folder
      for (var c = 0, d = images.length; c < d; c += 1) {
        // if this isn't a bogus file
        if (isPhoto.test(images[c])) {
          // create the source path
          srcPath = large + folder + '/' + images[c];
          // TODO: add .crop(width, height, x, y) to operation if the image is spherical
          // if the destination photo doesn't exist yet
          dstPath = (medium + folder + '/' + images[c]).toLowerCase();
          if (!fs.existsSync(dstPath)) {
            // add the full size to the queue
            queue.push({
              'srcPath': srcPath,
              'dstPath': dstPath,
              'width': 3200,
              'height': 800,
              'quality': 0.6,
              'strip': false
            });
          }
          // if the destination photo doesn't exist yet
          dstPath = (small + folder + '/' + images[c]).toLowerCase();
          if (!fs.existsSync(dstPath)) {
            // add the thumbnail to the queue
            queue.push({
              'srcPath': srcPath,
              'dstPath': dstPath,
              'width': 600,
              'height': 150,
              'quality': 0.6,
              'strip': true
            });
          }
        }
      }
    }
  }
	// truncate the queue for testing
	//queue.length = 3;
	// return the queue
  return queue;
};

// processes an original from the queue into a thumbnail and a full size
var makeImages = function(queue) {
  // if the queue is not empty
  if (queue.length > 0) {
    // pick the next item from the queue
    var item = queue[queue.length - 1];
    queue.length = queue.length - 1;
    // if exif has to be stripped
    if (item.strip) {
      // resize the image
      gm(item.srcPath)
        //.crop('66%', '66%', '17%', '17%')
        .resize(item.width, item.height)
        .autoOrient()
        .quality(parseInt(item.quality * 100))
        .strip()
        .write(item.dstPath, function(err) {
          if (err) {
            console.log(err);
          } else {
            // next iteration in the queue
            makeImages(queue);
          }
        });
      // else
    } else {
      // resize the image
      gm(item.srcPath)
        .resize(item.width, item.height)
        .autoOrient()
        .quality(parseInt(item.quality * 100))
        .write(item.dstPath, function(err) {
          if (err) {
            console.log(err);
          } else {
            // next iteration in the queue
            makeImages(queue);
          }
        });
    }
    // report what was done
    console.log('generated:', item.dstPath);
  }
};

// start processing the queue
makeImages(generateQueue());
//console.log(generateQueue());
