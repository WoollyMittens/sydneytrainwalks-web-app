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
		this.config = config || {};
		this.config.extend = function(properties) {
			for (var name in properties) {
				this[name] = properties[name];
			}
		};
		// initialise the components
		this.about = new About(this);
		this.busy = new Busy(this);
		this.details = new Details(this);
		this.footer = new Footer(this);
		this.header = new Header(this);
		this.index = new Index(this);
		this.overview = new Overview(this);
		this.trophies = new Trophies(this);
		this.editor = new Editor();
		// start the app
		this.init();
	}

	update(id, mode) {
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

	init() {
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
		// restore the previous state
		// TODO: other then a failed fetch there is no way to check if an ID (still) exists
		// TODO: maybe we can return a state from the update and implement the startScreen after it fails
		if (storedId && storedMode && GuideData[storedId]) { this.update(storedId, storedMode); }
		else if (startScreen) { document.body.className = 'screen-' + startScreen; }
		// remove busy screen after a redraw
		setTimeout(this.busy.hide.bind(this), 300);
		// handle external links
		document.body.addEventListener("click", this.remoteLink.bind(this));
	}
}

// autostart if preconfigured
if (typeof stwConfig !== undefined) {
	const sydneyTrainWalks = new SydneyTrainWalks(stwConfig);
}
