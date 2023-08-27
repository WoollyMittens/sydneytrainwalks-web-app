export class Busy {
	constructor(parent) {
		this.parent = parent;
		this.config = parent.config;
		this.config.extend({
			'appView': document.querySelector('#appView')
		});
		this.init();
	}

	init() {}

	show() {
		// remove the cover page
		// TODO: this should be done with data- attributes instead to avoid classname string replacement issues
		this.config.appView.className = this.config.appView.className.replace(/-ready/g, '-busy');
	}

	hide() {
		// remove the cover page
		this.config.appView.className = this.config.appView.className.replace(/-busy/g, '-ready');
	};
};
