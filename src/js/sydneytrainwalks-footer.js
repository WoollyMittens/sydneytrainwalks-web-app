// extend the class
SydneyTrainWalks.prototype.Footer = function(parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.config.extend({
		'origin': 'menu',
		'footer': document.querySelector('.toolbar'),
		'footerTemplate': document.getElementById('footer-template')
	});

	// METHODS

	this.init = function() {
		// build the footer with a blank id
		this.update(null);
		// add a global click handler to the footer
		this.config.footer.addEventListener('click', this.onFooterClicked.bind(this));
		// add the event handler for the browser back button
		document.addEventListener("backbutton", this.onBackButton.bind(this));
	};

	this.update = function() {
		// fill the menu with options
		this.config.footer.innerHTML = this.config.footerTemplate.innerHTML;
	};

	// EVENTS

	this.onBackButton = function(evt) {
		// if this is not an entry page
		console.log("onBackButton", document.body.className);
		if (!/menu|overview/.test(document.body.className)) {
			// cancel the back button
			evt.preventDefault();
			// return to the origin page
			window.localStorage.removeItem('id');
			window.localStorage.removeItem('mode');
			document.body.className = 'screen-' + this.config.origin;
		// if this is a cordova app
		} else if (navigator.app && navigator.app.exitApp) {
			// close the app
			navigator.app.exitApp();
		}
	}

	this.onFooterClicked = function(evt) {
		// get the target of the click
		var target = evt.target || evt.srcElement,
			id = target.getAttribute('id');
		// if a button was clicked
		if (id && id.match(/footer-to-/)) {
			// cancel any clicks
			evt.preventDefault();
			// if this is a menu page
			if (id.match(/-menu|-overview|-about|-achievements/)) {
				// reset the local storage when returning to the menu
				window.localStorage.removeItem('id');
				window.localStorage.removeItem('mode');
				// remember what menu screen was the origin
				this.config.origin = id.substr(10);
			}
			// apply the mode to the body
			document.body.className = 'screen-' + id.substr(10);
		}
	};

  if(parent) this.init();

};
