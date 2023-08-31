// TODO: this can now be done with CSS `object-fit: cover;`

export class Photowall {
	constructor(config) {
		this.config = config;
		this.context = context;
		this.element = config.element;
		this.init();
	}

	init() {
		// find all the links
		const photos = this.element.getElementsByTagName("img");
		// process all photos
		for (let photo of photos) {
			// TODO: this can probably be done using css `object-fit:cover;`
			// move the image to the tile's background
			photo.style.visibility = "hidden";
			photo.parentNode.style.backgroundImage = "url('" + photo.getAttribute("src") + "')";
		}
		// return the object
		return this;
	}
}
