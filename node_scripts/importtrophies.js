// constants
var gm = require('gm');
var fs = require('fs');
var source = '../src/trophies/';
var dest = '../inc/trophies/';

// generates a resize queue
var generateQueue = function() {
  // get the folder list
  var queue = [],
    images = [],
    srcPath, dstPath,
    isInvisible = new RegExp('^[.]'),
    isPhoto = new RegExp('.jpg$', 'i'),
    folder;
  // get the folder contents
  images = (fs.existsSync(source)) ? fs.readdirSync(source) : [];
  // for every image in the folder
  for (var c = 0, d = images.length; c < d; c += 1) {
    // if this isn't a bogus file
    if (isPhoto.test(images[c])) {
      // create the source path
      srcPath = source + images[c];
      // TODO: add .crop(width, height, x, y) to operation if the image is spherical
      // if the destination photo doesn't exist yet
      dstPath = (dest + images[c]).toLowerCase();
      if (!fs.existsSync(dstPath)) {
        // add the thumbnail to the queue
        queue.push({
          'srcPath': srcPath,
          'dstPath': dstPath,
          'width': 384,
          'height': 384,
          'quality': 0.6
        });
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
    var item = queue.pop();
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
    // report what was done
    console.log('generated:', item.dstPath);
  }
};

// start processing the queue
makeImages(generateQueue());
//console.log(generateQueue());
