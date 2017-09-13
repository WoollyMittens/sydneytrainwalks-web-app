/*
	Source:
	van Creij, Maurice (2015). "useful.staging.js: Applies a classname to things that are inside the viewport", version 20150116, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the global object if needed
var useful = useful || {};

// extend the global object
useful.Staging = function() {

	// PROPERTIES

	this.stage = null;
	this.actors = null;
	this.config = null;

	// METHODS

	this.init = function(config) {
		// store the configuration
		this.config = config;
		this.stage = config.stage;
		this.actors = config.actors || document.querySelectorAll('.off-stage');
		// set the default offset if there wasn't one
		this.config.offset = this.config.offset || 0;
		// set the scrolling event handler
		this.stage.addEventListener('scroll', this.onUpdate(), true);
		// perform the first redraw
		this.update();
		// return the object
		return this;
	};

	this.update = function() {
		// if we can measure the stage
		if (this.stage.offsetHeight > 0) {
			// for every watched element
			for (var a = 0, b = this.actors.length; a < b; a += 1) {
				// if the object is in the viewport
				if (this.isElementInViewport(this.actors[a], this.config.offset).visible) {
					// mark its visibility
					this.actors[a].className = this.actors[a].className.replace(/ off-stage| on-stage|off-stage|on-stage/i, '') + ' on-stage';
				} else {
					// mark the object is outsidie the viewport
					this.actors[a].className = this.actors[a].className.replace(/ off-stage| on-stage|off-stage|on-stage/i, '') + ' off-stage';
				}
			}
		}
	};

	this.isElementInViewport = function(el, dy) {
		var rect = el.getBoundingClientRect(),
			offset = dy || 0,
			height = (window.innerHeight || document.documentElement.clientHeight),
			width = (window.innerWidth || document.documentElement.clientWidth);
		return ({
			'above': rect.bottom < offset,
			'below': rect.top > (height + offset),
			'visible': rect.top < (height + offset) && rect.bottom > offset
		});
	};

	// EVENTS

	this.onUpdate = function() {
		var _this = this;
		return function() {
			_this.update();
		};
	};

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Staging;
}
