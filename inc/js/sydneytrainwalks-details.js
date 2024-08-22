import { PhotoMosaic } from "./photo-mosaic.js";
import { LocalAreaMap } from "./local-area-map.js";
import { PhotoCylinder } from "./photo-cylinder.js";

export class Details {
	constructor(config, loadGuide, loadRoute, loadExif, trophies) {
		this.config = config;
		this.loadGuide = loadGuide;
		this.loadRoute = loadRoute;
		this.loadExif = loadExif;
		this.trophies = trophies;
		this.appView = document.querySelector('#appView');
		this.titleElement = document.querySelector('.subtitle > h2');
		this.localAreaMapElement = document.querySelector('.local-area-map.directions');
		this.legendElement = document.querySelector('.legend');
		this.mosaicElement = document.querySelector('.photo-mosaic');
		this.titleTemplate = document.getElementById('title-template');
		this.trophiesTemplate = document.getElementById('trophies-template');
		this.mosaicTemplate = document.getElementById('mosaic-template');
		this.introTemplate = document.getElementById('intro-template');
		this.outroTemplate = document.getElementById('outro-template');
		this.creditsTemplate = document.getElementById('credits-template');
		this.currentId = null;
		this.guideMap = null;
		this.photoCylinder = null;
		this.init()
	}

	async update(id) {
		this.currentId = id;
		// load the guide that goes with the id
		const guide = await this.loadGuide(id);
		const route = await this.loadRoute(id);
		console.log('loaded guide', guide, guide.key);
		const exif = await this.loadExif(guide.key);
		// update all the elements with the guide data
		this.updateMeta(guide);
		this.updateTitle(guide);
		this.updateMap(guide, route, exif);
		this.updateMosaic(guide, exif);
	}

	updateMeta(guide) {
		// format the guide data
		const start = guide.markers[0].location;
		const end = guide.markers[guide.markers.length - 1].location;
		const title = `A bushwalk from ${start} to ${end} via ${guide.location} - Sydney Hiking Trips`;
		const url = `./?key=${guide.key}`;
		// update the route without refreshing
		window.history.pushState({'key': guide.key}, title, url);
		// update the meta elements
		document.querySelector('title').innerHTML = title;
		document.querySelector('meta[name="description"]')?.setAttribute('content', guide.description);
		document.querySelector('meta[property="og:url"]')?.setAttribute('content', this.config.remoteUrl + url);
		document.querySelector('meta[property="og:image"]')?.setAttribute('content', this.config.remoteUrl + `/medium/${guide.key}/${guide.hero}`);
		document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
		document.querySelector('meta[property="og:description"]')?.setAttribute('content', guide.description);
		document.querySelector('link[rel="canonical"]')?.setAttribute('href', this.config.remoteUrl + url);
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
			.replace(/{walkDistance}/g, guide.distance.join(' / '))
			.replace(/{endTransport}/g, end.type)
			.replace(/{endLocation}/g, end.location);
	}
	
	updateMap(guide, route, exif) {
		// get the properties if this is a segment of another walk
		var prefix = guide.key;
		// clear the old map if active
		if (this.config.guideMap) {
			this.config.guideMap.stop();
		}
		// start the map
		this.config.guideMap = new LocalAreaMap({
			// options
			'mobileSize': "(max-width: 959px)",
			// containers
			'container': this.localAreaMapElement,
			'legend': this.legendElement,
			// assets
			'thumbsUrl': this.config.localUrl + `/small/${prefix}/`,
			'photosUrl': this.config.remoteUrl + `/medium/${prefix}/`,
			'markersUrl': this.config.localUrl + '/img/marker-{type}.svg',
			'exifUrl': exif,
			'guideUrl': guide,
			'routeUrl': route,
			'mapUrl': null, // this.config.localUrl + `/maps/${prefix}.jpg`,
      		'tilesUrl': this.config.localUrl + '/tiles/{z}/{x}/{y}.jpg',
      		'tilesZoom': 15,
			// templates
			'introTemplate': this.introTemplate.innerHTML,
			'outroTemplate': this.outroTemplate.innerHTML,
			'creditsTemplate': this.creditsTemplate.innerHTML,
			// events
			'checkHotspot': this.trophies.check.bind(this.trophies),
			'enterHotspot': this.trophies.enter.bind(this.trophies),
			'leaveHotspot': this.trophies.leave.bind(this.trophies),
			'showPhoto': (url, urls, evt) => {
				// don't navigate to the url
				evt.preventDefault();
				// kill the old popup if present
				if (this.photoCylinder) this.photoCylinder.destroy();
				// open a new popup
				this.photoCylinder = new PhotoCylinder({
					'url': url,
					'sequence': urls,
					'container': this.appView,
					'fov': (/r0\d{6}/i.test(url)) ? 360 : 180,
					'idle': 0.1,
					'navigated': (url) => {
						this.config.guideMap.indicate({'photo': url.split('/').pop()});
					},
					'opened': (url) => {
						this.config.guideMap.indicate({'photo': url.split('/').pop()});
					},
					'closed': () => {
						//this.config.guideMap.unindicate();
					}
				});
			}
		});
	}

	updateMosaic(guide, exif) {
		var src, srcs = [], mosaicTemplate = this.mosaicTemplate.innerHTML, mosaicHtml = '';
		// reset the wall
		this.mosaicElement.className = this.mosaicElement.className.replace(/-active/g, '-passive');
		// get the properties if this is a segment of another walk
		var prefix = guide.key;
		// get the photos
		for (src in exif) {
			srcs.push(src);
		}
		// create a list of photos
		for (var a = 0, b = srcs.length; a < b; a += 1) {
			mosaicHtml += mosaicTemplate
				.replace(/{id}/g, prefix)
				.replace(/{src}/g, srcs[a]);
		}
		// fill the wall with the photos
		this.mosaicElement.innerHTML = '<ul>' + mosaicHtml + '</ul>';
		// start the script for the wall
		this.config.photoMosaic = new PhotoMosaic({
			'element': this.mosaicElement,
			'clicked' : (url, urls, evt) => {
				// don't navigate to the url
				evt.preventDefault();
				// kill the old popup if present
				if (this.photoCylinder) this.photoCylinder.destroy();
				// open a new popup
				this.photoCylinder = new PhotoCylinder({
					'url': url,
					'sequence': urls,
					'container': this.appView,
					'fov': (/r0\d{6}/i.test(url)) ? 360 : 180,
					'idle': 0.1,
					'navigated': (url) => {
						this.config.guideMap.indicate({'photo': url.split('/').pop()});
					},
					'opened': (url) => {
						this.config.guideMap.indicate({'photo': url.split('/').pop()});
					},
					'closed': () => {
						//this.config.guideMap.unindicate();
					}
				});
			}
		});
	}

	init() {
		// handle browser back
		window.addEventListener("popstate", evt => {
			evt.preventDefault();
			console.log('back', evt.state.key);
			if (evt?.state?.key) this.update(evt.state.key);
			// TODO: update the route
		});
		// make the title a return button
		this.titleElement.addEventListener('click', evt => {
			evt.preventDefault();
			document.body.setAttribute('data-screen', 'menu');
			// TODO: update the route
		});
	}
}
