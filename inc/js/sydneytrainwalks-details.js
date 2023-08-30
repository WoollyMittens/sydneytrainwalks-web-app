import { Photowall } from "./photowall.js";
import { Localmap } from "./localmap.js";
import { Photocylinder } from "./photocylinder.js";

export class Details {
	constructor(config) {
		this.config = config;
		this.returnTo = 'guide';
		this.titleElement = document.querySelector('.subtitle > h2');
		this.guideElement = document.querySelector('.guide');
		this.localmapElement = document.querySelector('.localmap.directions');
		this.returnElement = document.querySelector('.localmap-return');
		this.wallElement = document.querySelector('.photowall');
		this.titleTemplate = document.getElementById('title-template');
		this.thumbnailTemplate = document.getElementById('thumbnail-template');
		this.trophiesTemplate = document.getElementById('trophies-template');
		this.wallTemplate = document.getElementById('wall-template');
		this.creditTemplate = document.getElementById('credit-template');
		this.init()
	}

	update(id) {
		// update all the elements with the id
		this.updateMeta(id);
		this.updateTitle(id);
		this.updateGuide(id);
		this.updateMap(id);
		this.updateWall(id);
	}

	updateMeta(id) {
		// TODO: update META tags
	}

	updateTitle(id) {
		// fill in the title template
		var markers = GuideData[id].markers;
		this.titleElement.innerHTML = this.titleTemplate.innerHTML
			.replace(/{startTransport}/g, markers[0].type)
			.replace(/{startLocation}/g, markers[0].location)
			.replace(/{walkLocation}/g, GuideData[id].location)
			.replace(/{walkDuration}/g, GuideData[id].duration)
			.replace(/{walkDistance}/g, GuideData[id].distance)
			.replace(/{endTransport}/g, markers[markers.length - 1].type)
			.replace(/{endLocation}/g, markers[markers.length - 1].location);
		// add the onclick handler
		this.titleElement.onclick = function(evt) {
			evt.preventDefault();
			document.body.className = document.body.className.replace(/screen-photos|screen-guide|screen-map/, 'screen-menu');
		};
	}

	updateGuide(id) {
		// gather the information
		var _this = this;
		var description = '<p>' + GuideData[id].description.join(' ') + '</p>';
		var duration = GuideData[id].duration;
		var distance = GuideData[id].distance;
		var gpx = this.config.gpxUrl.replace(/{id}/g, id);
		var markers = GuideData[id].markers;
		var there = '<p>' + markers[0].description + '</p>';
		var back = '<p>' + markers[markers.length - 1].description + '</p>';
		var landmarks = this.updateLandmarks(id);
		var updated = GuideData[id].updated;
		var date = new Date(updated).toLocaleDateString('en-AU', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
		// fill the guide with information
		this.guideElement.innerHTML = this.config.guideTemplate.innerHTML
			.replace(/{updated}/g, updated)
			.replace(/{date}/g, date)
			.replace(/{description}/g, description)
			.replace(/{duration}/g, duration)
			.replace(/{distance}/g, distance)
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
			'container': this.guideElement,
			'spherical': /fov360|\d{3}_r\d{6}/i,
			'cylindrical': /fov180/i,
			'slicer': this.config.sliceUrl,
			'idle': 0.1,
			'opened': function(link) {
				_this.returnTo = 'guide';
				_this.config.guideMap.indicate(link);
				return true;
			},
			'located': function(link) {
				_this.returnTo = 'guide';
				_this.config.guideMap.indicate(link);
				document.body.className = document.body.className.replace(/screen-photos|screen-guide/, 'screen-map');
			},
			'closed': function() {
				_this.config.guideMap.unindicate();
			}
		});
	}

	updateLandmarks(id) {
		// gather the information
		var _this = this;
		var prefix = (GuideData[id].alias) ? GuideData[id].alias.key : id;
		var landmark, landmarks = "";
		// fill the guide with landmarks
		GuideData[id].markers.map(function (marker) {
			// if is a landmark if it has a photo
			if (marker.photo) {
				// get the description
				landmark = _this.addThumbnail(prefix, marker);
				// add extra markup for optional landmarks
				if (marker.optional) { landmarks += '<div class="guide-optional">' + landmark + '</div>'; }
				else if (marker.detour) { landmarks += '<div class="guide-detour">' + landmark + '</div>'; }
				else if (marker.attention) { landmarks += '<div class="guide-attention">' + landmark + '</div>'; }
				else { landmarks += landmark; }
			}
			// if the landmark is a trophy location
			else if (marker.badge) {
				// get the description
				landmark = _this.addTrophy(marker);
				// add extra markup for optional landmarks
				landmarks += '<div class="guide-trophy">' + landmark + '</div>';
			}
		});
		// return the landmarks
		return landmarks;
	}

	addThumbnail(prefix, marker) {
		var thumbnailTemplate = this.thumbnailTemplate.innerHTML;
		return thumbnailTemplate
			.replace(/{id}/g, prefix)
			.replace(/{src}/g, marker.photo.toLowerCase())
			.replace(/{description}/g, marker.description);
	}

	addTrophy(marker) {
		var trophiesTemplate = this.trophiesTemplate.innerHTML;
		var storedTrophies = JSON.parse(window.localStorage.getItem('trophies') || "{}");
		var hasTrophy = storedTrophies[marker.title];
		return trophiesTemplate
			.replace(/{icon}/g, (hasTrophy) ? marker.badge : marker.type)
			.replace(/{title}/g, (hasTrophy) ? marker.explanation.join(' ') : marker.description)
			.replace(/{type}/g, marker.type)
			.replace(/{lon}/g, marker.lon)
			.replace(/{lat}/g, marker.lat);
	}

	updateMap(id) {
		// get the properties if this is a segment of another walk
		var prefix = (GuideData[id].alias && GuideData[id].alias.key)
			? GuideData[id].alias.key
			: id;
		// add the click event to the map back button
		this.returnElement.addEventListener('click', this.onReturnFromMap.bind(this));
		// clear the old map if active
		if (this.config.guideMap) {
			this.config.guideMap.stop();
		}
		// start the map
		this.config.guideMap = new Localmap({
			'key': id,
			'container': this.localmapElement,
			'legend': null,
			// assets
			'thumbsUrl': this.config.localUrl + '/small/{key}/',
			'photosUrl': this.config.remoteUrl + '/medium/{key}/',
			'markersUrl': this.config.localUrl + '/img/marker-{type}.svg',
			'exifUrl': this.config.exifUrl,
			'guideUrl': this.config.localUrl + '/guides/{key}.json',
			'routeUrl': this.config.remoteUrl + '/gpx/{key}.gpx',
			'mapUrl': this.config.localUrl + '/maps/{key}.jpg',
      		'tilesUrl': this.config.localUrl + '/tiles/{z}/{x}/{y}.jpg',
      		'tilesZoom': 15,
			// cache
			'guideData': GuideData,
			'routeData': GpxData,
			'exifData': ExifData,
			// attribution
			'creditsTemplate': this.creditTemplate.innerHTML,
			// events
			'checkHotspot': parent.trophies.check.bind(parent.trophies),
			'enterHotspot': parent.trophies.enter.bind(parent.trophies),
			'leaveHotspot': parent.trophies.leave.bind(parent.trophies)
		});
	}

	updateWall(id) {
		var _this = this,
			src,
			srcs = [],
			wallTemplate = this.wallTemplate.innerHTML,
			wallHtml = '';
		// reset the wall
		this.wallElement.className = this.wallElement.className.replace(/-active/g, '-passive');
		// get the properties if this is a segment of another walk
		var prefix = (GuideData[id].alias && GuideData[id].alias.key) ? GuideData[id].alias.key : id;
		var start = (GuideData[id].alias && GuideData[id].alias.start) ? GuideData[id].alias.start : 0;
		var end = (GuideData[id].alias && GuideData[id].alias.end) ? GuideData[id].alias.end + 1 : null;
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
		this.wallElement.innerHTML = '<ul>' + wallHtml + '</ul>';
		// start the script for the wall
		this.config.photowall = new Photowall({
			'element': this.wallElement
		});
		// start the script for the image viewer
		this.config.photocylinder = new Photocylinder({
			'elements': document.querySelectorAll('.photowall .cylinder-image'),
			'container': this.wallElement,
			'spherical': /fov360|\d{3}_r\d{6}/i,
			'cylindrical': /fov180/i,
			'slicer': this.config.sliceUrl,
			'idle': 0.1,
			'opened': function(link) {
				_this.returnTo = 'photos';
				_this.config.guideMap.indicate(link);
				return true;
			},
			'located': function(link) {
				_this.returnTo = 'photos';
				_this.config.guideMap.indicate(link);
				document.body.className = document.body.className.replace(/screen-photos|screen-guide/, 'screen-map');
			},
			'closed': function() {
				_this.config.guideMap.unindicate();
			}
		});
	}

	onLocate(button, evt) {
		// cancel the click
		evt.preventDefault();
		// remember where to return to
		this.returnTo = 'guide';
		// as the map to show the location
		this.config.guideMap.indicate(button);
		// show the map screen
		document.body.className = document.body.className.replace(/screen-photos|screen-guide/, 'screen-map');
	}

	onReturnFromMap(evt) {
		// cancel the click
		evt.preventDefault();
		// return from the map
		document.body.className = document.body.className.replace(/screen-map/, 'screen-' + this.returnTo);
	}

	init() {}
}
