import { Canvas } from "./localmap-canvas.js";
import { Controls } from "./localmap-controls.js";
import { Scale } from "./localmap-scale.js";
import { Credits } from "./localmap-credits.js";
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
		this.start();
	}

	update() {
		// delay the save state
		clearTimeout(this.saveTimeout);
		this.saveTimeout = window.setTimeout(this.store.bind(this), 1000);
		// delay the update
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
			photo: this.config.indicator?.photo
		};
		console.log('storing the state', state);
		// save the state to local storage
		localStorage.setItem("localmap", JSON.stringify(state));
	}

	restore(lon, lat, zoom) {
		// load the state from local storage
		var state = JSON.parse(localStorage.getItem("localmap"));
		// if the stored state applied to this instance of the map
		if (state && state.key === this.config.guideData?.key) {
			// restore the map focus
			this.focus(state.lon, state.lat, state.zoom, false);
			// restore the incator if avalable
			console.log('restoring the indicator', state);
			if (state.photo) setTimeout(this.indicate.bind(this, { 'photo': state.photo }, true), 500);
		}
		// otherwise restore the fallback
		else { 
			this.focus(lon, lat, zoom, false); 
		}
	}

	indicate(input, instant) {
		var canvas = this.components.canvas;
		var indicator = canvas.components.indicator;
		// if there is a callback, trigger it instead
		if (input.callback) { input.callback(); return false; }
		// reset the previous
		indicator.reset();
		// ask the indicator to indicate
		console.log('indicate', input);
		indicator.show(input, instant);
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

	stop() {
		if (this.config.container) this.config.container.innerHTML = "";
		if (this.config.legend) this.config.legend.innerHTML = "";
	}

	start() {
		this.config.container.className += " localmap-busy";
		this.components = {
			canvas: new Canvas(this.config, this.onComplete.bind(this), this.indicate.bind(this), this.focus.bind(this)),
			controls: new Controls(this.config, this.focus.bind(this)),
			scale: new Scale(this.config),
			credits: new Credits(this.config),
			legend: new Legend(this.config, this.indicate.bind(this), this.unindicate.bind(this)),
		};
	}
}
