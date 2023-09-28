export class Legend {
	constructor(config, indicate) {
		this.config = config;
		this.indicate = indicate;
		this.elements = [];
		this.start();
	}

	start() {
		// if a legend exists
		if (this.config.legend) {
			const guideData = this.config.guideData;
			// add the intro
			this.addIntro(guideData);
			// add the markers
			for (let markerData of guideData.markers) {
				this.addDefinition(markerData);
			}
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

	highlight(markerData) {
		// if the marker is present in the legend
		if (markerData.referrer) {
			// reset the all markers
			for (let element of this.elements) {
				element.removeAttribute('data-active');
			}
			// highlight the active markers
			markerData.referrer.setAttribute('data-active', '');
			markerData.referrer.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
		}
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
			var definitionTitle = document.createElement("dt");
			definitionTitle.className += markerData.photo ? " localmap-legend-photo" : " localmap-legend-icon";
			definitionTitle.innerHTML = '<img alt="' + markerData.type + '" src="' + image + '"/>';
			definitionTitle.style.backgroundImage = 'url("' + image + '")';
			fragment.appendChild(definitionTitle);
			// add the description
			var definitionDescription = document.createElement("dd");
			if (markerData.optional) { definitionDescription.className += " localmap-legend-optional"; }
			else if (markerData.type === "detour") { definitionDescription.className += " localmap-legend-detour"; }
			else if (markerData.type === "warning") { definitionDescription.className += " localmap-legend-warning"; }
			else { definitionDescription.className += " localmap-legend-description"; }
			definitionDescription.innerHTML = "<p>" + text + "</p>";
			fragment.appendChild(definitionDescription);
			// add the event handlers
			markerData.referrer = definitionTitle;
			// TODO: this one opens the photo viewer
			definitionTitle.addEventListener("click", this.indicate.bind(this, markerData));
			// TODO: this one zooms in on the marker
			definitionDescription.addEventListener("click", this.indicate.bind(this, markerData));
			// add the container to the legend
			this.config.legend.appendChild(fragment);
			// store the element for reference
			this.elements.push(definitionTitle);
		}
	}
	
	addOutro(guideData) {
		const outroTemplate = this.config.outroTemplate;
		// only generate an outro if available
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
