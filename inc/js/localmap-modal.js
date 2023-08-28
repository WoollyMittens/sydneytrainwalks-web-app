export class Modal {
	constructor(parent) {
		this.parent = parent;
		this.config = parent.config;
		this.element = null;
		this.start();
	}

	start() {
		// create the modal
		this.element = document.createElement("section");
		this.element.setAttribute("class", "localmap-modal localmap-modal-hidden");
		// add the photo
		this.photo = document.createElement("figure");
		this.photo.setAttribute("class", "localmap-modal-photo");
		this.element.appendChild(this.photo);
		// add the content area
		this.description = document.createElement("article");
		this.description.setAttribute("class", "localmap-modal-content");
		this.element.appendChild(this.description);
		// add a close button
		this.closer = document.createElement("button");
		this.closer.setAttribute("class", "localmap-modal-closer");
		this.closer.innerHTML = "Close";
		this.closer.addEventListener("click", this.onDismiss.bind(this));
		this.element.appendChild(this.closer);
		// insert the modal
		this.config.container.appendChild(this.element);
	}

	stop() {
		// remove the element
		this.config.container.removeChild(this.element);
	}

	update() {}

	show(markerData) {
		var key = this.config.alias || this.config.key;
		// display the photo if available
		if (markerData.photo) {
			this.photo.style.backgroundImage =
				"url(" +
				this.config.photosUrl.replace("{key}", key) +
				markerData.photo +
				"), url(" +
				this.config.thumbsUrl.replace("{key}", key) +
				markerData.photo +
				")";
			this.photo.className = "localmap-modal-photo";
		} else {
			this.photo.style.backgroundImage = "url(" + this.config.markersUrl.replace("{type}", markerData.type) + ")";
			this.photo.className = "localmap-modal-icon";
		}
		// display the content if available
		if (markerData.description) {
			this.description.innerHTML = "<p>" + markerData.description + "</p>";
		} else {
			return false;
		}
		// show the modal
		this.element.className = this.element.className.replace(/-hidden/g, "-visible");
	}

	// EVENTS

	onDismiss(evt) {
		evt.preventDefault();
		// hide the modal
		this.element.className = this.element.className.replace(/-visible/g, "-hidden");
	}
}
