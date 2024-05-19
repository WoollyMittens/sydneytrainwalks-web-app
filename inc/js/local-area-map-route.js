export class LocalAreaMapRoute {
	constructor(config, container, onComplete) {
		this.config = config;
		this.container = container;
		this.onComplete = onComplete;
		this.element = null;
		this.tracks = [];
		this.zoom = null;
		this.delay = null;
		this.start();
	}

	async start() {
		// create a canvas
		this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.element.setAttribute("class", "local-area-map-route");
		this.container.appendChild(this.element);
		// load the route data
		let fileType;
		const source = this.config.routeUrl;
		if (source instanceof Node) { fileType = 'dom' }
		else if (typeof source === 'string') {  fileType = source.split('.').pop() }
		switch(fileType) {
			// load as XML
			case 'gpx': this.loadAsGpx(source); break;
			// load as JSON
			case 'json': this.loadAsJson(source); break;
			// handle preloaded XML
			case 'dom': this.onGpxLoaded(source); break;
			// handle preloaded JSON
			default: this.onJsonLoaded(source);
		}
	}

	async loadAsGpx(url) {
		// otherwise fetch and decode the data as a file
		const response = await fetch(url);
		const xml = await response.text();
		const dom = (new DOMParser()).parseFromString(xml, 'text/xml');
		console.log(typeof dom, dom instanceof Node);
		this.onGpxLoaded(dom);
	}

	async loadAsJson(url) {
		// otherwise fetch and decode the data as a file
		response = await fetch(url);
		var json = await response.json();
		this.onJsonLoaded(json);
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

	draw() {
		var min = this.config.minimum;
		var max = this.config.maximum;
		var w = this.container.offsetWidth;
		var h = this.container.offsetHeight;
		// adjust the height of the svg
		this.element.setAttribute("viewBox", "0 0 " + w + " " + h);
		this.element.setAttribute("width", w);
		this.element.setAttribute("height", h);
		// (re)draw the route
		var x, y;
		// for every segment
		var line, points, track;
		var increments = this.tracks.length > 20 ? 10 : 1;
		var stroke = 4 / this.config.position.zoom;
		for (var a = 0, b = this.tracks.length; a < b; a += 1) {
			track = this.tracks[a];
			// create a new line
			line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
			line.setAttribute("data-key", track.name);
			line.setAttribute("data-track", track.name);
			line.setAttribute("fill", "none");
			line.setAttribute("stroke", this.config.supportColour(track.name));
			line.setAttribute("stroke-width", stroke);
			line.setAttribute("stroke-linejoin", "miter");
			line.setAttribute("stroke-miterlimit", 1);
			if (this.tracks.length > 20) line.setAttribute("stroke-dasharray", stroke + " " + stroke);
			// draw the line along the track
			points = "";
			for (var c = 0, d = track.coordinates.length; c < d; c += increments) {
				// calculate the current step
				x = parseInt(this.config.distortX((track.coordinates[c][0] - min.lon) / (max.lon - min.lon)) * w);
				y = parseInt(this.config.distortY((track.coordinates[c][1] - min.lat) / (max.lat - min.lat)) * h);
				// add the step
				points += " " + x + "," + y;
			}
			line.setAttribute("points", points);
			line.addEventListener("click", this.onRouteClicked.bind(this, track.name));
			// insert the line
			this.element.appendChild(line);
		}
	}

	redraw() {
		var stroke = 4 / this.config.position.zoom;
		var lines = this.element.querySelectorAll("polyline");
		for (var a = 0, b = lines.length; a < b; a += 1) {
			lines[a].setAttribute("stroke-width", stroke);
			if (lines.length > 20) lines[a].setAttribute("stroke-dasharray", stroke + " " + stroke);
		}
	}

	onRouteClicked(name) {}

	onJsonLoaded(geojson) {
		// convert JSON into an array of coordinates
		var features = geojson.features;
		var name;
		var coordinates = [];
		for (var a = 0, b = features.length; a < b; a += 1) {
			name = features[a].properties.name;
			// untangle the coordinates if they are wrapped in an extra array
			if (features[a].geometry.coordinates[0][0] instanceof Array) { coordinates = [].concat.apply([], features[a].geometry.coordinates); }
			// otherwise just use the coordinates
			else { coordinates = features[a].geometry.coordinates; }
			// add the track
			this.tracks.push({
				name: name,
				coordinates: coordinates,
			});
		}
		// redraw
		this.draw();
		// resolve completion
		this.onComplete();
	}

	onGpxLoaded(gpx) {
		// extracts coordinates from a GPX document
		function extractCoords(source, destination, parentTag, childTag) {
			var a, b, c, d, childNodes, name, coords, parentNodes;
			parentNodes = source.getElementsByTagName(parentTag);
			for (a = 0, b = parentNodes.length; a < b; a += 1) {
				name = parentNodes[a].getElementsByTagName("name")[0].firstChild.nodeValue;
				coords = [];
				childNodes = parentNodes[a].getElementsByTagName(childTag);
				for (c = 0, d = childNodes.length; c < d; c += 1) {
					coords.push([
						parseFloat(childNodes[c].getAttribute("lon")),
						parseFloat(childNodes[c].getAttribute("lat")),
						null,
					]);
				}
				destination.push({
					name: name,
					coordinates: coords,
				});
			}
		}
		// extract both kinds of tracks from the GPX into an array of coordinates
		extractCoords(gpx, this.tracks, "trk", "trkpt");
		extractCoords(gpx, this.tracks, "rte", "rtept");
		// redraw
		this.draw();
		// resolve completion
		this.onComplete();
	}
}
