export class Busy {
	constructor(config) {
		this.config = config;
		this.appView = document.querySelector('#appView');
		this.init();
	}

	init() {}

	show() {
		// remove the cover page
		// TODO: this should be done with data- attributes instead to avoid classname string replacement issues
		this.appView.className = this.appView.className.replace(/-ready/g, '-busy');
	}

	hide() {
		// remove the cover page
		this.appView.className = this.appView.className.replace(/-busy/g, '-ready');
	};
}
