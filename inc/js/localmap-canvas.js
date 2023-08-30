import { Indicator } from "./localmap-indicator.js";
import { Location } from "./localmap-location.js";
import { Markers } from "./localmap-markers.js";
import { Background } from "./localmap-background.js";
import { Route } from "./localmap-route.js";

export class Canvas {
	constructor(parent, onComplete, onMarkerClicked, onMapFocus) {
		this.parent = parent;
		this.onComplete = onComplete;
		this.onMarkerClicked = onMarkerClicked;
		this.onMapFocus = onMapFocus;
		this.config = parent.config;
		this.components = {};
		this.element = document.createElement("div");
		this.config.canvasWrapper = this.element;
		this.start();
	}

	start() {
		// create a canvas
		this.element.setAttribute("class", "localmap-canvas");
		this.element.addEventListener("transitionend", this.onUpdated.bind(this));
		// add the canvas to the parent container
		this.config.container.appendChild(this.element);
		// add the indicator and location components
		this.components.indicator = new Indicator(this, this.onMarkerClicked, this.onMapFocus);
		this.components.location = new Location(this);
		// start adding components in turn
		this.addMarkers();
	}

	stop() {
		// remove each sub-component
		for (var key in this.components) if (this.components[key].stop) this.components[key].stop(this.config);
		// remove the element
		this.config.container.removeChild(this.element);
	}

	update() {
		// redraw this component
		this.redraw();
		// update all sub-components
		for (var key in this.components) if (this.components[key].update) this.components[key].update(this.config);
	}

	redraw() {
		var container = this.config.container;
		var element = this.element;
		var min = this.config.minimum;
		var max = this.config.maximum;
		var pos = this.config.position;
		// convert the lon,lat to x,y
		var centerX = ((pos.lon - min.lon_cover) / (max.lon_cover - min.lon_cover)) * element.offsetWidth;
		var centerY = ((pos.lat - min.lat_cover) / (max.lat_cover - min.lat_cover)) * element.offsetHeight;
		// limit the zoom
		var zoom = Math.max(Math.min(pos.zoom, max.zoom), min.zoom);
		// convert the center into an offset
		var offsetX = -centerX * zoom + container.offsetWidth / 2;
		var offsetY = -centerY * zoom + container.offsetHeight / 2;
		// apply the limits
		offsetX = Math.max(Math.min(offsetX, 0), container.offsetWidth - element.offsetWidth * zoom);
		offsetY = Math.max(Math.min(offsetY, 0), container.offsetHeight - element.offsetHeight * zoom);
		// position the background
		if (this.config.useTransitions) this.element.className += " localmap-canvas-transition";
		element.style.transform =
			"translate3d(" + offsetX + "px, " + offsetY + "px, 0px) scale3d(" + zoom + ", " + zoom + ",1)";
	}

	addMarkers() {
		// add the markers to the canvas
		this.components.markers = new Markers(this, this.onMarkerClicked, this.addBackground.bind(this));
	}

	addBackground() {
		// add the background to the canvas
		this.components.background = new Background(this, this.addRoute.bind(this));
	}

	addRoute() {
		// add the route to the canvas
		this.components.route = new Route(this, this.onComplete);
	}

	onUpdated(evt) {
		// remove the transition
		this.element.className = this.element.className.replace(/ localmap-canvas-transition/g, "");
	}
}
