/*
	Sydney Train Walks - Details View
*/

// create the constructor if needed
var SydneyTrainWalks = SydneyTrainWalks || function() {};

// extend the constructor
SydneyTrainWalks.prototype.Details = function(parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.returnTo = 'guide';

	this.config.extend({
		'title': document.querySelector('.subtitle > h2'),
		'guide': document.querySelector('.guide'),
		'leaflet': document.querySelector('.photomap-leaflet'),
		'return': document.querySelector('.photomap-return'),
		'wall': document.querySelector('.photowall'),
		'titleTemplate': document.getElementById('title-template'),
		'thumbnailTemplate': document.getElementById('thumbnail-template'),
		'wallTemplate': document.getElementById('wall-template'),
		'creditTemplate': document.getElementById('credit-template')
	});

	// METHODS

	this.init = function() {
		// return the object
		return this;
	};

	this.update = function(id) {
		// update all the elements with the id
		this.updateTitle(id);
		this.updateGuide(id);
		this.updateMap(id);
		this.updateWall(id);
	};

	this.updateTitle = function(id) {
		// fill in the title template
		this.config.title.innerHTML = this.config.titleTemplate.innerHTML
			.replace(/{startTransport}/g, GuideData[id].markers.start.type)
			.replace(/{startLocation}/g, GuideData[id].markers.start.location)
			.replace(/{walkLocation}/g, GuideData[id].location)
			.replace(/{walkDuration}/g, GuideData[id].duration)
			.replace(/{walkLength}/g, GuideData[id].length)
			.replace(/{endTransport}/g, GuideData[id].markers.end.type)
			.replace(/{endLocation}/g, GuideData[id].markers.end.location);
		// add the onclick handler
		console.log("title clicked");
		this.config.title.onclick = function(evt) { document.location.replace('./'); };
	};

	this.updateGuide = function(id) {
		// gather the information
		var _this = this,
			description = '<p>' + GuideData[id].description.join('</p><p>') + '</p>',
			duration = GuideData[id].duration,
			length = GuideData[id].length,
			gpx = this.config.gpx.replace(/{id}/g, id),
			there = '<p>' + GuideData[id].markers.start.description + '</p>',
			back = '<p>' + GuideData[id].markers.end.description + '</p>',
			landmarks = this.updateLandmarks(id);
		// fill the guide with information
		this.config.guide.innerHTML = this.config.guideTemplate.innerHTML
			.replace(/{description}/g, description)
			.replace(/{duration}/g, duration)
			.replace(/{length}/g, length)
			.replace(/{gpx}/g, gpx)
			.replace(/{there}/g, there)
			.replace(/{back}/g, back)
			.replace(/{landmarks}/g, landmarks);
		// start the script for the image viewer
		this.config.photocylinder = new useful.Photocylinder().init({
			'elements': document.querySelectorAll('.guide .cylinder-image'),
			'container': this.config.guide,
			'spherical': /fov360|\d{3}_r\d{6}/i,
			'cylindrical': /fov180/i,
			'slicer': this.config.slice,
			'idle': 0.1,
			'opened': function(link) {
				_this.returnTo = 'guide';
				_this.config.photomap.indicate(link);
				return true;
			},
			'located': function(link) {
				_this.returnTo = 'guide';
				_this.config.photomap.indicate(link);
				document.body.className = document.body.className.replace(/screen-photos|screen-guide/, 'screen-map');
			},
			'closed': function() {
				_this.config.photomap.unindicate();
			}
		});
	};

	this.updateLandmarks = function(id) {
		// gather the information
		var prefix = (GuideData[id].assets)
			? GuideData[id].assets.prefix
			: id;
		var landmark, optional;
		var landmarks = (!GuideData[id].landmarks)
				? "<p>Detailed guides like <a href=\"http://www.sydneytrainwalks.com/details.php?id=adamstown-awabakal-newcastle\">this</a> will be rolled out in increments as they are completed.</p>"
				: "";
		var thumbnailTemplate = this.config.thumbnailTemplate.innerHTML;
		// fill the guide with landmarks
		for (var name in GuideData[id].landmarks) {
			// add the optional colour if needed
			optional = GuideData[id].landmarks[name].split(':')[0].toLowerCase();
			// get the description
			landmark = thumbnailTemplate
				.replace(/{id}/g, prefix)
				.replace(/{src}/g, name.toLowerCase() + '.jpg')
				.replace(/{description}/g, GuideData[id].landmarks[name]);
			// add extra markup for optional landmarks
			landmarks += (/optional: |detour: | attention:/gi.test(landmark))
				? '<div class="guide-' + optional + '">' + landmark.replace(/optional: |detour:| attention:/gi, '') + '</div>'
				: landmark;
		}
		// return the landmarks
		return landmarks;
	};

	this.updateMap = function(id) {
		// get the properties if this is a segment of another walk
		var prefix = (GuideData[id].assets && GuideData[id].assets.prefix)
			? GuideData[id].assets.prefix
			: id;
		// add the click event to the map back button
		this.config.return.addEventListener('click', this.onReturnFromMap.bind(this));
		// clear the old map if active
		if (this.config.photomap) {
			this.config.photomap.stop();
		}
		// start the map
		this.config.photomap = new useful.Photomap().init({
			'element': this.config.leaflet,
			'pointer': this.config.pointer,
			'tiles': this.config.onlineTiles,
			'local': this.config.offlineTiles,
			'missing': this.config.missing,
			'gpx': this.config.gpx.replace(/{id}/g, id),
			'gpxData': GpxData[id],
			'exif': this.config.exif,
			'exifData': ExifData[prefix],
			'zoom': GuideData[id].zoom,
			'minZoom': 10,
			'maxZoom': 15,
			'markers': GuideData[id].markers,
			'indicator': GuideData[id].indicator,
			'credit': this.config.creditTemplate.innerHTML
		});
	};

	this.updateWall = function(id) {
		var _this = this,
			src,
			srcs = [],
			wallTemplate = this.config.wallTemplate.innerHTML,
			wallHtml = '';
		// reset the wall
		this.config.wall.className = this.config.wall.className.replace(/-active/g, '-passive');
		// get the properties if this is a segment of another walk
		var prefix = (GuideData[id].assets && GuideData[id].assets.prefix)
			? GuideData[id].assets.prefix
			: id;
		var start = (GuideData[id].assets && GuideData[id].assets.start)
			? GuideData[id].assets.start
			: 0;
		var end = (GuideData[id].assets && GuideData[id].assets.end)
			? GuideData[id].assets.end + 1
			: null;
		// get the photos
		for (src in ExifData[prefix]) {
			srcs.push(src);
		}
		// create a list of photos
		for (var a = start, b = end || srcs.length; a < b; a += 1) {
			wallHtml += wallTemplate
				.replace(/{id}/g, prefix)
				.replace(/{src}/g, srcs[a]);
		}
		// fill the wall with the photos
		this.config.wall.innerHTML = '<ul>' + wallHtml + '</ul>';
		// start the script for the wall
		this.config.photowall = new useful.Photowall().init({'element': this.config.wall});
		// start the script for the image viewer
		this.config.photocylinder = new useful.Photocylinder().init({
			'elements': document.querySelectorAll('.photowall .cylinder-image'),
			'container': this.config.wall,
			'spherical': /fov360|\d{3}_r\d{6}/i,
			'cylindrical': /fov180/i,
			'slicer': this.config.slice,
			'idle': 0.1,
			'opened': function(link) {
				_this.returnTo = 'photos';
				_this.config.photomap.indicate(link);
				return true;
			},
			'located': function(link) {
				_this.returnTo = 'photos';
				_this.config.photomap.indicate(link);
				document.body.className = document.body.className.replace(/screen-photos|screen-guide/, 'screen-map');
			},
			'closed': function() {
				_this.config.photomap.unindicate();
			}
		});
	};

	// EVENTS

	this.onReturnFromMap = function(evt) {
		// cancel the click
		evt.preventDefault();
		// return from the map
		document.body.className = document.body.className.replace(/screen-map/, 'screen-' + this.returnTo);
	};

	this.onSignExpanded = function(sign, signs, evt) {
		// get the current size
		var isLong = sign.className.match(/-long/);
		// reset all signs
		for (var a = 0, b = signs.length; a < b; a += 1) {
			// add a click event handler
			signs[a].className = signs[a].className.replace('-long', '-short');
		}
		// expand this sign
		if (!isLong) {
			sign.className = sign.className.replace('-short', '-long');
		}
	};

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = SydneyTrainWalks.Details;
}
