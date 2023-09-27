import { Canvas } from "./localmap-canvas.js";
import { Controls } from "./localmap-controls.js";
import { Scale } from "./localmap-scale.js";
import { Credits } from "./localmap-credits.js";
import { Modal } from "./localmap-modal.js";
import { Legend } from "./localmap-legend.js";

export class Localmap {
	constructor(config) {
		this.config = {
			container: null,
			legend: null,
			canvasWrapper: null,
			canvasElement: null,
			thumbsUrl: null,
			photosUrl: null,
			markersUrl: null,
			guideUrl: null,
			routeUrl: null,
			mapUrl: null,
			tilesUrl: null,
			tilesZoom: 15,
			exifUrl: null,
			guideData: null,
			routeData: null,
			exifData: null,
			introTemplate: null,
			outroTemplate: null,
			creditsTemplate: null,
			showFirst: null,
			useTransitions: null,
			minimum: {
				lon: null,
				lat: null,
				lon_cover: null,
				lat_cover: null,
				zoom: null,
			},
			maximum: {
				lon: null,
				lat: null,
				lon_cover: null,
				lat_cover: null,
				zoom: null,
			},
			position: {
				lon: null,
				lat: null,
				zoom: null,
			},
			indicator: {
				icon: null,
				photo: null,
				description: null,
				lon: null,
				lat: null,
				zoom: null,
				referrer: null,
			},
			hotspots: [],
			checkHotspot: function () {
				return true;
			},
			enterHotspot: function () {
				return true;
			},
			leaveHotspot: function () {
				return true;
			},
			distortX: function (x) {
				return x;
			},
			distortY: function (y) {
				return y;
			},
			supportColour: function (id) {
				return "darkorange";
			},
		};
		// extend the default options
		for (var key in config) this.config[key] = config[key];
		// start the functionality
		this.init();
	}

	update() {
		// retard the save state
		clearTimeout(this.saveTimeout);
		this.saveTimeout = window.setTimeout(this.store.bind(this), 1000);
		// retard the update
		window.cancelAnimationFrame(this.animationFrame);
		this.animationFrame = window.requestAnimationFrame(this.redraw.bind(this));
	}

	redraw() {
		// update all components
		for (var key in this.components) if (this.components[key].update) this.components[key].update(this.config);
	}

	focus(lon, lat, zoom, smoothly) {
		// try to keep the focus within bounds
		this.config.useTransitions = smoothly;
		this.config.position.lon = Math.max(
			Math.min(lon, this.config.maximum.lon_cover),
			this.config.minimum.lon_cover
		);
		this.config.position.lat = Math.min(
			Math.max(lat, this.config.maximum.lat_cover),
			this.config.minimum.lat_cover
		);
		this.config.position.zoom = Math.max(Math.min(zoom, this.config.maximum.zoom), this.config.minimum.zoom);
		this.update();
	}

	store() {
		// create a save state selected properties
		var state = {};
		state = {
			key: this.config.guideData?.key,
			lon: this.config.position.lon,
			lat: this.config.position.lat,
			zoom: this.config.position.zoom,
		};
		// save the state to local storage
		localStorage.setItem("localmap", JSON.stringify(state));
	}

	restore(lon, lat, zoom) {
		// load the state from local storage
		var state = JSON.parse(localStorage.getItem("localmap"));
		// if the stored state applied to this instance of the map, restore the value
		if (state && state.key === this.config.guideData?.key) { this.focus(state.lon, state.lat, state.zoom, false); }
		// otherwise restore the fallback
		else { this.focus(lon, lat, zoom, false); }
	}

	describe(markerdata) {
		// TODO: indicate() the marker that goes with this
		// show a popup describing the markerdata
		this.components.modal.show(markerdata);
		// resolve any callback
		if (markerdata.callback) markerdata.callback(markerdata);
	}

	stop() {
		// remove each component
		for (var key in this.components) if (this.components[key].stop) this.components[key].stop(this.config);
	}

	indicate(input) {
		var canvas = this.components.canvas;
		var indicator = canvas.components.indicator;
		// reset the previous
		indicator.reset();
		// ask the indicator to indicate
		indicator.show(input);
		// cancel any associated events
		return false;
	}

	unindicate() {
		var canvas = this.components.canvas;
		var indicator = canvas.components.indicator;
		// reset the indicator
		indicator.hide();
		// cancel any associated events
		return false;
	}

	onComplete() {
		// remove the busy indicator
		this.config.container.className = this.config.container.className.replace(/ localmap-busy/g, "");
		// global update
		var max = this.config.maximum;
		var min = this.config.minimum;
		this.restore(
			(max.lon_cover - min.lon_cover) / 2 + min.lon_cover,
			(max.lat_cover - min.lat_cover) / 2 + min.lat_cover,
			min.zoom * 1.25
		);
	}

	init() {
		this.config.container.className += " localmap-busy";
		this.components = {
			canvas: new Canvas(this.config, this.onComplete.bind(this), this.describe.bind(this), this.focus.bind(this)),
			controls: new Controls(this.config, this.focus.bind(this)),
			scale: new Scale(this.config),
			credits: new Credits(this.config),
			modal: new Modal(this.config),
			legend: new Legend(this.config, this.indicate.bind(this)),
		};
	}
}
