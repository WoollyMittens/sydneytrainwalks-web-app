import { Popup } from "./photocylinder-popup.js";
import { Stage } from "./photocylinder-stage.js";
import { Busy } from "./photocylinder-busy.js";
import { Fallback } from "./photocylinder-fallback.js";

export class PhotoCylinder {
	constructor(config) {
		// merge the config with the default options
		this.config = {
			'container': document.body,
			'fov' : 180,
			'standalone': false,
			'idle': 0.1
		}
		for (var key in config) {
			this.config[key] = config[key];
		}
		// add the busy indicator
		this.busy = new Busy(this.config.container);
		// load the default asset
		this.reload(config.url);
	}

	reload(url) {
		// show the busy indicator
		this.busy.show();
		// remove any existing components
		this.removeStage();
		// load the image asset
		this.config.image = new Image();
		this.config.image.alt = '';
		this.config.image.src = url;
		// load the viewer when done
		this.config.image.addEventListener('load', this.onSuccess.bind(this));
		this.config.image.addEventListener('error', this.onFailure.bind(this));
	}

	destroy() {
		this.onClosed();
	}

	addStage() {
		// check if the aspect ratio of the image can be determined
		var image = this.config.image;
		var isWideEnough = (this.config.fov >= 180 && image.naturalWidth / image.naturalHeight > 3);
		// insert the viewer, but low FOV should default to the fallback
		this.stage = (isWideEnough) ? new Stage(this.config) : new Fallback(this.config);
		this.stage.init();
	}

	removeStage() {
		// remove the stage
		this?.stage?.destroy();
		// remove the reference
		this.stage = null;
	}

	addPopup() {
		// show the popup, or use the container directly
		if (this.config.standalone) {
			config.popup = config.container;
			config.popup.innerHTML = '';
		} else {
			this.popup = new Popup(this.config, this.onClosed.bind(this));
			this.popup.show();
		}
	}

	removePopup() {
		// remove the popup
		this?.popup?.destroy();
		// remove its reference
		this.popup = null;
	}

	onSuccess() {
		// hide the busy indicator
		this.busy.hide();
		// add the popup if needed
		if (!this.config.popup) this.addPopup();
		// add the viewer
		this.addStage();
		// trigger the success handler
		if (this.config.success) {
			this.config.success(this.config.popup);
		}
	}

	onFailure() {
		// get rid of the image
		this.config.image = null;
		// give up on the popup
		this.removePopup();
		// give up on the stage
		this.removeStage();
		// trigger the failure handler
		if (this.config.failure) {
			this.config.failure(this.config.popup);
		}
		// hide the busy indicator
		this.busy.hide();
	}

	onClosed() {
		// shut down sub components
		this.removeStage();
		this.removePopup();
	}
}
