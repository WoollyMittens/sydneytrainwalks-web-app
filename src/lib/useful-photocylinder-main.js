/*
	Source:
	van Creij, Maurice (2018). "useful-photocylinder.js: Displays a cylindrical projection of a panoramic image.", version 20180102, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Photocylinder = useful.Photocylinder || function() {};

// extend the constructor
useful.Photocylinder.prototype.Main = function(config, context) {

	"use strict";

	// PROPERTIES

	this.context = context;
	this.element = config.element;
	this.config = {
		'container': document.body,
		'spherical' : /fov360/,
		'cylindrical' : /fov180/,
		'slicer': '{src}',
		'idle': 0.1
	};

	for (name in config) {
		this.config[name] = config[name];
	}

	// METHODS

	this.init = function() {
		// set the event handler on the target element
		this.element.addEventListener('click', this.onElementClicked.bind(this));
	};

	this.success = function(url) {
		// check if the aspect ratio of the image can be determined
		var image = this.config.image;
		var isWideEnough = (image.naturalWidth && image.naturalHeight && image.naturalWidth / image.naturalHeight > 3);
		// show the popup
		this.popup = new this.context.Popup(this);
		this.popup.show();
		// insert the viewer, but MSIE and low FOV should default to fallback
		this.stage = (!/msie|trident|edge/i.test(navigator.userAgent) && (this.config.spherical.test(url) || this.config.cylindrical.test(url) || isWideEnough)) ? new this.context.Stage(this) : new this.context.Fallback(this);
		this.stage.init();
		// hide the busy indicator
		this.busy.hide();
		// resolve the opened promise
		if (this.config.opened) {
			this.config.opened(this.config.element);
		}
	};

	this.failure = function(url) {
		var config = this.config;
		// get rid of the image
		this.config.image = null;
		// give up on the popup
		if (this.popup) {
			// remove the popup
			config.container.removeChild(this.popup);
			// remove its reference
			this.popup = null;
			this.stage = null;
		}
		// trigger the located handler directly
		if (config.located) {
			config.located(this.element);
		}
		// hide the busy indicator
		this.busy.hide();
	};

	// EVENTS

	this.onElementClicked = function(evt) {
		// prevent the click
		evt.preventDefault();
		// show the busy indicator
		this.busy = new this.context.Busy(this.config.container);
		this.busy.show();
		// create the url for the image sizing webservice
	    var url = this.config.url || this.element.getAttribute('href') || this.image.getAttribute('src');
	    var size = (this.config.spherical.test(url)) ? 'height=1080&top=0.2&bottom=0.8' : 'height=1080';
		// load the image asset
		this.config.image = new Image();
		this.config.image.src = this.config.slicer.replace('{src}', url).replace('{size}', size);
		// load the viewer when done
		this.config.image.addEventListener('load', this.success.bind(this, url));
		this.config.image.addEventListener('error', this.failure.bind(this, url));
	};

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Photocylinder.Main;
}
