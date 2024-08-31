import { LocalAreaMapCanvas } from "./local-area-map-canvas.js";
import { LocalAreaMapControls } from "./local-area-map-controls.js";
import { LocalAreaMapScale } from "./local-area-map-scale.js";
import { LocalAreaMapCredits } from "./local-area-map-credits.js";
import { LocalAreaMapLegend } from "./local-area-map-legend.js";
//import { toGeoJSON } from '../lib/togeojson.js';

export class LocalAreaMap {
	constructor(config) {
		this.defaults = {
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
			useTransitions: null,
			minimum: {
				lon: null,
				lat: null,
				zoom: null,
			},
			maximum: {
				lon: null,
				lat: null,
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
		this.config = {...this.defaults, ...config};
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
			Math.min(lon, this.config.maximum.lon),
			this.config.minimum.lon
		);
		this.config.position.lat = Math.min(
			Math.max(lat, this.config.maximum.lat),
			this.config.minimum.lat
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
		localStorage.setItem("local-area-map", JSON.stringify(state));
	}

	restore(lon, lat, zoom) {
		// load the state from local storage
		var state = JSON.parse(localStorage.getItem("local-area-map"));
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
		this.config.container.className = this.config.container.className.replace(/ local-area-map-busy/g, "");
		// global update
		var max = this.config.maximum;
		var min = this.config.minimum;
		this.restore(
			(max.lon - min.lon) / 2 + min.lon,
			(max.lat - min.lat) / 2 + min.lat,
			min.zoom * 1.25
		);
	}

	stop() {
		console.log('rewriting the legend');
		if (this.config.container) this.config.container.innerHTML = "";
		if (this.config.legend) this.config.legend.innerHTML = "";
	}

	async loadAssetData(source) {
		// if the source is not a filename, assume the data has already been loaded
		if (typeof source !== 'string') return source;
		// otherwise fetch and decode the data as a file
		const guideResponse = await fetch(source);
		const data = await guideResponse.json();
		return data;
	}

	async start() {
		this.config.container.className += " local-area-map-busy";
		// load the guide data
		this.config.guideData = await this.loadAssetData(this.config.guideUrl);
		// load the exif data
		this.config.exifData = await this.loadAssetData(this.config.exifUrl);
		// add the components
		this.components = {
			canvas: new LocalAreaMapCanvas(this.config, this.onComplete.bind(this), this.indicate.bind(this), this.focus.bind(this)),
			controls: new LocalAreaMapControls(this.config, this.focus.bind(this)),
			scale: new LocalAreaMapScale(this.config),
			credits: new LocalAreaMapCredits(this.config),
			legend: new LocalAreaMapLegend(this.config, this.indicate.bind(this), this.unindicate.bind(this)),
		};
	}
}

window.LocalAreaMap = LocalAreaMap;
