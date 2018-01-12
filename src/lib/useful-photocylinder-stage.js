/*
	Source:
	van Creij, Maurice (2018). "useful-photocylinder.js: Displays a cylindrical projection of a panoramic image.", version 20180102, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Photocylinder = useful.Photocylinder || function () {};

// extend the constructor
useful.Photocylinder.prototype.Stage = function (parent) {

	"use strict";

	// PROPERTIES

	this.parent = parent;
    this.config = parent.config;
	this.popup = this.config.popup;
	this.image = this.config.image;
	this.imageAspect = null;
	this.wrapper = null;
	this.wrapperAspect = null;
	this.baseAngle = 60;
	this.baseSize = 500;
	this.obj = null;
	this.objRow = null;
	this.objCols = [];
	this.fov = null;
	this.zoom = {};
	this.rotate = {};
	this.offset = {};
	this.tracked = null;
	this.increment = this.config.idle;
	this.auto = true;

	// METHODS

	this.init = function () {
		// prepare the markup
		this.build();
		// render the display
		this.render();
		// add the controls
		this.controls();
		// rescale after resize
		window.addEventListener('resize', this.resize.bind(this));
	};

	this.build = function() {
		// add the wrapper
		this.wrapper = document.createElement('div');
		this.wrapper.setAttribute('class', 'photo-cylinder');
		// add the parent object
		this.obj = document.createElement('div');
		this.obj.setAttribute('class', 'pc-obj');
		this.wrapper.appendChild(this.obj);
		// add the row
		this.objRow = document.createElement('div');
		this.objRow.setAttribute('class', 'pc-obj-row');
		this.obj.appendChild(this.objRow);
		// add the columns
		for (var a = 0, b = 8; a < b; a += 1) {
			this.objCols[a] = document.createElement('span');
			this.objCols[a].setAttribute('class', 'pc-obj-col pc-obj-col-' + a);
			this.objRow.appendChild(this.objCols[a]);
		}
		// add the image
		this.wrapper.appendChild(this.image);
		// insert the object
		this.popup.appendChild(this.wrapper);
	};

	this.render = function() {
		// retrieve the field of view from the image source
		var url = this.image.getAttribute('src');
		this.fov = this.config.spherical.test(url) ? 360 : 180;
		// get the aspect ratio from the image
		this.imageAspect = this.image.offsetWidth / this.image.offsetHeight;
		// get the field of view property or guess one
		this.wrapper.className += (this.fov < 360) ? ' pc-180' : ' pc-360';
		// calculate the zoom limits - scale = aspect * (360 / fov) * 0.3
		this.zoom.min = Math.max(this.imageAspect * (360 / this.fov) * 0.3, 1);
		this.zoom.max = 10;
		// the offset limits are 0 at zoom level 1 be definition, because there is no overscan
		this.offset.min = 0;
		this.offset.max = 0;
		// set the image source as the background image for the polygons
		for (var a = 0, b = this.objCols.length; a < b; a += 1) {
			this.objCols[a].style.backgroundImage = "url('" + url + "')";
		}
		// set the initial zoom
		this.resize();
		// set the initial rotation
		this.recentre();
		// start the idle animation
		this.animate();
	};

	this.controls = function() {
		// add touch controls
		this.wrapper.addEventListener('touchstart', this.touch.bind(this, 'start'));
		this.wrapper.addEventListener('touchmove', this.touch.bind(this, 'move'));
		this.wrapper.addEventListener('touchend', this.touch.bind(this, 'end'));
		// add mouse controls
		this.wrapper.addEventListener('mousedown', this.touch.bind(this, 'start'));
		this.wrapper.addEventListener('mousemove', this.touch.bind(this, 'move'));
		this.wrapper.addEventListener('mouseup', this.touch.bind(this, 'end'));
		this.wrapper.addEventListener('mousewheel', this.wheel.bind(this), false);
	    this.wrapper.addEventListener('DOMMouseScroll', this.wheel.bind(this), false);
	};

	this.coords = function(evt) {
		return {
			x: evt.screenX || evt.touches[0].screenX,
			y: evt.screenY || evt.touches[0].screenY,
			z: (evt.touches && evt.touches.length > 1) ? Math.abs(evt.touches[0].screenX - evt.touches[1].screenX + evt.touches[0].screenY - evt.touches[1].screenY) : 0
		}
	};

	this.recentre = function() {
		// reset the initial rotation
		this.rotate(this.fov/2);
	};

	this.zoom = function(factor, offset) {
		// limit the zoom
		this.zoom.current = Math.max(Math.min(factor, this.zoom.max), this.zoom.min);
		// calculate the view angle
		this.baseAngle = 60 * this.wrapperAspect * (this.zoom.min / this.zoom.current);
		// centre the zoom
		this.offset.max = (this.zoom.current - this.zoom.min) / 8;
		this.offset.min = -1 * this.offset.max;
		this.offset.current = Math.max(Math.min(offset, this.offset.max), this.offset.min);
		// calculate the rotation limits
		var overscanAngle = (this.baseAngle - 360 / this.objCols.length) / 2;
		this.rotate.min = (this.fov < 360) ? overscanAngle : 0;
		this.rotate.max = (this.fov < 360) ? this.fov - this.baseAngle + overscanAngle : this.fov;
		// dynamically adjust the zoom to the component size
		var scale = this.wrapper.offsetHeight / this.baseSize;
		this.obj.style.transform = 'translate(-50%, ' + ((0.5 + this.offset.current * scale) * -100) + '%) scale(' + (this.zoom.current * scale) + ')';
	};

	this.rotate = function(angle) {
		// limit or loop the rotation
		this.rotate.current = (this.fov < 360) ? Math.max(Math.min(angle, this.rotate.max), this.rotate.min) : angle%360 ;
		// set rotation
		this.objRow.style.transform = 'rotateY(' + this.rotate.current + 'deg)';
	};

	this.redraw = function() {
		// TODO: apply all transformations in one go (allows obj and obj-row to merge)
	};

	this.animate = function(allow) {
		// accept overrides
		if (typeof allow === 'boolean') {
			this.auto = allow;
		}
		// if animation is allowed
		if (this.auto) {
			// in 180 degree pictures adjust increment and reverse, otherwise loop forever
			if (this.rotate.current + this.increment * 2 > this.rotate.max) this.increment = -this.config.idle;
			if (this.rotate.current + this.increment * 2 < this.rotate.min) this.increment = this.config.idle;
			var step = (this.fov < 360) ? this.rotate.current + this.increment : (this.rotate.current + this.increment) % 360;
			// advance rotation incrementally, until interrupted
			this.rotate(step);
			window.requestAnimationFrame(this.animate.bind(this));
		}
	};

	// EVENTS

	this.wheel = function(evt) {
		// cancel the scrolling
		evt.preventDefault();
		// stop animating
		this.auto = false;
		// get the feedback
		var coords = this.coords(evt);
		var distance = evt.deltaY || evt.wheelDeltaY || evt.wheelDelta;
		this.zoom(this.zoom.current + distance / this.wrapper.offsetHeight, this.offset.current);
	};

	this.touch = function(phase, evt) {
		// cancel the click
		evt.preventDefault();
		// pick the phase of interaction
		var coords, scale = this.zoom.current / this.zoom.min;
		switch(phase) {
			case 'start':
				// stop animating
				this.auto = false;
				// start tracking
				this.tracked = this.coords(evt);
				break;
			case 'move':
				if (this.tracked) {
					coords = this.coords(evt);
					// calculate the rotation
					this.rotate(this.rotate.current + this.baseAngle * (this.tracked.x - coords.x) / this.wrapper.offsetWidth / scale);
					// calculate the zoom
					this.zoom(
						this.zoom.current - (this.tracked.z - coords.z) / this.wrapper.offsetWidth / scale,
						this.offset.current + (this.tracked.y - coords.y) / this.wrapper.offsetHeight / scale
					);
					// update the step
					this.tracked.x = coords.x;
					this.tracked.y = coords.y;
					this.tracked.z = coords.z;
				}
				break;
			case 'end':
				// stop tracking
				this.tracked = null;
				// TODO: maybe resume animating
				break;
		}
	};

	this.resize = function() {
		// update the wrapper aspect ratio
		this.wrapperAspect = (this.wrapper.offsetWidth / this.wrapper.offsetHeight);
		// restore current values
		var factor = this.zoom.current || 1;
		var offset = this.offset.current || 0;
		var angle = this.rotate.current || this.fov/2;
		// reset to zoom
		this.zoom(factor, offset);
		// reset the rotation
		this.rotate(angle);
	};

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Photocylinder.Stage;
}
