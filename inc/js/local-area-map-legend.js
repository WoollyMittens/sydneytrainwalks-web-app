export class LocalAreaMapLegend {
	constructor(config, indicate, unindicate) {
		if (!config.legend) return null;
		this.config = config;
		this.indicate = indicate;
		this.unindicate = unindicate;
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
			// make the keywords in the description clickable
			let description = guideData.description;
			for (let keyword in guideData.keywords) { 
				description = description.replace(new RegExp(keyword, "gi"), `<a href="${guideData.keywords[keyword]}">${keyword}</a>`);
			}
			// fill the intro
			const fragment = document.createDocumentFragment();
			const definitionTitle = document.createElement('dt');
			definitionTitle.className = "local-area-map-legend-empty";
			definitionTitle.innerHTML = "Introduction";
			fragment.appendChild(definitionTitle);
			const definitionDescription = document.createElement('dd');
			definitionDescription.className = "local-area-map-legend-full";
			definitionDescription.innerHTML = introTemplate
				.replace("{updated}", guideData.updated)
				.replace("{date}", new Date(guideData.updated).toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
				.replace("{description}", '<p>' + description + '</p>')
				.replace("{duration}", Math.round(guideData.distance.slice(-1) / 4.5) + 'hr')
				.replace("{distance}", guideData.distance.slice(-1) + 'km');
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
			var photo = (markerData.photo) ? this.config.thumbsUrl + markerData.photo : null;
			var icon = (markerData.type !== 'waypoint') ? this.config.markersUrl.replace("{type}", markerData.type) : null;
			// format the description
			var text = markerData.description;
			// update the marker if this is an achieved trophy
			if (markerData.type === "hotspot" && this.config.checkHotspot(markerData)) { text = markerData.instruction; }
			// create a container for the markers
			var fragment = document.createDocumentFragment();
			// add the title
			var definitionTitle = document.createElement("dt");
			definitionTitle.className = 'local-area-map-legend-image';
			definitionTitle.innerHTML = "";
			if (photo) { definitionTitle.innerHTML += `<img class="local-area-map-legend-photo" alt="" src="${photo}"/>`; definitionTitle.style.backgroundImage = `url("${photo}")`; }
			if (icon) { definitionTitle.innerHTML += `<img class="local-area-map-legend-icon" alt="${markerData.type}" src="${icon}"/>`; }
			if (markerData.optional) { definitionTitle.className += " local-area-map-legend-optional"; }
			if (markerData.detour) { definitionTitle.className += " local-area-map-legend-detour"; }
			if (markerData.warning) { definitionTitle.className += " local-area-map-legend-warning"; }
			if (markerData.type) { definitionTitle.className += ` local-area-map-legend-${markerData.type}`; }
			fragment.appendChild(definitionTitle);
			// add the description
			var definitionDescription = document.createElement("dd");
			definitionDescription.className = "local-area-map-legend-description";
			definitionDescription.innerHTML = `<p>${text}</p>`;
			if (markerData.optional) { definitionDescription.className += " local-area-map-legend-optional"; }
			if (markerData.detour) { definitionDescription.className += " local-area-map-legend-detour"; }
			if (markerData.warning) { definitionDescription.className += " local-area-map-legend-warning"; }
			if (markerData.type) { definitionDescription.className += ` local-area-map-legend-${markerData.type}`; }
			fragment.appendChild(definitionDescription);
			// add the event handlers
			markerData.referrer = definitionTitle;
			// clicking on the photo opens the photo viewer
			definitionTitle.addEventListener("click", this.onViewPhoto.bind(this, markerData));
			// clicking on the description zooms in on the marker
			definitionDescription.addEventListener("click", this.indicate.bind(this, markerData, false));
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
			definitionTitle.className = "local-area-map-legend-empty";
			definitionTitle.innerHTML = "Footnotes";
			fragment.appendChild(definitionTitle);
			const definitionDescription = document.createElement('dd');
			definitionDescription.className = "local-area-map-legend-full";
			definitionDescription.innerHTML = outroTemplate
				.replace("{gpx}", this.config.routeUrl);
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
		if (activeDefinition.data) { this.indicate(activeDefinition.data) }
		else { this.unindicate() }
	}

	updatePageCount() {
		// mark whichever page is visible in the viewport as active
		const width = this.definitionList.offsetWidth;
		for (let index in this.definitions) {
			let page = this.pages[index];
			let definition = this.definitions[index];
			let rect = definition.title.getBoundingClientRect();
			let middle = rect.left + rect.width / 2 + 10;
			// if the page is in the viewport
			if (middle >= 0 && middle < width) {
				// immediately activate the page indicator
				page.setAttribute('data-active', '');
				// wait for a pause to update the indicator
				clearTimeout(this.redrawTimeout);
				this.redrawTimeout = setTimeout(this.redrawPageCount.bind(this, definition), 500);
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
		setTimeout(this.updatePageCount.bind(this), 500);
	}

	onViewPhoto(markerData, evt) {
		// cancel the click
		evt.preventDefault();
		// use the photo viewer if configured
		if (this.config.showPhoto) {
			// write the url
			const url = this.config.photosUrl + markerData.photo;
			// write the sequence
			const urls = [];
			for (let marker of this.config.guideData.markers) {
				if (marker.photo) urls.push(this.config.photosUrl + marker.photo);
			}
			// open the viewer
			this.config.showPhoto(url, urls, evt);
		}
		// otherwise use the normal indicator
		else {
			this.indicate(markerData, false, evt);
		}
	}
}
