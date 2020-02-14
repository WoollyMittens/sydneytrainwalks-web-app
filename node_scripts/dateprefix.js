var fs = require('fs');
var ex = require('exif');
var folder = '../_new/mogocampground-dharug-mogocampground';

function lead(number, digits, multiplyer) {
  return ("0000000" + (number * multiplyer)).slice(-digits);
}

function createQueue() {
  var queue = [];
  var isInvisible = new RegExp('^[.]');
  var isImage = new RegExp('.jpg$', 'i');
  var contents = fs.readdirSync(folder);
  for (var a = 0, b = contents.length; a < b; a += 1) {
    if (!isInvisible.test(contents[a]) && isImage.test(contents[a])) {
      queue.push({'date': null, 'name': contents[a]});
    }
  }
  return queue;
};

function addDates(index, queue) {
  new ex.ExifImage({'image': folder + '/' + queue[index].name}, function (error, exifData) {
    if (error) return false;
    queue[index].date = exifData.exif.DateTimeOriginal;
    if (index < queue.length - 1) { addDates(index + 1, queue); }
    else { sortQueue(queue) }
  });
};

function sortQueue(queue) {
  queue.sort(function(a, b) {
    return (a.date > b.date) ? 1 : -1;
  });
  for (a = 0, b = queue.length; a < b; a += 1) {
    prependDate(a, queue[a]);
  }
};

function prependDate(index, item) {
  var prefix = lead(index, 4, 10);
  console.log('rename:', (folder + '/' + prefix + '_' + item.name).toLowerCase(), item.date);
  fs.renameSync(
    folder + '/' + item.name,
    (folder + '/' + prefix + '_' + item.name).toLowerCase()
  );
};

addDates(0, createQueue());
