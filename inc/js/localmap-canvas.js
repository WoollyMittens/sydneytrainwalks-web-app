import { Indicator } from "./localmap-indicator.js";
import { Location } from "./localmap-location.js";
import { Markers } from "./localmap-markers.js";
import { Background } from "./localmap-background.js";
import { Route } from "./localmap-route.js";

export class Canvas {
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
		this.wrapper.setAttribute("class", "localmap-wrapper");
		// create a canvas
		this.element.setAttribute("class", "localmap-canvas");
		this.element.addEventListener("transitionend", this.onUpdated.bind(this));
		// add the canvas to the parent container
		this.wrapper.appendChild(this.element);
		this.config.container.appendChild(this.wrapper);
		// add the indicator and location components
		this.components.indicator = new Indicator(this.config, this.element, this.onMarkerClicked, this.onMapFocus);
		this.components.location = new Location(this.config, this.element);
		// start adding components in turn
		this.addMarkers();
	}

	stop() {
		// remove each sub-component
		for (var key in this.components) if (this.components[key].stop) this.components[key].stop(this.config);
		// remove the element
		this.config.container.removeChild(this.wrapper);
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
		var centerX = ((pos.lon - min.lon_cover) / (max.lon_cover - min.lon_cover)) * element.offsetWidth;
		var centerY = ((pos.lat - min.lat_cover) / (max.lat_cover - min.lat_cover)) * element.offsetHeight;
		// limit the zoom
		var zoom = Math.max(Math.min(pos.zoom, max.zoom), min.zoom);
		// convert the center into an offset
		var offsetX = -centerX * zoom + wrapper.offsetWidth / 2;
		var offsetY = -centerY * zoom + wrapper.offsetHeight / 2;
		// apply the limits
		offsetX = Math.max(Math.min(offsetX, 0), wrapper.offsetWidth - element.offsetWidth * zoom);
		offsetY = Math.max(Math.min(offsetY, 0), wrapper.offsetHeight - element.offsetHeight * zoom);
		// position the background
		if (this.config.useTransitions) this.element.className += " localmap-canvas-transition";
		element.style.transform = "translate3d(" + offsetX + "px, " + offsetY + "px, 0px) scale3d(" + zoom + ", " + zoom + ",1)";
	}

	addMarkers() {
		// add the markers to the canvas
		this.components.markers = new Markers(this.config, this.element, this.onMarkerClicked, this.addBackground.bind(this));
	}

	addBackground() {
		// add the background to the canvas
		this.components.background = new Background(this.config, this.element, this.addRoute.bind(this));
	}

	addRoute() {
		// add the route to the canvas
		this.components.route = new Route(this.config, this.element, this.onComplete);
	}

	onUpdated(evt) {
		// remove the transition
		this.element.className = this.element.className.replace(/ localmap-canvas-transition/g, "");
	}
}
