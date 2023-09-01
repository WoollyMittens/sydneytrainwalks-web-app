export class Popup {
	constructor(parent) {
		this.parent = parent;
		this.config = parent.config;
	}

	show() {
		var config = this.config;
		// if the popup doesn't exist
		if (!config.popup) {
			// create a container for the popup
			config.popup = document.createElement('figure');
			config.popup.className = (config.container === document.body)
				? 'photocylinder-popup photocylinder-popup-fixed photocylinder-popup-passive'
				: 'photocylinder-popup photocylinder-popup-passive';
			// add a close gadget
			this.addCloser();
			// add a locator gadget
			this.addLocator();
			// add the popup to the document
			config.container.appendChild(config.popup);
			// reveal the popup when ready
			setTimeout(this.onShow.bind(this), 0);
		}
	}

	hide() {
		var config = this.config;
		// if there is a popup
		if (config.popup) {
			// unreveal the popup
			config.popup.className = config.popup.className.replace(/-active/gi, '-passive');
			// and after a while
			var _this = this;
			setTimeout(function() {
				// remove it
				config.container.removeChild(config.popup);
				// remove its reference
				config.popup = null;
				// ask the parent to self destruct
				_this.parent.destroy();
			}, 500);
		}
	}

	addCloser() {
		var config = this.config;
		// build a close gadget
		var closer = document.createElement('a');
		closer.className = 'photocylinder-closer';
		closer.innerHTML = 'x';
		closer.href = '#close';
		// add the close event handler
		closer.addEventListener('click', this.onHide.bind(this));
		closer.addEventListener('touchstart', this.onHide.bind(this));
		// add the close gadget to the image
		config.popup.appendChild(closer);
	}

	addLocator(url) {
		var config = this.config;
		// only add if a handler was specified
		if (config.located) {
			// build the geo marker icon
			var locator = document.createElement('a');
			locator.className = 'photocylinder-locator';
			locator.innerHTML = 'Show on a map';
			locator.href = '#map';
			// add the event handler
			locator.addEventListener('click', this.onLocate.bind(this));
			locator.addEventListener('touchstart', this.onLocate.bind(this));
			// add the location marker to the image
			config.popup.appendChild(locator);
		}
	}

	onShow() {
		var config = this.config;
		// show the popup
		config.popup.className = config.popup.className.replace(/-passive/gi, '-active');
		// trigger the closed event if available
		if (config.opened) {
			config.opened(config.element);
		}
	}

	onHide(evt) {
		var config = this.config;
		// cancel the click
		evt.preventDefault();
		// close the popup
		this.hide();
		// trigger the closed event if available
		if (config.closed) {
			config.closed(config.element);
		}
	}

	onLocate(evt) {
		var config = this.config;
		// cancel the click
		evt.preventDefault();
		// trigger the located event if available
		if (config.located) {
			config.located(config.element);
		}
	}
}
