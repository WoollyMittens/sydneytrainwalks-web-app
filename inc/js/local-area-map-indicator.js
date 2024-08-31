export class LocalAreaMapIndicator {
	constructor(config, container, onMarkerClicked, onMapFocus) {
		this.config = config;
		this.container = container;
		this.onMarkerClicked = onMarkerClicked;
		this.onMapFocus = onMapFocus;
		this.element = new Image();
		this.zoom = null;
		this.lon = null;
		this.lat = null;
		this.start();
	}

	start() {
		// create the indicator
		this.element.setAttribute("src", this.config.markersUrl.replace("{type}", "focus"));
		this.element.setAttribute("alt", "");
		this.element.setAttribute("class", "local-area-map-indicator");
		// get marker data from API call
		this.element.addEventListener("click", this.onIndicatorClicked.bind(this));
		this.container.appendChild(this.element);
	}

	update() {
		// only resize if the zoom has changed
		if (this.zoom !== this.config.position.zoom) this.resize();
		// only reposition if the content has changed
		if (this.lon !== this.config.indicator.lon && this.lat !== this.config.indicator.lat) this.reposition();
		// store the current zoom level
		this.zoom = this.config.position.zoom;
	}

	show(markerData, instant) {
		// don't continue without marker data
		if (!markerData) return;
		// populate the indicator's model
		console.log('markerData', markerData);
		this.config.indicator = markerData;
		// display the indicator
		this.onIndicateSuccess(instant);
	}

	reset() {
		// de-activate the originating element
		if (this.config.indicator.referrer) {
			this.config.indicator.referrer.removeAttribute("data-active");
		}
		// clear the indicator
		this.config.indicator = {
			icon: null,
			photo: null,
			description: null,
			lon: null,
			lat: null,
			zoom: null,
			referrer: null,
		};
	}

	hide() {
		// reset the indicator object
		this.reset();
		// zoom out a little
		this.onMapFocus(this.config.position.lon, this.config.position.lat, this.config.position.zoom, true);
	}

	resize() {
		// resize the marker according to scale
		var scale = 1 / this.config.position.zoom;
		this.element.style.transform = "scale3d(" + scale + ", " + scale + ", 1)";
	}

	reposition() {
		var min = this.config.minimum;
		var max = this.config.maximum;
		var lon = this.config.indicator.lon;
		var lat = this.config.indicator.lat;
		// if the location is within bounds
		if (lon > min.lon && lon < max.lon && lat < min.lat && lat > max.lat) {
			// store the new position
			this.lon = lon;
			this.lat = lat;
			// display the marker
			this.element.style.cursor = this.config.indicator.description ? "pointer" : "default";
			this.element.style.display = "block";
			this.element.style.left = this.config.distortX((lon - min.lon) / (max.lon - min.lon)) * 100 + "%";
			this.element.style.top = this.config.distortY((lat - min.lat) / (max.lat - min.lat)) * 100 + "%";
			// otherwise
		} else {
			// hide the marker
			this.lon = null;
			this.lat = null;
			this.element.style.display = "none";
		}
	}

	onIndicateSuccess(instant) {
		const indicator = this.config.indicator;
		const position = this.config.position;
		const markers = this.config.guideData.markers;
		const exifs = this.config.exifData;
		// try to find the referer in the existing markers
		if (!indicator.referrer) {
			for (let marker of markers) {
				if (marker.photo && marker.photo === indicator.photo) {
					indicator.referrer = marker.referrer;
					indicator.lat = marker.lat;
					indicator.lon = marker.lon;
				}
			}
		}
		// try to find the location data in the exif data
		if (!indicator.lat || !indicator.lon) {
			let photo = exifs[indicator.photo];
			this.config.indicator.lat = photo.lat;
			this.config.indicator.lon = photo.lon;
		}
		// activate the originating element if available
		if (indicator.referrer) {
			indicator.referrer.setAttribute("data-active", "");
			indicator.referrer.scrollIntoView({
				behavior: (instant) ? 'instant' : 'smooth', 
				block: "center", 
				inline: "start"
			});
		}
		// highlight a location with an optional description on the map
		this.onMapFocus(indicator.lon, indicator.lat, position.zoom, true);
	}

	onIndicatorClicked(evt) {
		evt.preventDefault();
		// report that the indicator was clicked
		this.onMarkerClicked(this.config.indicator);
	}
}
