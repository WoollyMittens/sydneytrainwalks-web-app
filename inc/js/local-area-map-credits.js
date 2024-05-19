export class LocalAreaMapCredits {
	constructor(config) {
		this.config = config;
		this.element = null;
		this.start();
	}

	start() {
		this.element = document.createElement("figcaption");
		this.element.setAttribute("class", "local-area-map-credits");
		this.element.innerHTML = this.config.creditsTemplate;
		this.config.container.appendChild(this.element);
	}

	update() {}
}
