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
		var markers = GuideData[id].markers;
		this.config.title.innerHTML = this.config.titleTemplate.innerHTML
			.replace(/{startTransport}/g, markers[0].type)
			.replace(/{startLocation}/g, markers[0].location)
			.replace(/{walkLocation}/g, GuideData[id].location)
			.replace(/{walkDuration}/g, GuideData[id].duration)
			.replace(/{walkLength}/g, GuideData[id].length)
			.replace(/{endTransport}/g, markers[markers.length - 1].type)
			.replace(/{endLocation}/g, markers[markers.length - 1].location);
		// add the onclick handler
		this.config.title.onclick = function(evt) { document.location.replace('./'); };
	};

	this.updateGuide = function(id) {
		// gather the information
		var _this = this;
		var description = '<p>' + GuideData[id].description.join('</p><p>') + '</p>';
		var duration = GuideData[id].duration;
		var length = GuideData[id].length;
		var gpx = this.config.gpx.replace(/{id}/g, id);
		var markers = GuideData[id].markers;
		var there = '<p>' + markers[0].description + '</p>';
		var back = '<p>' + markers[markers.length - 1].description + '</p>';
		var landmarks = this.updateLandmarks(id);
		// fill the guide with information
		this.config.guide.innerHTML = this.config.guideTemplate.innerHTML
			.replace(/{description}/g, description)
			.replace(/{duration}/g, duration)
			.replace(/{length}/g, length)
			.replace(/{gpx}/g, gpx)
			.replace(/{there}/g, there)
			.replace(/{back}/g, back)
			.replace(/{landmarks}/g, landmarks);
		// add event handlers for the locator icons
		var buttons = document.querySelectorAll('.guide .guide-locate');
		for (var a = 0, b = buttons.length; a < b; a += 1) {
			buttons[a].addEventListener('click', this.onLocate.bind(this, buttons[a]));
		}
		// start the script for the image viewer
		this.config.photocylinder = new Photocylinder({
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
		var prefix = (GuideData[id].assets) ? GuideData[id].assets.prefix : id;
		var landmark, landmarks = "";
		var thumbnailTemplate = this.config.thumbnailTemplate.innerHTML;
		// fill the guide with landmarks
		GuideData[id].markers.map(function (marker) {
			// it is a landmark if it has a photo
			if (marker.photo) {
				// get the description
				landmark = thumbnailTemplate
					.replace(/{id}/g, prefix)
					.replace(/{src}/g, marker.photo.toLowerCase())
					.replace(/{description}/g, marker.description);
				// add extra markup for optional landmarks
				if (marker.optional) { landmarks += '<div class="guide-optional">' + landmark + '</div>'; }
				else if (marker.detour) { landmarks += '<div class="guide-detour">' + landmark + '</div>'; }
				else if (marker.attention) { landmarks += '<div class="guide-attention">' + landmark + '</div>'; }
				else { landmarks += landmark; }
			}
		});
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
		// TODO: start Photomap if there's reliable internet, start Localmap if not
		this.config.photomap = new Photomap({
			'element': this.config.leaflet,
			'pointer': this.config.pointer,
			'leaflet' : L,
			'togeojson': toGeoJSON,
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
			'marker': './inc/img/marker-{type}.png',
			'indicator': './inc/img/marker-photo.png',
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
		this.config.photowall = new Photowall({
			'element': this.config.wall
		});
		// start the script for the image viewer
		this.config.photocylinder = new Photocylinder({
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

	this.onLocate = function(button, evt) {
		console.log('onLocate', button);
		// cancel the click
		evt.preventDefault();
		// remember where to return to
		this.returnTo = 'guide';
		// as the map to show the location
		this.config.photomap.indicate(button);
		// show the map screen
		document.body.className = document.body.className.replace(/screen-photos|screen-guide/, 'screen-map');
	};

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
