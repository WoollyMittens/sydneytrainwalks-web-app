// constants
var gm = require('gm');
var fs = require('fs');
var source = '../src/maps';
var destination = '../inc/maps';
var queue = [];

// generates a resize queue
var generateQueue = function(folder) {
  // get the folder list
  var images = [],
    srcPath, dstPath,
    contents = fs.readdirSync(folder),
    isInvisible = new RegExp('^[.]'),
    isImage = new RegExp('.png$', 'i');

  // for every folder
  for (var a = 0, b = contents.length; a < b; a += 1) {
    // if this isn't a bogus file
    if (!isInvisible.test(contents[a])) {

      // create the source path
      srcPath = folder + '/' + contents[a];
      // create the destination path
      dstPath = srcPath.replace(source, destination).replace(/.png/gi, '.jpg').toLowerCase();

      // if this is a photo
      if (isImage.test(contents[a])) {

        // if the destination photo doesn't exist yet
        if (!fs.existsSync(dstPath)) {

          // add the thumbnail to the queue
          queue.push({
            'srcPath': srcPath,
            'dstPath': dstPath,
            'quality': 0.6,
            'strip': true,
            'format': 'JPEG'
          });

        }

        // else this is a folder
      } else {

        // create the folders in the destination folder
        if (!fs.existsSync(dstPath)) {
          fs.mkdirSync(dstPath);
        };
        // recurse
        generateQueue(srcPath);

      }
    }
  }
};

// processes an original from the queue into a thumbnail and a full size
var makeImages = function() {
  // if the queue is not empty
  if (queue.length > 0) {
    // pick an item from the queue
    var item = queue[queue.length - 1];
    // process the item in the queue
    gm(item.srcPath)
      .resize(item.width, item.height)
      .autoOrient()
			.setFormat("jpg")
      .quality(parseInt(item.quality * 100))
      .write(item.dstPath, function(err) {
        if (err) {
          console.log(err);
        } else {
					// report what was done
	        console.log('generated:', item.dstPath);
	        // remove the item from the queue
	        queue.length = queue.length - 1;
	        // next iteration in the queue
	        makeImages(queue);
        }
      });
  }
};

// start processing the queue
generateQueue(source)
makeImages();
