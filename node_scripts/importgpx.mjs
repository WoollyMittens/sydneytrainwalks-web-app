// dependencies
import fsp from 'fs/promises';
import toGeoJSON from '../inc/js/togeojson.js';
import { JSDOM } from 'jsdom';
const source = '../inc/gpx/';
const destination = '../inc/routes/';

// truncate a GPX route
function truncateRoute(xml) {
	// eliminate every second trackpoint
	const trkpt = xml.getElementsByTagName('trkpt');
	for (let a = trkpt.length - 2, b = 0; a > b; a -= 2) {
		trkpt[a].parentNode.removeChild(trkpt[a]);
	}
	// return the slimmed down route
	return xml;
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

// processes a GPX file into a geojson object
async function parseFiles() {
	// read the files from the source
	const files = await filterDirectory(source, null, /^[.]/);
	//files.length = 3;
	// read the contents of every file
	for (let file of files) {
		// read the contents of the file
		let data = await fsp.readFile(source + file);
		// if the file has content
		if (data) {
			// convert the data into xml dom
			let xml = new JSDOM(data).window.document;
			// trim down the route
			//xml = truncateRoute(xml);
			// convert the GPX into geoJson
			let geojson = toGeoJSON.gpx(xml);
			let geodata = JSON.stringify(geojson, null,'\t' );
			let filename = file.split('.')[0].toLowerCase() + '.json';
			// save as geojson
			let result = await fsp.writeFile(destination + filename, geodata);
			console.log('exported:', destination + filename, result);
		}
	}
};

// start processing the source folder
parseFiles();
