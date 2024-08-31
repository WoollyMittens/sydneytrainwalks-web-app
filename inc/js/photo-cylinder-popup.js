export class PhotoCylinderPopup {
	constructor(config, onOpened, onNavigated, onClosed) {
		this.config = config;
		this.onOpened = onOpened;
		this.onNavigated = onNavigated;
		this.onClosed = onClosed;
		this.closerButton = null;
		this.locatorButton = null;
		this.active = true;
	}

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
			// add navigation buttons
			this.addNext();
			this.addPrevious();
			this.update();
			// add the popup to the document
			config.container.appendChild(config.popup);
			// reveal the popup when ready
			setTimeout(() => {
				// reveal the popup
				this.config.popup.setAttribute('data-active', '');
				// and trigger the handler
				this.onOpened();
			}, 0);
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

	update() {
		const index = this.config.sequence.indexOf(this.config.url);
		// disable the previous button on the first slide
		if (index === 0) { this.previousButton.setAttribute('disabled', '') } 
		else { this.previousButton.removeAttribute('disabled') }
		// disable the next button on the last slide
		if (index >= this.config.sequence.length - 1) { this.nextButton.setAttribute('disabled', '') }
		else { this.nextButton.removeAttribute('disabled') }
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
		this.closerButton = document.createElement('a');
		this.closerButton.className = 'photocylinder-closer';
		this.closerButton.innerHTML = 'x';
		this.closerButton.href = '#close';
		// add the close event handler
		this.closerButton.addEventListener('click', this.onHide.bind(this), { capture: true });
		// add the close gadget to the image
		config.popup.appendChild(this.closerButton);
	}

	addNext() {
		// only add if there's a sequence of images
		if (this.config.sequence) {
			// build the next button
			this.nextButton = document.createElement('a');
			this.nextButton.setAttribute('class', 'photocylinder-next');
			this.nextButton.setAttribute('innerHTML', 'Next photo');
			this.nextButton.setAttribute('href', '#next');
			this.nextButton.addEventListener('click', this.onNext.bind(this));
			// add the button to the popup
			this.config.popup.appendChild(this.nextButton);
		}
	}

	addPrevious() {
		// only add if there's a sequence of images
		if (this.config.sequence) {
			// build the next button
			this.previousButton = document.createElement('a');
			this.previousButton.setAttribute('class', 'photocylinder-previous');
			this.previousButton.setAttribute('innerHTML', 'Previous photo');
			this.previousButton.setAttribute('href', '#prev');
			this.previousButton.addEventListener('click', this.onPrevious.bind(this));
			// add the button to the popup
			this.config.popup.appendChild(this.previousButton);
		}
	}

	onPrevious(evt) {
		// cancel the click
		evt.preventDefault();
		// find the next url
		const index = this.config.sequence.indexOf(this.config.url);
		const url = this.config.sequence[index - 1];
		// navigate to it
		if (url && this.active) this.onNavigated(url);
	}

	onNext(evt) {
		// cancel the click
		evt.preventDefault();
		// find the next url
		const index = this.config.sequence.indexOf(this.config.url);
		const url = this.config.sequence[index + 1];
		// navigate to it
		if (url && this.active) this.onNavigated(url);
	}

	onHide(evt) {
		// cancel the click
		evt.preventDefault();
		// hide the popup
		this.hide();
	}
}
