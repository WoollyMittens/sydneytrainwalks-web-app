export class LocalAreaMapLocation {
	constructor(config, container) {
		this.config = config;
		this.container = container;
		this.element = new Image();
		this.zoom = null;
		this.permission = false;
		this.hotspot = null;
		this.options = {
			enableHighAccuracy: true,
		};
		this.start();
	}

	start() {
		if ("geolocation" in navigator) {
			// display a button to activate geolocation
			this.permissions = document.createElement("nav");
			this.permissions.setAttribute("class", "local-area-map-permissions");
			this.button = document.createElement("button");
			this.button.setAttribute("title", "Allow geolocation");
			this.button.innerHTML = "Allow geolocation";
			this.button.setAttribute("class", "local-area-map-permissions-location");
			this.permissions.appendChild(this.button);
			this.config.container.appendChild(this.permissions);
			// activate geolocation upon interaction
			this.button.addEventListener("click", this.requestPosition.bind(this));
			this.config.canvasWrapper.addEventListener("mouseup", this.requestPosition.bind(this));
			this.config.canvasWrapper.addEventListener("touchend", this.requestPosition.bind(this));
			// try activating geolocation automatically
			this.requestPosition();
		}
	}

	update() {
		// only resize if the zoom has changed
		if (this.zoom !== this.config.position.zoom) this.resize();
		// store the current zoom level
		this.zoom = this.config.position.zoom;
	}

	resize() {
		// resize the marker according to scale
		var scale = 1 / this.config.position.zoom;
		this.element.style.transform = "scale3d(" + scale + ", " + scale + ", 1)";
	}

	requestPosition() {
		if (!this.permission) {
			// request location updates
			this.locator = navigator.geolocation.watchPosition(
				this.onReposition.bind(this),
				this.onPositionFailed.bind(this),
				this.options
			);
			// create the indicator
			this.element.setAttribute("src", this.config.markersUrl.replace("{type}", "location"));
			this.element.setAttribute("alt", "");
			this.element.setAttribute("class", "local-area-map-location");
			this.container.appendChild(this.element);
			// hide the button
			this.button.style.display = "none";
		}
	}

	checkHotSpot(lon, lat) {
		var config = this.config;
		// for every marker
		config.hotspots.map((marker) => {
			// if the marker just entered the hotspot
			if (lon > marker.minLon && lon < marker.maxLon && lat > marker.minLat && lat < marker.maxLat && this.hotspot !== marker.title) {
				// remember its name
				this.hotspot = marker.title;
				marker.key = config.guideData.key;
				// trigger the corresponding event
				if (config.checkHotspot(marker)) config.enterHotspot(marker);
			}
			// else if the marker just exited the hotspot
			else if ((lon < marker.minLon || lon > marker.maxLon || lat < marker.minLat || lat > marker.maxLat) && this.hotspot === marker.title) {
				// forget its name
				this.hotspot = null;
				// trigger the corresponding event
				if (config.checkHotspot(marker)) config.leaveHotspot(marker);
			}
		});
	}

	onReposition(position) {
		console.log("requestPosition success:", position);
		var min = this.config.minimum;
		var max = this.config.maximum;
		var lon = position.coords.longitude;
		var lat = position.coords.latitude;
		// if the location is within bounds
		if (lon > min.lon && lon < max.lon && lat < min.lat && lat > max.lat) {
			// display the marker
			this.element.style.display = "block";
			this.element.style.left = this.config.distortX((lon - min.lon) / (max.lon - min.lon)) * 100 + "%";
			this.element.style.top = this.config.distortY((lat - min.lat) / (max.lat - min.lat)) * 100 + "%";
			// check if the location is within a hotspot
			this.checkHotSpot(lon, lat);
			// otherwise
		} else {
			// hide the marker
			this.element.style.display = "none";
		}
		// stop asking for permission
		this.permission = true;
	}

	onPositionFailed(error) {
		console.log("requestPosition error:", error);
	}
}
