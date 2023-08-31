import { About } from "./sydneytrainwalks-about.js";
import { Busy } from "./sydneytrainwalks-busy.js";
import { Details } from "./sydneytrainwalks-details.js";
import { Footer } from "./sydneytrainwalks-footer.js";
import { Header } from "./sydneytrainwalks-header.js";
import { Index } from "./sydneytrainwalks-index.js";
import { Overview } from "./sydneytrainwalks-overview.js";
import { Trophies } from "./sydneytrainwalks-trophies.js";
import { Editor } from "./editor.js";

export class SydneyTrainWalks {
	constructor(config) {
		// merge the config with the default options
		this.config = config;
		// create a cache of loaded guides
		this.guideIds = [];
		this.guideCache = {};
		this.routeCache = {};
		// start the app
		this.init();
	}

	async loadGuide(id) {
		// if the id is not cached
		if (!this.guideCache[id]) {
			// load a fresh copy
			const url = this.config.guideUrl.replace(/{id}/g, id);
			const response  = await fetch(url);
			const guideData = await response.json();
			// store it in the cache
			this.guideCache[id] = guideData;
		}
		// return the cached item
		return this.guideCache[id];
	}

	async loadRoute(id) {
		// if the id is not cached
		if (!this.routeCache[id]) {
			// load a fresh copy
			const url = this.config.routeUrl.replace(/{id}/g, id);
			const response  = await fetch(url);
			const routeData = await response.json();
			// store it in the cache
			this.routeCache[id] = routeData;
		}
		// return the cached item
		return this.routeCache[id];
	}

	updateView(id, mode) {
		// store the current state
		window.localStorage.setItem('id', id);
		window.localStorage.setItem('mode', mode);
		// update the body class
		document.body.className = 'screen-' + mode;
		// update the details
		this.details.update(id);
		// update the footer
		this.footer.update(id);
	}

	getQuery(property) {
		var param = document.location.search.split(property + '=');
		return (param.length > 1) ? param[1].split(/&|#/)[0] : null;
	}

	remoteLink(evt) {
		var href = evt.target.getAttribute("href");
		// if this is an external link
		if(/^http/i.test(href) && !/.jpg$/i.test(href)) {
			// use the in app browser
			if (window?.cordova?.InAppBrowser) {
				evt.preventDefault();
				window.cordova.InAppBrowser.open(href, '_system', 'location=yes');
			// or open it in a new tab
			} else {
				evt.target.setAttribute('target', '_blank');
			}
		}
	}

	async init() {
		// load the index first
		this.guideCache['_index'] = await this.loadGuide('_index');
		// store all the available id's
		this.guideIds = this.guideCache['_index'].markers.map(marker => marker.key);
		// notice if this is iOS
		var root = document.getElementsByTagName('html')[0];
		root.className = (navigator.userAgent.match(/ipad;|iphone|ipod touch;/i))
			? root.className.replace('ios-false', 'ios-true')
			: root.className.replace('ios-true', 'ios-false');
		// recover the previous state
		var storedId = window.localStorage.getItem('id');
		var storedMode = window.localStorage.getItem('mode') || 'map';
		var startScreen = 'menu';
		// recover the state from the url
		storedId = this.getQuery('id') || storedId ;
		storedMode = this.getQuery('mode') || storedMode;
		startScreen = this.getQuery('screen') || startScreen;
		// initialise the components
		this.about = new About(this.config);
		this.busy = new Busy(this.config);
		this.details = new Details(this.config);
		this.footer = new Footer(this.config);
		this.header = new Header(this.config);
		this.index = new Index(this.config, this.guideCache, this.updateView.bind(this));
		this.overview = new Overview(this.config, this.guideIds, this.loadGuide.bind(this), this.loadRoute.bind(this), this.updateView.bind(this));
		this.trophies = new Trophies(this.config, this.guideIds, this.loadGuide.bind(this), this.updateView.bind(this), this.busy);
		this.editor = new Editor();
		// restore the previous state
		if (storedMode && storedId && this.guideIds.includes(storedId)) { this.updateView(storedId, storedMode); }
		else if (startScreen) { document.body.className = 'screen-' + startScreen; }
		// remove busy screen after a redraw
		setTimeout(this.busy.hide, 300);
		// handle external links
		document.body.addEventListener("click", this.remoteLink.bind(this));
	}
}

// autostart if preconfigured
if (typeof stwConfig !== undefined) {
	const sydneyTrainWalks = new SydneyTrainWalks(stwConfig);
}
