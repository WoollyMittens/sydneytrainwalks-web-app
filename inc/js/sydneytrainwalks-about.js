export class About {
	constructor(parent) {
		this.parent = parent;
		this.config = parent.config;
		this.config.extend({
			'about': document.querySelector('.about')
		});
		this.init();
	}

	init() {}
};
