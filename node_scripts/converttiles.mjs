// constants
import gm from 'gm';
import fsp from "fs/promises";
const source = "../src/tiles/";
const destination = "../inc/tiles/";

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
	return files.filter((file) => include.test(file) && !exclude.test(file));
}

async function processTile(zFolder, xFolder, yTile) {
	// construct the paths
	const sourcePath = `${source}${zFolder}/${xFolder}/${yTile}`;
	const destinationPath = `${destination}${zFolder}/${xFolder}/${yTile.replace(/\.png/i, ".jpg")}`;
  const exists = await checkExists(destinationPath);
  // promise to convert the image
  return new Promise((resolve, reject) => {
    // if the target already exists
    if (exists) {
      // resolve immediately
      console.log("skipped:", destinationPath);
      resolve(destinationPath);
    }
    // or process the source
    else {
      gm(sourcePath)
      .resize(256, 256)
      //.autoOrient()
      .setFormat("jpg")
      .quality(parseInt(60))
      .write(destinationPath, function (err) {
        if (err) {
          console.log(err);
          console.log("failed:", destinationPath);
          reject(null);
        } else {
          console.log("processed:", destinationPath);
          resolve(destinationPath);
        }
      });
    }

  });
}

async function crawlLevelY(zFolder, xFolder) {
	// get a list of raw tiles in the source
	const yTiles = await filterDirectory(source + zFolder + "/" + xFolder, null, /^[.]/);
	// for every raw album
	for (let yTile of yTiles) {
    // create the target folder
    await provideDirectory(destination + zFolder + "/" + xFolder);
    // process the tile
    let processedTile = await processTile(zFolder, xFolder, yTile);
	}
}

async function crawlLevelX(zFolder) {
	// get a list of raw tiles in the source
	const xFolders = await filterDirectory(source + zFolder, null, /^[.]/);
	// for every raw album
	for (let xFolder of xFolders) {
		await crawlLevelY(zFolder, xFolder);
	}
}

async function crawlLevelZ() {
	// get a list of raw tiles in the source
	const zFolders = await filterDirectory(source, null, /^[.]/);
	// for every raw album
	for (let zFolder of zFolders) {
		await crawlLevelX(zFolder);
	}
}

crawlLevelZ();
