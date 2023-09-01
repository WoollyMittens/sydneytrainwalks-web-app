import { Popup } from "./photocylinder-popup.js";
import { Stage } from "./photocylinder-stage.js";
import { Busy } from "./photocylinder-busy.js";
import { Fallback } from "./photocylinder-fallback.js";

export class Photocylinder {
	constructor(config) {
		this.element = config.element;
		this.config = {
			'container': document.body,
			'spherical' : /r(\d+).jpg/i,
			'standalone': false,
			'idle': 0.1
		}
		for (var key in config) {
			this.config[key] = config[key];
		}
		if (this.config.element) {
			this.config.element.addEventListener('click', this.onElementClicked.bind(this));
		}
		if (this.config.url) {
			this.onElementClicked();
		}
	}

	success(url, fov) {
		var config = this.config;
		// hide the busy indicator
		this.busy.hide();
		// check if the aspect ratio of the image can be determined
		var image = config.image;
		var isWideEnough = (image.naturalWidth && image.naturalHeight && image.naturalWidth / image.naturalHeight > 3);
		// show the popup, or use the container directly
		if (config.standalone) {
			config.popup = config.container;
			config.popup.innerHTML = '';
		} else {
			this.popup = new Popup(this);
			this.popup.show();
		}
		// insert the viewer, but MSIE and low FOV should default to fallback
		this.stage = (!/msie|trident|edge/i.test(navigator.userAgent) && (this.config.spherical.test(url) || isWideEnough))
		  ? new Stage(this)
		  : new Fallback(this);
		this.stage.init();
		// trigger the success handler
		if (config.success) {
			config.success(config.popup);
		}
	}

	failure(url, fov) {
		var config = this.config;
		// get rid of the image
		this.config.image = null;
		// give up on the popup
		if (this.popup) {
			// remove the popup
			config.popup.parentNode.removeChild(config.popup);
			// remove its reference
			this.popup = null;
		}
		// give up on the stage
		if (this.stage) {
			// remove the stage
			this.stage.destroy();
			config.stage.parentNode.removeChild(config.stage);
			// remove the reference
			this.stage = null;
		}
		// trigger the failure handler
		if (config.failure) {
			config.failure(config.popup);
		}
		// hide the busy indicator
		this.busy.hide();
	}

	destroy() {
		// shut down sub components
		this.stage.destroy();
	}

	onElementClicked(evt) {
		// prevent the click
		if (evt) evt.preventDefault();
		// show the busy indicator
		this.busy = new Busy(this.config.container);
		this.busy.show();
		// create the url for the image sizing webservice
		var url = this.config.url || this.element.getAttribute('href') || this.element.getAttribute('data-url');
		// load the image asset
		this.config.image = new Image();
		this.config.image.alt = '';
		this.config.image.setAttribute('data-cropped', (this.config.spherical.test(url)));
		this.config.image.src = url;
		// load the viewer when done
		this.config.image.addEventListener('load', this.success.bind(this, url));
		this.config.image.addEventListener('error', this.failure.bind(this, url));
	}
}
