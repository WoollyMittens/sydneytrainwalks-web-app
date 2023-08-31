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

	stop() {
		// remove the element
		this.container.removeChild(this.element);
	}

	update() {
		// only resize if the zoom has changed
		if (this.zoom !== this.config.position.zoom) this.resize();
		// only reposition if the content has changed
		if (this.lon !== this.config.indicator.lon && this.lat !== this.config.indicator.lat) this.reposition();
		// store the current zoom level
		this.zoom = this.config.position.zoom;
	}

	show(input) {
		// handle the event if this was used as one
		if (input.target) input = input.target;
		// gather the parameters from diverse input
		if (!input.getAttribute)
			input.getAttribute = function (attr) {
				return input[attr];
			};
		if (!input.setAttribute)
			input.setAttribute = function (attr, value) {
				input[attr] = value;
			};
		var source =
			input.getAttribute("data-url") ||
			input.getAttribute("src") ||
			input.getAttribute("href") ||
			input.getAttribute("photo");
		var type = input.getAttribute("data-type");
		var description =
			input.getAttribute("data-title") ||
			input.getAttribute("title") ||
			input.getAttribute("description") ||
			input.innerHTML;
		var lon = input.getAttribute("data-lon") || input.getAttribute("lon");
		var lat = input.getAttribute("data-lat") || input.getAttribute("lat");
		// try to get the coordinates from the cached exif data
		var filename = source ? source.split("/").pop() : null;
		var cached = this.config.exifData ? this.config.exifData[filename] : {};
		// populate the indicator's model
		this.config.indicator = {
			photo: filename,
			type: type,
			description: description,
			lon: lon || cached.lon,
			lat: lat || cached.lat,
			zoom: this.config.maximum.zoom,
			referrer: input.referrer || input,
		};
		// if the coordinates are known
		if (this.config.indicator.lon && this.config.indicator.lat) {
			// display the indicator immediately
			this.onIndicateSuccess();
		} else {
			// try to retrieve them from the photo
			var guideXhr = new XMLHttpRequest();
			guideXhr.addEventListener("load", this.onExifLoaded.bind(this));
			guideXhr.open("GET", this.config.exifUrl.replace("{src}", source), true);
			guideXhr.send();
		}
	}

	reset() {
		// de-activate the originating element
		if (this.config.indicator.referrer) this.config.indicator.referrer.setAttribute("data-localmap", "passive");
		// clear the indicator
		this.config.indicator = {
			icon: null,
			photo: null,
			description: null,
			lon: null,
			lat: null,
			zoom: null,
			origin: null,
		};
	}

	hide() {
		// reset the indicator object
		this.reset();
		// zoom out a little
		this.onMapFocus(this.config.position.lon, this.config.position.lat, this.config.position.zoom * 0.25, true);
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
			this.onIndicateSuccess();
		}
	}

	onIndicateSuccess() {
		// activate the originating element
		this.config.indicator.referrer.setAttribute("data-localmap", "active");
		// highlight a location with an optional description on the map
		this.onMapFocus(this.config.indicator.lon, this.config.indicator.lat, this.config.indicator.zoom, true);
	}

	onIndicatorClicked(evt) {
		evt.preventDefault();
		// report that the indicator was clicked
		this.onMarkerClicked(this.config.indicator);
	}
}
