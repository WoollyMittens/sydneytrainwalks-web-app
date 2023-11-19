// dependencies
import gm from 'gm';
import fsp from 'fs/promises';
const large = '../src/large/';
const medium = '../inc/medium/';
const small = '../inc/small/';

// check if a file exists
async function checkExists(path) {
  let exists;
  // attempt to retrieve state on the given file
  try { const stats = await fsp.stat(path); exists = stats; } 
  catch (error) { exists = null; }
  // return the result
  return exists;
}

// creates a directory or returns the existing one
async function provideDirectory(path) {
  let exists;
  // attempt to create a folder
  try { await fsp.mkdir(path); exists = path; } 
  catch (error) { exists = (/EEXIST/.test(error)) ? path : null; }
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
	return files.filter(file => (include.test(file) && !exclude.test(file)));
}

function generateSmall(album, image) {
  const rawPath = large + album + '/' + image;
  const smallPath = (small + album + '/' + image).toLowerCase();
  // promise to generate the small version
  return new Promise((resolve, reject) => {
    gm(rawPath)
    //.crop('66%', '66%', '17%', '17%')
    .resize(600, 150)
    .autoOrient()
    .quality(60)
    .strip()
    .write(smallPath, function(err) {
      if (err) { console.log(err); reject(null); } 
      else { resolve(smallPath); }
    });
	});
}

function generateMedium(album, image) {
  const rawPath = large + album + '/' + image;
  const mediumPath = (medium + album + '/' + image).toLowerCase();
  // promise to generate the medium version
  return new Promise((resolve, reject) => {
    gm(rawPath)
    .resize(3200, 800)
    //.autoOrient()
    .quality(60)
    .write(mediumPath, function(err) {
      if (err) { console.log(err); reject(null); } 
      else { resolve(mediumPath); }
    });
	});
}

async function processImages(album) {
  // get a list of images in the album
  const rawImages = await filterDirectory(large + album, /.jpg$/i);
  // for every raw image
  for (let image of rawImages) {
    // if the small version doesn't exist yet
    let smallPath = (small + album + '/' + image).toLowerCase();
    let smallExists = await checkExists(smallPath);
    if (!smallExists) {
      // generate the small version
      let savedSmall = await generateSmall(album, image);
      console.log('exported:', savedSmall);
    }
    // if the medium version doesn't exist yet
    let mediumPath = (medium + album + '/' + image).toLowerCase();
    let mediumExists = await checkExists(mediumPath);
    if (!mediumExists) {
      // generate the medium version
      let savedMedium = await generateMedium(album, image);
      console.log('exported:', savedMedium);
    }
  }
}

async function processAlbums() {
  // get a list of raw albums in the source
  const rawAlbums = await filterDirectory(large, null, /^[.]/);
  // for every raw album
  for (let album of rawAlbums) {
      // create a folder for the small album
      await provideDirectory(small + album);
      // create a folder for the medium album
      await provideDirectory(medium + album);
      // generate the images
      await processImages(album);
  }
}

processAlbums();
