export class Legend {
	constructor(config, indicate) {
		this.config = config;
		this.indicate = indicate;
		this.elements = [];
		this.start();
	}

	start() {}

	stop() {
		// remove the element
		if (this.config.legend) this.config.legend.innerHTML = "";
	}

	update() {
		var guideData = this.config.guideData;
		// TODO: add intro slide
		this.addIntro(guideData);
		// write the legend if needed and available
		if (this.config.legend && this.elements.length === 0) {
			this.elements = guideData.markers.map(this.addDefinition.bind(this));
		}
		// TODO: add outro slide
		this.addOutro(guideData);
	}
	
	addIntro(guideData) {
		var fragment = document.createDocumentFragment();
		// TODO: fill the intro
		this.config.legend.appendChild(fragment);
	}

	addDefinition(markerData) {
		var definitionData = {};
		// if the marker has a description
		if (markerData.description) {
			// format the path to the external assets
			var image = markerData.photo
				? this.config.thumbsUrl + markerData.photo
				: this.config.markersUrl.replace("{type}", markerData.type);
			var text = markerData.description || markerData.type;
			// create a container for the elements
			var fragment = document.createDocumentFragment();
			// add the title
			definitionData.title = document.createElement("dt");
			definitionData.title.className += markerData.photo ? " localmap-legend-photo" : " localmap-legend-icon";
			definitionData.title.innerHTML = '<img alt="' + markerData.type + '" src="' + image + '"/>';
			definitionData.title.style.backgroundImage = 'url("' + image + '")';
			fragment.appendChild(definitionData.title);
			// add the description
			definitionData.description = document.createElement("dd");
			definitionData.description.className += markerData.optional || markerData.detour || markerData.warning ? " localmap-legend-alternate" : "";
			definitionData.description.innerHTML = "<p>" + text + "</p>";
			fragment.appendChild(definitionData.description);
			// add the event handlers
			markerData.referrer = definitionData.title;
			// TODO: this one opens the photo viewer
			definitionData.title.addEventListener("click", this.indicate.bind(this, markerData));
			// TODO: this one zooms in on the marker
			definitionData.description.addEventListener("click", this.indicate.bind(this, markerData));
			// add the container to the legend
			this.config.legend.appendChild(fragment);
		}
		// return the objects
		return definitionData;
	}
	
	addOutro(guideData) {
		var fragment = document.createDocumentFragment();
		// TODO: fill the outro
		this.config.legend.appendChild(fragment);
	}
}
