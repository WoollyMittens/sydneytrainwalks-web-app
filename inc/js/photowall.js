// TODO: this can now be done with CSS `object-fit: cover;`

export class Photowall {
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
		// process all photos
		const photos = this.element.getElementsByTagName("img");
		for (let photo of photos) {
			// move the image to the tile's background
			photo.style.visibility = "hidden";
			photo.parentNode.style.backgroundImage = "url('" + photo.getAttribute("src") + "')";
		}
		// return the object
		return this;
	}
}
