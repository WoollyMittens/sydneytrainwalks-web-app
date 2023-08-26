/*
	Sydney Train Walks
*/

// establish the class
var SydneyTrainWalks = function(config) {

	// PROPERTIES

	this.config = config || {};
	this.config.extend = function(properties) {
		for (var name in properties) {
			this[name] = properties[name];
		}
	};

	// METHODS

	this.init = function() {
		// notice if this is iOS
		var parent = document.getElementsByTagName('html')[0];
		parent.className = (navigator.userAgent.match(/ipad;|iphone|ipod touch;/i))
			? parent.className.replace('ios-false', 'ios-true')
			: parent.className.replace('ios-true', 'ios-false');
		// recover the previous state
		var storedId = window.localStorage.getItem('id');
		var storedMode = window.localStorage.getItem('mode') || 'map';
		var startScreen = 'menu';
		// recover the state from the url
		storedId = this.getQuery('id') || storedId ;
		storedMode = this.getQuery('mode') || storedMode;
		startScreen = this.getQuery('screen') || startScreen;
		// restore the previous state
		if (storedId && storedMode && GuideData[storedId]) { this.update(storedId, storedMode); }
		else if (startScreen) { document.body.className = 'screen-' + startScreen; }
		// remove busy screen after a redraw
		setTimeout(this.busy.hide.bind(this), 300);
		// handle external links
		document.body.addEventListener("click", this.remoteLink.bind(this));
	};

	this.update = function(id, mode) {
		// store the current state
		window.localStorage.setItem('id', id);
		window.localStorage.setItem('mode', mode);
		// update the body class
		document.body.className = 'screen-' + mode;
		// update the details
		this.details.update(id);
		// update the footer
		this.footer.update(id);
	};

	this.getQuery = function(property) {
		var param = document.location.search.split(property + '=');
		return (param.length > 1) ? param[1].split(/&|#/)[0] : null;
	};

	this.remoteLink = function(evt) {
		var href = evt.target.getAttribute("href");
		// if this is an external link
		if(/^http/i.test(href) && !/.jpg$/i.test(href)) {
			// use the in app browser
			if (typeof cordova !== 'undefined' && cordova.InAppBrowser) {
				evt.preventDefault();
				cordova.InAppBrowser.open(href, '_system', 'location=yes');
			// or open it in a new tab
			} else {
				evt.target.setAttribute('target', '_blank');
			}
		}
	};

	// EVENTS

	// COMPONENTS

	if(config) {
		this.busy = new this.Busy(this);
		this.header = new this.Header(this);
		this.index = new this.Index(this);
		this.overview = new this.Overview(this);
		this.trophies = new this.Trophies(this);
		this.details = new this.Details(this);
		this.about = new this.About(this);
		this.footer = new this.Footer(this);
		this.init();
	}
};

// return as a require.js module
if (typeof define != 'undefined') define([], function() { return SydneyTrainWalks });
if (typeof module != 'undefined') module.exports = SydneyTrainWalks;
