export class Legend {
	constructor(config, indicate) {
		this.config = config;
		this.indicate = indicate;
		this.updated
		this.start();
	}

	start() {
		// if a legend exists
		if (this.config.legend) {
			const guideData = this.config.guideData;
			// clear the legend
			this.config.legend.innerHTML = '';
			// add the intro
			this.addIntro(guideData);
			// add the markers
			this.elements = guideData.markers.map(this.addDefinition.bind(this));
			// add the outro
			this.addOutro(guideData);
		}
	}

	stop() {
		// remove the element
		if (this.config.legend) this.config.legend.innerHTML = "";
	}

	update() {
		// currently does not need updates
	}
	
	addIntro(guideData) {
		const introTemplate = this.config.introTemplate;
		// only generate an intro if available
		if (introTemplate) {
			// fill the intro
			const fragment = document.createDocumentFragment();
			const definitionTitle = document.createElement('dt');
			definitionTitle.className = "localmap-legend-empty";
			definitionTitle.innerHTML = "Introduction";
			fragment.appendChild(definitionTitle);
			const definitionDescription = document.createElement('dd');
			definitionDescription.className = "localmap-legend-full";
			definitionDescription.innerHTML = introTemplate
				.replace("{updated}", guideData.updated)
				.replace("{date}", new Date(guideData.updated).toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
				.replace("{description}", '<p>' + guideData.description.join('</p><p>') + '</p>')
				.replace("{duration}", guideData.duration + 'hr')
				.replace("{distance}", guideData.distance + 'km');
			fragment.appendChild(definitionDescription);
			// add the intro to the legend
			this.config.legend.appendChild(fragment);
		}
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
		const outroTemplate = this.config.outroTemplate;
		// only generate an outro if available
		console.log('adding outro', outroTemplate);
		if (outroTemplate) {
			// fill the outro
			const fragment = document.createDocumentFragment();
			const definitionTitle = document.createElement('dt');
			definitionTitle.className = "localmap-legend-empty";
			definitionTitle.innerHTML = "Footnotes";
			fragment.appendChild(definitionTitle);
			const definitionDescription = document.createElement('dd');
			definitionDescription.className = "localmap-legend-full";
			definitionDescription.innerHTML = outroTemplate;
			fragment.appendChild(definitionDescription);
			// add the intro to the legend
			this.config.legend.appendChild(fragment);
		}
	}
}
