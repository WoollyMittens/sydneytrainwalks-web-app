export class Credits {
	constructor(parent) {
		this.parent = parent;
		this.config = parent.config;
		this.element = null;
		this.start();
	}

	start() {
		this.element = document.createElement("figcaption");
		this.element.setAttribute("class", "localmap-credits");
		this.element.innerHTML = this.config.creditsTemplate;
		this.config.container.appendChild(this.element);
	}

	stop() {
		// remove the element
		this.config.container.removeChild(this.element);
	}

	update() {}
}
