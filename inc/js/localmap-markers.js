export class Markers {
	constructor(config, container, onClicked, onComplete) {
		this.config = config;
		this.container = container
		this.onClicked = onClicked;
		this.onComplete = onComplete;
		this.elements = [];
		this.zoom = null;
		this.delay = null;
		this.start();
	}

	start() {
		// if cached data is available
		if (this.config.guideData) {
			// add the markers from the guide
			this.addGuide();
		}
		// otherwise
		else {
			// load the guide's JSON first
			var guideXhr = new XMLHttpRequest();
			guideXhr.addEventListener("load", this.onGuideLoaded.bind(this));
			guideXhr.open("GET", this.config.guideUrl, true);
			guideXhr.send();
		}
	}

	update() {
		// defer redraw until idle
		if (this.config.position.zoom !== this.zoom) {
			clearTimeout(this.delay);
			this.delay = setTimeout(this.redraw.bind(this), 100);
		}
		// store the current zoom level
		this.zoom = this.config.position.zoom;
	}

	redraw() {
		// redraw the markers according to scale
		var scale = 1 / this.config.position.zoom;
		for (var key in this.elements) {
			this.elements[key].style.transform = "scale3d(" + scale + ", " + scale + ", 1)";
		}
	}

	addGuide() {
		var config = this.config;
		var guideData = this.config.guideData;
		// store the interpolation limits
		var min = config.minimum;
		var max = config.maximum;
		min.lon = guideData.bounds.west;
		min.lat = guideData.bounds.north;
		max.lon = guideData.bounds.east;
		max.lat = guideData.bounds.south;
		// store the coverage limits
		min.lon_cover = guideData.bounds.west;
		min.lat_cover = guideData.bounds.north;
		max.lon_cover = guideData.bounds.east;
		max.lat_cover = guideData.bounds.south;
		// assume an initial position
		var pos = config.position;
		pos.lon = (max.lon_cover - min.lon_cover) / 2 + min.lon_cover;
		pos.lat = (max.lat_cover - min.lat_cover) / 2 + min.lat_cover;
		// position every marker in the guide
		guideData.markers.map(this.addMarker.bind(this));
		// resolve completion
		this.onComplete();
	}

	addMarker(markerData, markerIndex) {
		// add a landmark, waypoint, or a hotspot to the map
		switch (markerData.type) {
			case "waypoint":
				markerData.element = this.addWaypoint(markerData, markerIndex);
				break;
			case "hotspot":
				markerData.element = this.addHotspot(markerData, markerIndex);
				break;
			default:
				markerData.element = this.addLandmark(markerData, markerIndex);
		}
		// add valid markers to the map
		if (markerData.element) {
			this.container.appendChild(markerData.element);
			this.elements.push(markerData.element);
		}
	}

	addWaypoint(markerData, markerIndex) {
		var min = this.config.minimum;
		var max = this.config.maximum;
		var id = markerData.key || "localmap_" + markerIndex;
		// create a marker element
		var element = document.createElement("span");
		element.setAttribute("id", id);
		element.setAttribute("data-key", id);
		element.setAttribute("class", "localmap-waypoint localmap-index-" + markerIndex);
		element.addEventListener("click", this.onClicked.bind(this, markerData, false));
		element.style.borderColor = this.config.supportColour(id);
		element.style.left = this.config.distortX((markerData.lon - min.lon_cover) / (max.lon_cover - min.lon_cover)) * 100 + "%";
		element.style.top = this.config.distortY((markerData.lat - min.lat_cover) / (max.lat_cover - min.lat_cover)) * 100 + "%";
		element.style.cursor = "pointer";
		return element;
	}

	addHotspot(markerData, markerIndex) {
		var config = this.config;
		// pre-calculate the hotspot radius
		markerData.maxLon = markerData.lon + markerData.radius;
		markerData.minLon = markerData.lon - markerData.radius;
		markerData.maxLat = markerData.lat + markerData.radius / 1.5;
		markerData.minLat = markerData.lat - markerData.radius / 1.5;
		this.config.hotspots.push(markerData);
		// otherwise handle as a normal landmark
		return config.checkHotspot(markerData) ? this.addLandmark(markerData, markerIndex) : null;
	}

	addLandmark(markerData, markerIndex) {
		var min = this.config.minimum;
		var max = this.config.maximum;
		var id = markerData.id || "localmap_" + markerIndex;
		// create a landmark element
		var element = new Image();
		element.setAttribute("src", this.config.markersUrl.replace("{type}", markerData.type));
		element.setAttribute("title", markerData.description || "");
		element.setAttribute("class", "localmap-marker localmap-index-" + markerIndex);
		element.setAttribute("id", id);
		element.setAttribute("data-key", id);
		element.addEventListener("click", this.onClicked.bind(this, markerData));
		element.style.left = this.config.distortX((markerData.lon - min.lon_cover) / (max.lon_cover - min.lon_cover)) * 100 + "%";
		element.style.top = this.config.distortY((markerData.lat - min.lat_cover) / (max.lat_cover - min.lat_cover)) * 100 + "%";
		element.style.cursor = markerData.description || markerData.callback ? "pointer" : null;
		return element;
	}

	onGuideLoaded(evt) {
		// decode the guide data
		this.config.guideData = this.config.guideData || {};
		this.config.guideData = JSON.parse(evt.target.response);
		// add the markers from the guide
		this.addGuide();
	}
}
