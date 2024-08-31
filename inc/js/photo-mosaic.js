export class PhotoMosaic {
	constructor(config) {
		this.config = config;
		this.element = config.element;
		this.clicked = config.clicked || function() {};
		this.init();
	}

	init() {
		// process all links
		const links = [...this.element.getElementsByTagName("a")];
		const urls =  links.map(link => link.getAttribute('href'));
		for (let link of links) {
			// add the click handler to the parent link
			let url = link.getAttribute('href');
			link.addEventListener('click', this.clicked.bind(this, url, urls));
		}
		// return the object
		return this;
	}
}
