export class Header {
	constructor(config, updateView) {
		this.config = config;
		this.updateView = updateView;
		this.headerElement = document.querySelector('.title a');
		this.themeButton = document.querySelector('.toggle-color-scheme');
		this.init();
	}

	resetView(evt) {
		if (evt) evt.preventDefault();
		// restore the view to default
		window.localStorage.removeItem('id');
		window.localStorage.removeItem('mode');
		document.body.setAttribute('data-screen', 'menu');
		// update the route
		this.updateView(null, 'menu');
	}

	cycleTheme(evt) {
		if (evt) evt.preventDefault();
		// cycle throught the dark scheme options
		var theme = document.body.getAttribute('data-color-scheme');
		switch(theme) {
			case 'dark': 
				document.body.setAttribute('data-color-scheme', 'light');
				window.localStorage.setItem('scheme', 'light');
				break;
			case 'light': 
				document.body.setAttribute('data-color-scheme', 'auto');
				window.localStorage.setItem('scheme', 'auto');
				break;
			default: 
				document.body.setAttribute('data-color-scheme', 'dark');
				window.localStorage.setItem('scheme', 'dark');
		}
	}

	init() {
		// add the reset handler
		this.headerElement.addEventListener('click', this.resetView.bind(this));
		// handle the scheme preference
		this.themeButton.addEventListener('click', this.cycleTheme.bind(this));
		// restore the scheme preference
		document.body.setAttribute('data-color-scheme', window.localStorage.getItem('scheme') || 'auto');
	}
}
