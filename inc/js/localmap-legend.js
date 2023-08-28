export class Legend {
	constructor(parent, onLegendClicked) {
		this.parent = parent;
		this.config = parent.config;
		this.elements = [];
		this.start();
	}

	start() {}

	stop() {
		// remove the element
		if (this.config.legend) this.config.legend.innerHTML = "";
	}

	update() {
		var key = this.config.key;
		var guideData = this.config.guideData[key];
		// write the legend if needed and available
		if (this.config.legend && this.elements.length === 0) {
			this.elements = guideData.markers.map(this.addDefinition.bind(this));
		}
	}

	addDefinition(markerData) {
		var definitionData = {};
		// if the marker has a description
		if (markerData.description) {
			// format the path to the external assets
			var key = this.config.alias || this.config.key;
			var image = markerData.photo
				? this.config.thumbsUrl.replace("{key}", key) + markerData.photo
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
			definitionData.description.className +=
				markerData.optional || markerData.detour || markerData.warning ? " localmap-legend-alternate" : "";
			definitionData.description.innerHTML = "<p>" + text + "</p>";
			fragment.appendChild(definitionData.description);
			// add the event handlers
			markerData.referrer = definitionData.title;
			definitionData.title.addEventListener("click", this.onLegendClicked.bind(this, markerData));
			definitionData.description.addEventListener("click", this.onLegendClicked.bind(this, markerData));
			// add the container to the legend
			this.config.legend.appendChild(fragment);
		}
		// return the objects
		return definitionData;
	}
}
