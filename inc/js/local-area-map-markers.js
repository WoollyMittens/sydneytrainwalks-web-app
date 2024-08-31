export class LocalAreaMapMarkers {
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
		var guideData = this.config.guideData;
		// position every marker in the guide
		guideData.markers.map(this.addMarker.bind(this));
		// resolve completion
		this.onComplete();
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
		var id = markerData.key || "local_area_map_" + markerIndex;
		// create a marker element
		var element = document.createElement("span");
		element.setAttribute("data-key", id);
		element.setAttribute("class", "local-area-map-waypoint local-area-map-index-" + markerIndex);
		element.addEventListener("click", this.onClicked.bind(this, markerData, false));
		element.style.borderColor = this.config.supportColour(id);
		element.style.left = this.config.distortX((markerData.lon - min.lon) / (max.lon - min.lon)) * 100 + "%";
		element.style.top = this.config.distortY((markerData.lat - min.lat) / (max.lat - min.lat)) * 100 + "%";
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
		var id = markerData.key || "local_area_map_" + markerIndex;
		// create a landmark element
		var element = new Image();
		element.setAttribute("src", this.config.markersUrl.replace("{type}", markerData.type));
		element.setAttribute("title", markerData.description || "");
		element.setAttribute("class", "local-area-map-marker local-area-map-index-" + markerIndex);
		element.setAttribute("data-key", id);
		element.addEventListener("click", this.onClicked.bind(this, markerData));
		element.style.left = this.config.distortX((markerData.lon - min.lon) / (max.lon - min.lon)) * 100 + "%";
		element.style.top = this.config.distortY((markerData.lat - min.lat) / (max.lat - min.lat)) * 100 + "%";
		element.style.cursor = markerData.description || markerData.callback ? "pointer" : null;
		return element;
	}
}
