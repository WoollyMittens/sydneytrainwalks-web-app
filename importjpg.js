// constants
var gm = require('gm');
var fs = require('fs');
var large = './src/large/';
var medium = './inc/medium/';
var small = './inc/small/';

// generates a resize queue
var generateQueue = function() {
  // get the guide list
  var queue = [],
    images = [],
    srcPath, dstPath,
    guides = fs.readdirSync(wideIn),
    isInvisible = new RegExp('^[.]'),
    isPhoto = new RegExp('.jpg$', 'i'),
    guide;
  // for every guide
  for (var a = 0, b = guides.length; a < b; a += 1) {
    // if this isn't a bogus file
    if (!isInvisible.test(guides[a])) {
      // construct the guide name
      guide = guides[a].split('.')[0];
      // create the guides in the destination guide
      if (!fs.existsSync(small + guide)) {
        fs.mkdirSync(small + guide);
      }
      if (!fs.existsSync(medium + guide)) {
        fs.mkdirSync(medium + guide);
      }
      // get the guide contents
      images = (fs.existsSync(large + guide)) ? fs.readdirSync(large + guide) : [];
      //images.length = 1;
      // for every image in the guide
      for (var c = 0, d = images.length; c < d; c += 1) {
        // if this isn't a bogus file
        if (isPhoto.test(images[c])) {
          // create the source path
          srcPath = large + guide + '/' + images[c];
          // TODO: add .crop(width, height, x, y) to operation if the image is spherical
          // if the destination photo doesn't exist yet
          dstPath = (medium + guide + '/' + images[c]).toLowerCase();
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
          dstPath = (small + guide + '/' + images[c]).toLowerCase();
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
