export class Popup {
	constructor(config, onClosed) {
		this.config = config;
		this.onClosed = onClosed;
	}

// TODO: add next and previous buttons based on the sequence

	show() {
		var config = this.config;
		// if the popup doesn't exist
		if (!config.popup) {
			// create a container for the popup
			config.popup = document.createElement('figure');
			config.popup.className = 'photocylinder-popup';
			config.popup.setAttribute('data-fixed', (config.container === document.body));
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
			config.popup.removeAttribute('data-active');
			// and trigger the handler after a while
			setTimeout(this.onClosed.bind(this), 500);
		}
	}

	destroy() {
		// remove the popup
		this.config.container.removeChild(this.config.popup);
		// remove its reference
		this.config.popup = null;
	}

	addCloser() {
		var config = this.config;
		// build a close gadget
		var closer = document.createElement('a');
		closer.className = 'photocylinder-closer';
		closer.innerHTML = 'x';
		closer.href = '#close';
		// add the close event handler
		closer.addEventListener('click', this.onHide.bind(this), { passive: true });
		closer.addEventListener('touchstart', this.onHide.bind(this), { passive: true });
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
			locator.addEventListener('click', this.onLocate.bind(this), { passive: true });
			locator.addEventListener('touchstart', this.onLocate.bind(this), { passive: true });
			// add the location marker to the image
			config.popup.appendChild(locator);
		}
	}

	onShow() {
		var config = this.config;
		// show the popup
		config.popup.setAttribute('data-active', '');
		// trigger the opened event if available
		if (config.opened) {
			config.opened(config.url, config.sequence);
		}
	}

	onHide(evt) {
		var config = this.config;
		// close the popup
		this.hide();
		// trigger the closed event if available
		if (config.closed) {
			config.closed(config.url, config.sequence);
		}
	}

	onLocate(evt) {
		var config = this.config;
		// trigger the located event if available
		if (config.located) {
			config.located(config.url, config.sequence);
		}
	}
}
