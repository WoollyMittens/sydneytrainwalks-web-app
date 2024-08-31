// dependencies
import ex from 'exif';
import fsp from 'fs/promises';
const source = '../src/large/';
const destination = '../inc/exifs/';

// import the exif data from an image file
function extractExif(options) {
	// promise the EXIF data
	return new Promise((resolve, reject) => {
		// load the image asynchronousely
		new ex.ExifImage(options, (error, exifData) => {
			// reject the promise
			if (error) { console.log('ERROR: ' + error); reject({}); }
			// resolve the promise
			else { resolve(exifData); }
		});
	});
}

// export the data to a file
async function exportJson(data, name) {
	// prepare the output
	const path = destination + name + '.json';
	const contents = JSON.stringify(data, null,'\t' );
	// export as json
	const result = await fsp.writeFile(path, contents);
	console.log('exported:', path, result);
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

// processes an original from the queue into a thumbnail and a full size
async function parseImage(path) {
	// process the item in the queue
	let response = await extractExif({ 'image': path });
	// define some working parameters
	let deg, min, sec, ref, lon, lat;
	// convert the lat into a usable format
	try {
		deg = response.gps.GPSLatitude[0];
		min = response.gps.GPSLatitude[1];
		sec = response.gps.GPSLatitude[2];
		ref = response.gps.GPSLatitudeRef;
		lat = (deg + min / 60 + sec / 3600) * (ref === "N" ? 1 : -1);
		// convert the lon into a usable format
		deg = response.gps.GPSLongitude[0];
		min = response.gps.GPSLongitude[1];
		sec = response.gps.GPSLongitude[2];
		ref = response.gps.GPSLongitudeRef;
		lon = (deg + min / 60 + sec / 3600) * (ref === "W" ? -1 : 1);
	} catch (e) { console.log('no geolocation:', path); }
	// return the processed geodata
	return { 'lon' : lon, 'lat' : lat };
};

// process all the files in a folder
async function parseFiles(folder) {
	// read the files from the folder
	const exifs = {};
	const files = await filterDirectory(source + folder, /.jpg$/i);
	//files.length = 3;
	// for every file
	for (let file of files) {
		// retrieve its exif data
		exifs[file.toLowerCase()] = await parseImage(source + folder + '/' + file);
	}
	// export the exifs
	exportJson(exifs, folder);
}

// process all the folders in the source path
async function parseFolders() {
	// read the folders from the source
	const folders = await filterDirectory(source, null, /^[.]/);
	//folders.length = 3;
	// for every folder
	for (let folder of folders) {
		// parse its contents
		parseFiles(folder, {});
	}
}

// start processing the source folder
parseFolders();
