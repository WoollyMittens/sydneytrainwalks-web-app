// dependencies
import fsp from 'fs/promises';
import { utimes } from 'utimes';
const source = '../src/large/tuggerah-wyrrabalong-wyong/';

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

// process all the files in a folder
async function parseFiles(folder) {
	// read the files from the folder
	const exifs = {};
	const files = await filterDirectory(folder, /.jpg$/i);
	//files.length = 3;
	// for every file
	for (let file of files) {
		// retrieve its exif data
		// reconstruct the creation date and time from the file name
		let year = +file.slice(4, 8);
		let month = +file.slice(8, 10);
		let day = +file.slice(10, 12);
		let hour = +file.slice(13, 15);
		let minute = +file.slice(15, 17);
		let second = +file.slice(17, 19);
		let millisecond = +file.slice(19, 22);
		let time = new Date(year, month - 1, day, hour, minute, second, millisecond);
		console.log('file', file, time.getTime());
		await utimes(folder + file, time.getTime());


	}
}

parseFiles(source);