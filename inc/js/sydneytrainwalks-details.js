import { Photowall } from "./photowall.js";
import { Localmap } from "./localmap.js";
import { Photocylinder } from "./photocylinder.js";

export class Details {
	constructor(config, loadGuide, loadRoute, loadExif, trophies) {
		this.config = config;
		this.loadGuide = loadGuide;
		this.loadRoute = loadRoute;
		this.loadExif = loadExif;
		this.trophies = trophies;
		this.returnTo = 'guide';
		this.titleElement = document.querySelector('.subtitle > h2');
		this.guideElement = document.querySelector('.guide');
		this.localmapElement = document.querySelector('.localmap.directions');
		this.returnElement = document.querySelector('.localmap-return');
		this.wallElement = document.querySelector('.photowall');
		this.titleTemplate = document.getElementById('title-template');
		this.guideTemplate = document.getElementById('guide-template');
		this.thumbnailTemplate = document.getElementById('thumbnail-template');
		this.trophiesTemplate = document.getElementById('trophies-template');
		this.wallTemplate = document.getElementById('wall-template');
		this.creditTemplate = document.getElementById('credit-template');
		this.guideMap = null;
		this.init()
	}

	async update(id) {
		// load the guide that goes with the id
		const guide = await this.loadGuide(id);
		const route = await this.loadRoute(id);
		const exif = await this.loadExif(guide?.alias?.key || guide.key);
		// update all the elements with the id
		this.updateMeta(guide);
		this.updateTitle(guide);
		this.updateGuide(guide);
		this.updateMap(guide, route, exif);
		this.updateWall(guide, exif);
	}

	updateMeta(id) {
		// TODO: update META tags
	}

	updateTitle(guide) {
		// fill in the title template
		const markers = guide.markers;
		const start = markers[0];
		const end = markers.slice(-1)[0];
		this.titleElement.innerHTML = this.titleTemplate.innerHTML
			.replace(/{startTransport}/g, start.type)
			.replace(/{startLocation}/g, start.location)
			.replace(/{walkLocation}/g, guide.location)
			.replace(/{walkDuration}/g, guide.duration)
			.replace(/{walkDistance}/g, guide.distance)
			.replace(/{endTransport}/g, end.type)
			.replace(/{endLocation}/g, end.location);
	}

	updateGuide(guide) {
		// gather the information
		var description = '<p>' + guide.description.join(' ') + '</p>';
		var duration = guide.duration;
		var distance = guide.distance;
		var gpx = this.config.gpxUrl.replace(/{id}/g, guide.key);
		var markers = guide.markers;
		var there = '<p>' + markers[0].description + '</p>';
		var back = '<p>' + markers[markers.length - 1].description + '</p>';
		var landmarks = this.updateLandmarks(guide);
		var updated = guide.updated;
		var date = new Date(updated).toLocaleDateString('en-AU', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
		// fill the guide with information
		this.guideElement.innerHTML = this.guideTemplate.innerHTML
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
		const thumbnails = this.guideElement.querySelectorAll('.cylinder-image');
		for (let thumbnail of thumbnails) {
			// TODO: destroy after use
			new Photocylinder({
				'element': thumbnail,
				'sequence': thumbnails,
				'container': this.guideElement,
				'spherical': /fov360|\d{3}_r\d{6}/i,
				'cylindrical': /fov180/i,
				'idle': 0.1,
				'opened': (link) => {
					this.returnTo = 'guide';
					this.config.guideMap.indicate(link);
					return true;
				},
				'located': (link) => {
					this.returnTo = 'guide';
					this.config.guideMap.indicate(link);
					document.body.className = document.body.className.replace(/screen-photos|screen-guide/, 'screen-map');
				},
				'closed': () => {
					this.config.guideMap.unindicate();
				}
			});
		}
	}

	updateLandmarks(guide) {
		// gather the information
		var prefix = (guide.alias) ? guide.alias.key : guide.key;
		var landmark, landmarks = "";
		// fill the guide with landmarks
		guide.markers.map((marker) => {
			// if is a landmark if it has a photo
			if (marker.photo) {
				// get the description
				landmark = this.addThumbnail(prefix, marker);
				// add extra markup for optional landmarks
				if (marker.optional) { landmarks += '<div class="guide-optional">' + landmark + '</div>'; }
				else if (marker.detour) { landmarks += '<div class="guide-detour">' + landmark + '</div>'; }
				else if (marker.attention) { landmarks += '<div class="guide-attention">' + landmark + '</div>'; }
				else { landmarks += landmark; }
			}
			// if the landmark is a trophy location
			else if (marker.badge) {
				// get the description
				landmark = this.addTrophy(marker);
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

	updateMap(guide, route, exif) {
		// get the properties if this is a segment of another walk
		var prefix = (guide.alias && guide.alias.key) ? guide.alias.key : guide.key;
		// add the click event to the map back button
		this.returnElement.addEventListener('click', this.onReturnFromMap.bind(this));
		// clear the old map if active
		if (this.config.guideMap) {
			this.config.guideMap.stop();
		}
		// start the map
		this.config.guideMap = new Localmap({
			// options
			'showFirst': true,
			// containers
			'container': this.localmapElement,
			'legend': null,
			// assets
			'thumbsUrl': this.config.localUrl + `/small/${prefix}/`,
			'photosUrl': this.config.remoteUrl + `/medium/${prefix}/`,
			'markersUrl': this.config.localUrl + '/img/marker-{type}.svg',
			'exifUrl': this.config.remoteUrl + '/php/imageexif.php?src=../../{src}',
			'guideUrl': this.config.localUrl + `/guides/${prefix}.json`,
			'routeUrl': this.config.remoteUrl + `/gpx/${prefix}.gpx`,
			'mapUrl': this.config.localUrl + `/maps/${prefix}.jpg`,
      		'tilesUrl': this.config.localUrl + '/tiles/{z}/{x}/{y}.jpg',
      		'tilesZoom': 15,
			// cache
			'guideData': guide,
			'routeData': route,
			'exifData': exif,
			// attribution
			'creditsTemplate': this.creditTemplate.innerHTML,
			// events
			'checkHotspot': this.trophies.check.bind(this.trophies),
			'enterHotspot': this.trophies.enter.bind(this.trophies),
			'leaveHotspot': this.trophies.leave.bind(this.trophies)
		});
	}

	updateWall(guide, exif) {
		var src, srcs = [], wallTemplate = this.wallTemplate.innerHTML, wallHtml = '';
		// reset the wall
		this.wallElement.className = this.wallElement.className.replace(/-active/g, '-passive');
		// get the properties if this is a segment of another walk
		var prefix = (guide.alias && guide.alias.key) ? guide.alias.key : guide.key;
		var start = (guide.alias && guide.alias.start) ? guide.alias.start : 0;
		var end = (guide.alias && guide.alias.end) ? guide.alias.end + 1 : null;
		// get the photos
		for (src in exif) {
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
		const thumbnails = this.wallElement.querySelectorAll('.cylinder-image');
		for (let thumbnail of thumbnails) {
			// TODO: destroy after use
			new Photocylinder({
				'element': thumbnail,
				'sequence': thumbnails,
				'container': this.wallElement,
				'spherical': /fov360|\d{3}_r\d{6}/i,
				'cylindrical': /fov180/i,
				'idle': 0.1,
				'opened': (link) => {
					this.returnTo = 'photos';
					this.config.guideMap.indicate(link);
					return true;
				},
				'located': (link) => {
					this.returnTo = 'photos';
					this.config.guideMap.indicate(link);
					document.body.className = document.body.className.replace(/screen-photos|screen-guide/, 'screen-map');
				},
				'closed': () => {
					this.config.guideMap.unindicate();
				}
			});
		}
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

	init() {
		// make the title a return button
		this.titleElement.onclick = function(evt) {
			evt.preventDefault();
			document.body.className = document.body.className.replace(/screen-photos|screen-guide|screen-map/, 'screen-menu');
		};
	}
}
