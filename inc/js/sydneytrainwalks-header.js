export class Header {
	constructor(config) {
		this.config = config;
		this.headerElement = document.querySelector('.title a');
		this.themeButton = document.querySelector('.toggle-color-scheme');
		this.init();
	}

	resetView(evt) {
		if (evt) evt.preventDefault();
		// restore the view to default
		document.body.className = document.body.className.replace(/screen-photos|screen-guide|screen-map/, 'screen-menu');
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
