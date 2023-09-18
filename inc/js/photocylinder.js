import { Popup } from "./photocylinder-popup.js";
import { Stage } from "./photocylinder-stage.js";
import { Busy } from "./photocylinder-busy.js";
import { Fallback } from "./photocylinder-fallback.js";

export class PhotoCylinder {
	constructor(config) {
		this.config = {
			'container': document.body,
			'fov' : 180,
			'standalone': false,
			'idle': 0.1
		}
		for (var key in config) {
			this.config[key] = config[key];
		}
		this.busy = new Busy(this.config.container);
		this.busy.show();
		// create the url for the image sizing webservice
		const url = this.config.url;
		const fov = this.config.fov;
		// load the image asset
		this.config.image = new Image();
		this.config.image.alt = '';
		this.config.image.src = url;
		// load the viewer when done
		this.config.image.addEventListener('load', this.success.bind(this, url, fov));
		this.config.image.addEventListener('error', this.failure.bind(this, url, fov));
	}

	success(url, fov) {
		var config = this.config;
		// hide the busy indicator
		this.busy.hide();
		// check if the aspect ratio of the image can be determined
		var image = config.image;
		var isWideEnough = (fov >=180 && image.naturalWidth / image.naturalHeight > 3);
		// show the popup, or use the container directly
		if (config.standalone) {
			config.popup = config.container;
			config.popup.innerHTML = '';
		} else {
			this.popup = new Popup(this.config, this.destroy.bind(this));
			this.popup.show();
		}
		// insert the viewer, but low FOV should default to the fallback
		this.stage = (isWideEnough) ? new Stage(this.config) : new Fallback(this.config);
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
}
