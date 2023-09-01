// constants
import gm from 'gm';
import fsp from "fs/promises";
const source = '../src/trophies/';
const destination = '../inc/trophies/';

// check if a file exists
async function checkExists(path) {
  let exists;
  // attempt to retrieve state on the given file
  try { const stats = await fsp.stat(path); exists = stats; } 
  catch (error) { exists = null; }
  // return the result
  return exists;
}

// import a list of files in a directory
async function filterDirectory(path, include, exclude) {
	// default filters
	include = include || /.*/;
	exclude = exclude || /$^/;
	// read the folder listing
	const files = await fsp.readdir(path);
	// return only the filtered results
	return files.filter((file) => include.test(file) && !exclude.test(file));
}

// processes the original image into a thumbnail
async function makeImage(trophy) {
  // promise to convert the image
  return new Promise((resolve, reject) => {
    // resize the image
    gm(source + trophy)
    //.crop('66%', '66%', '17%', '17%')
    .resize(384, 384)
    //.autoOrient()
    .quality(parseInt(60))
    .strip()
    .write(destination + trophy, function(err) {
      if (err) {
        console.log('failed:', err);
        reject(err);
      } else {
        // report what was done
        console.log('generated:', destination + trophy);
        resolve(destination + trophy);
      }
    });

  });
}

async function makeImages() {
	// get a list of raw tiles in the source
	const trophies = await filterDirectory(source, /.jpg$/, /^[.]/);
	// for every raw trophy
	for (let trophy of trophies) {
    // if it doesn't exist yet
    let exists = await checkExists(destination + trophy);
    if (!exists) {
      // process the trophy image
      await makeImage(trophy);
    }
	}
}

// start processing the queue
makeImages();
