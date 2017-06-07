/*
	Source:
	van Creij, Maurice (2015). "useful.staging.js: Applies a classname to things that are inside the viewport", version 20150116, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the global object if needed
var useful = useful || {};

// extend the global object
useful.Staging = function () {

	// PROPERTIES

	this.stage = null;
	this.actors = null;
	this.config = null;

	// METHODS

	this.init = function (config) {
		// store the configuration
		this.config = config;
		this.stage = config.stage;
		this.actors = config.actors;
		// set the default offset if there wasn't one
		this.config.offset = this.config.offset || 0;
		// set the default repeat behaviour
		this.config.always = this.config.always || false;
		// set the scrolling event handler
		this.stage.addEventListener('scroll', this.onUpdate(), true);
		// perform the first redraw
		this.update();
		// return the object
		return this;
	};

	this.update = function () {
		var objectPos, objectSize, relativePos, className, replace = new RegExp(' off-stage| on-stage|off-stage|on-stage', 'i');
		// get the scroll position
		var scrollSize = useful.positions.window(this.stage);
		var scrollPos = useful.positions.document(this.stage);
		// if we can measure the stage
		if (scrollSize.y !== 0) {
			// get the screen actors if they are unknown
			var actors = this.actors || document.querySelectorAll('.off-stage');
			// for every watched element
			for (var a = 0, b = actors.length; a < b; a += 1) {
				className = actors[a].className;
				// if this actor is still invisible
				if (replace.test(className) || cfg.always) {
					// get the object position / dimensions
					objectPos = { x : actors[a].offsetLeft, y : actors[a].offsetTop };
					objectSize = { x : actors[a].offsetWidth, y : actors[a].offsetHeight };
					// if the object is in the viewport
					if (objectPos.y + objectSize.y >= scrollPos.y - this.config.offset && objectPos.y < scrollPos.y + this.config.offset + scrollSize.y) {
						// if required position the parallax
						if (this.config.parallax) {
							relativePos = (objectPos.y - scrollPos.y + objectSize.y) / (scrollSize.y + objectSize.y) * 100;
							relativePos = (relativePos > 100) ? 100 : relativePos;
							relativePos = (relativePos < 0) ? 0 : relativePos;
							relativePos = relativePos / 4 + 37;
							actors[a].style.backgroundPosition = relativePos + '%' + ' 50%';
						}
						// mark its visibility
						actors[a].className = className.replace(replace, '') + ' on-stage';
					} else {
						// mark the object is outsidie the viewport
						actors[a].className = className.replace(replace, '') + ' off-stage';
					}
				}
			}
		}
	};

	// EVENTS

	this.onUpdate = function () {
		var _this = this;
		return function () { _this.update(); };
	};

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Staging;
}
