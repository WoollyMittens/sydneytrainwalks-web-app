export class Legend {
	constructor(config, indicate) {
		if (!config.legend) return null;
		this.config = config;
		this.indicate = indicate;
		this.redrawTimeout = null;
		this.definitions = [];
		this.pages = [];
		this.definitionList = document.createElement('dl');
		this.pageNav = document.createElement('nav');
		this.element = this.config.legend;
		this.element.appendChild(this.definitionList);
		this.element.appendChild(this.pageNav);
		this.start();
	}

	start() {
		// if a legend exists
		if (this.config.legend) {
			const guideData = this.config.guideData;
			// add the intro to the definitions
			this.addIntro(guideData);
			// add the markers to the definitions
			for (let markerData of guideData.markers) {
				this.addDefinition(markerData);
			}
			// add the outro to the definitions
			this.addOutro(guideData);
			// add the pages to the navigation
			this.addPageCount();
		}
	}

	update() {}

	highlight(markerData) {
		// if the marker is present in the legend
		if (markerData.referrer) {
			// reset the all markers
			for (let definition of this.definitions) {
				definition.removeAttribute('data-active');
			}
			// highlight the active markers
			markerData.referrer.setAttribute('data-active', '');
			markerData.referrer.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
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
			this.definitionList.appendChild(fragment);
			// store the definition for reference
			this.definitions.push({
				'title': definitionTitle,
				'description': definitionDescription,
				'data': null
			});
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
			// create a container for the markers
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
			// TODO: clicking on the photo opens the photo viewer
			definitionTitle.addEventListener("click", this.indicate.bind(this, markerData));
			// clicking on the description zooms in on the marker
			definitionDescription.addEventListener("click", this.indicate.bind(this, markerData));
			// add the container to the legend
			this.definitionList.appendChild(fragment);
			// store the marker for reference
			this.definitions.push({
				'title': definitionTitle,
				'description': definitionDescription,
				'data': markerData
			});
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
			this.definitionList.appendChild(fragment);
			// store the definition for reference
			this.definitions.push({
				'title': definitionTitle,
				'description': definitionDescription,
				'data': null
			});
		}
	}


	redrawPageCount(activeDefinition) {
		// hide the excess of pages
		const width = this.definitionList.offsetWidth;
		for (let index in this.definitions) {
			let page = this.pages[index];
			let definition = this.definitions[index];
			let rect = definition.title.getBoundingClientRect();
			let distance = Math.min(Math.abs(Math.round(rect.left / width)), 9);
			page.setAttribute('data-distance', distance);
		}
		// highlight the active page on the map
		this.indicate(activeDefinition.data);
	}

	updatePageCount() {
		// mark whichever page is visible in the viewport as active
		const width = this.definitionList.offsetWidth;
		for (let index in this.definitions) {
			let page = this.pages[index];
			let definition = this.definitions[index];
			let rect = definition.title.getBoundingClientRect();
			// if the page is in the viewport
			if (rect.left >= 0 && rect.left < width) {
				// immediately activate the page indicator
				page.setAttribute('data-active', '');
				// wait for a pause to update the indicator
				clearTimeout(this.redrawTimeout);
				this.redrawTimeout = setTimeout(this.redrawPageCount.bind(this, definition), 100);
			}
			// otherwise reset it
			else {
				page.removeAttribute('data-active'); 
			}
		}
	}

	addPageCount() {
		// for every definition entry
		for (let index in this.definitions) {
			let definition = this.definitions[index];
			// create a page counter
			let button = document.createElement('button');
			button.innerHTML = index;
			// add the click handler for the counter
			button.addEventListener('click', evt => {
				evt.preventDefault();
				definition.title.scrollIntoView({ behavior: "smooth", block: "start", inline: "start" });
			});
			// add the counter and store for reference
			this.pageNav.appendChild(button);
			this.pages.push(button);
		}
		// handle the scroller
		this.definitionList.addEventListener('scroll', this.updatePageCount.bind(this), { passive: true });
		// activate the first page
		this.updatePageCount();
	}
}
