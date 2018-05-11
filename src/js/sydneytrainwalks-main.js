/*
	Sydney Train Walks
*/

// create the constructor if needed
var SydneyTrainWalks = SydneyTrainWalks || function() {};

// extend the constructor
SydneyTrainWalks.prototype.Main = function(config, context) {

	// PROPERTIES

	this.context = context;
	this.config = config;

	this.config.extend = function(properties) {
		for (var name in properties) {
			this[name] = properties[name];
		}
	};

	// COMPONENTS

	this.busy = new context.Busy(this).init();
	this.index = new context.Index(this).init();
	this.overview = new context.Overview(this).init();
	this.details = new context.Details(this).init();
	this.about = new context.About(this).init();
	this.footer = new context.Footer(this).init();

	// METHODS

	this.init = function() {
		// start the fast click event
		FastClick.attach(document.body);
		// notice if this is iOS
		var parent = document.getElementsByTagName('html')[0];
		parent.className = (navigator.userAgent.match(/ipad;|iphone|ipod touch;/i))
			? parent.className.replace('ios-false', 'ios-true')
			: parent.className.replace('ios-true', 'ios-false');
		// recover the previous state
		var storedId = window.localStorage.getItem('id'),
			storedMode = window.localStorage.getItem('mode');
		// restore the previous state
		if (storedId && storedMode && GuideData[storedId]) {
			// update the interface to the stored state
			this.update(storedId, storedMode);
		}
		// remove busy screen after a redraw
		setTimeout(this.busy.hide.bind(this), 300);
		// return the object
		return this;
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

	this.remoteLink = function(evt) {
		var href = evt.target.getAttribute("href");
		if(/^http/i.test(href)) {
			evt.preventDefault();
			window.open(href, '_system', 'location=yes');
		}
	};

	// EVENTS

	document.body.addEventListener("click", this.remoteLink.bind(this));

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = SydneyTrainWalks.Main;
}
