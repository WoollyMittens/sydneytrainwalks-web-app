import { LocalAreaMapIndicator } from "./local-area-map-indicator.js";
import { LocalAreaMapLocation } from "./local-area-map-location.js";
import { LocalAreaMapMarkers } from "./local-area-map-markers.js";
import { LocalAreaMapBackground } from "./local-area-map-background.js";
import { LocalAreaMapRoute } from "./local-area-map-route.js";

export class LocalAreaMapCanvas {
	constructor(config, onComplete, onMarkerClicked, onMapFocus) {
		this.config = config;
		this.onComplete = onComplete;
		this.onMarkerClicked = onMarkerClicked;
		this.onMapFocus = onMapFocus;
		this.components = {};
		this.element = document.createElement("div");
		this.wrapper = document.createElement("div");
		this.config.canvasElement = this.element;
		this.config.canvasWrapper = this.wrapper;
		this.start();
	}

	start() {
		// create the wrapper
		this.wrapper.setAttribute("class", "local-area-map-wrapper");
		// create a canvas
		this.element.setAttribute("class", "local-area-map-canvas");
		this.element.addEventListener("transitionend", this.onUpdated.bind(this));
		// add the canvas to the parent container
		this.wrapper.appendChild(this.element);
		this.config.container.appendChild(this.wrapper);
		// add the indicator and location components
		this.components.indicator = new LocalAreaMapIndicator(this.config, this.element, this.onMarkerClicked, this.onMapFocus);
		this.components.location = new LocalAreaMapLocation(this.config, this.element);
		// add the background / tiles
		this.addBackground();
	}

	update() {
		// redraw this component
		this.redraw();
		// update all sub-components
		for (var key in this.components) if (this.components[key].update) this.components[key].update(this.config);
	}

	redraw() {
		var wrapper =this.wrapper;
		var element = this.element;
		var min = this.config.minimum;
		var max = this.config.maximum;
		var pos = this.config.position;
		// convert the lon,lat to x,y
		var centerX = ((pos.lon - min.lon) / (max.lon - min.lon)) * element.offsetWidth;
		var centerY = ((pos.lat - min.lat) / (max.lat - min.lat)) * element.offsetHeight;
		// limit the zoom
		var zoom = Math.max(Math.min(pos.zoom, max.zoom), min.zoom);
		// convert the center into an offset
		var offsetX = -centerX * zoom + wrapper.offsetWidth / 2;
		var offsetY = -centerY * zoom + wrapper.offsetHeight / 2;
		// apply the limits
		offsetX = Math.max(Math.min(offsetX, 0), wrapper.offsetWidth - element.offsetWidth * zoom);
		offsetY = Math.max(Math.min(offsetY, 0), wrapper.offsetHeight - element.offsetHeight * zoom);
		// position the background
		if (this.config.useTransitions) this.element.className += " local-area-map-canvas-transition";
		element.style.transform = "translate3d(" + offsetX + "px, " + offsetY + "px, 0px) scale3d(" + zoom + ", " + zoom + ",1)";
	}

	addBackground() {
		// add the background to the canvas
		this.components.background = new LocalAreaMapBackground(this.config, this.element, this.addMarkers.bind(this));
	}

	addMarkers() {
		// add the markers to the canvas
		this.components.markers = new LocalAreaMapMarkers(this.config, this.element, this.onMarkerClicked, this.addRoute.bind(this));
	}

	addRoute() {
		// add the route to the canvas
		this.components.route = new LocalAreaMapRoute(this.config, this.element, this.onComplete);
	}

	onUpdated(evt) {
		// remove the transition
		this.element.className = this.element.className.replace(/ local-area-map-canvas-transition/g, "");
	}
}
