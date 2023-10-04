export class Indicator {
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
		this.element.setAttribute("class", "localmap-indicator");
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
		this.config.indicator = markerData;
		// if the coordinates are known
		if (this.config.indicator.lon && this.config.indicator.lat) {
			// display the indicator immediately
			this.onIndicateSuccess(instant);
		}
		// else try the cached EXIF data
		else if (this.config?.exifData[markerData.photo]) {
			// display the indicator after getting the coordinates from the cache
			const cached = this.config.exifData[markerData.photo];
			this.config.indicator.lon = cached.lon;
			this.config.indicator.lat = cached.lat;
			this.onIndicateSuccess(instant);
		}
		// or try to retrieve them from the photo
		else {
			var guideXhr = new XMLHttpRequest();
			guideXhr.addEventListener("load", this.onExifLoaded.bind(this));
			guideXhr.open("GET", this.config.exifUrl.replace("{src}", markerData.photo), true);
			guideXhr.send();
		}
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
		if (lon > min.lon_cover && lon < max.lon_cover && lat < min.lat_cover && lat > max.lat_cover) {
			// store the new position
			this.lon = lon;
			this.lat = lat;
			// display the marker
			this.element.style.cursor = this.config.indicator.description ? "pointer" : "default";
			this.element.style.display = "block";
			this.element.style.left = this.config.distortX((lon - min.lon_cover) / (max.lon_cover - min.lon_cover)) * 100 + "%";
			this.element.style.top = this.config.distortY((lat - min.lat_cover) / (max.lat_cover - min.lat_cover)) * 100 + "%";
			// otherwise
		} else {
			// hide the marker
			this.lon = null;
			this.lat = null;
			this.element.style.display = "none";
		}
	}

	onExifLoaded(result) {
		try {
			var exif = JSON.parse(result.target.response);
			var deg,
				min,
				sec,
				ref,
				coords = {};
			// if the exif data contains GPS information
			if (exif && exif.GPS) {
				// convert the lon into a usable format
				deg = parseInt(exif.GPS.GPSLongitude[0]);
				min = parseInt(exif.GPS.GPSLongitude[1]);
				sec = parseInt(exif.GPS.GPSLongitude[2]) / 100;
				ref = exif.GPS.GPSLongitudeRef;
				this.config.indicator.lon = (deg + min / 60 + sec / 3600) * (ref === "W" ? -1 : 1);
				// convert the lat into a usable format
				deg = parseInt(exif.GPS.GPSLatitude[0]);
				min = parseInt(exif.GPS.GPSLatitude[1]);
				sec = parseInt(exif.GPS.GPSLatitude[2]) / 100;
				ref = exif.GPS.GPSLatitudeRef;
				this.config.indicator.lat = (deg + min / 60 + sec / 3600) * (ref === "N" ? 1 : -1);
				// return the result
				this.onIndicateSuccess(false);
			}
		} catch (e) {
			console.log(e);
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
				if (marker.photo === indicator.photo) {
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
			console.log('instant', instant);
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
