export class Footer {
	constructor(config, updateView) {
		this.config = config;
		this.updateView = updateView;
		this.originKey = 'menu';
		this.footerElement = document.querySelector('.toolbar');
		this.footerTemplate = document.getElementById('footer-template');
		this.init();
	}

	update() {
		// fill the menu with options
		this.footerElement.innerHTML = this.footerTemplate.innerHTML;
	};

	onBackButton(evt) {
		// if this is not an entry page
		if (!/menu|overview/.test(document.body.getAttribute('data-screen'))) {
			// cancel the back button
			evt.preventDefault();
			// return to the origin page
			window.localStorage.removeItem('id');
			window.localStorage.removeItem('mode');
			document.body.setAttribute('data-screen', this.originKey);
			// TODO: update the route
		// if this is a cordova app
		} else if (navigator.app && navigator.app.exitApp) {
			// close the app
			navigator.app.exitApp();
		}
	}

	onFooterClicked(evt) {
		// get the target of the click
		var target = evt.target || evt.srcElement, id = target.getAttribute('id');
		// if a button was clicked
		if (id && id.match(/footer-to-/)) {
			// cancel any clicks
			evt.preventDefault();
			// if this is a menu page
			if (id.match(/-menu|-overview|-about|-trophies/)) {
				// reset the local storage when returning to the menu
				window.localStorage.removeItem('id');
				window.localStorage.removeItem('mode');
				// remember what menu screen was the origin
				this.originKey = id.substr(10);
			}
			// apply the mode to the body
			document.body.setAttribute('data-screen', id.substr(10));
			// update the route
			this.updateView(null, id.substr(10));
		}
	};

	init() {
		// build the footer with a blank id
		this.update();
		// add a global click handler to the footer
		this.footerElement.addEventListener('click', this.onFooterClicked.bind(this));
		// add the event handler for the browser back button
		document.addEventListener("backbutton", this.onBackButton.bind(this));
	};
}
