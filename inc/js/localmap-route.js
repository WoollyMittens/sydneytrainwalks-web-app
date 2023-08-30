export class Route {
	constructor(parent, onComplete) {
		this.parent = parent;
		this.config = parent.config;
		this.onComplete = onComplete;
		this.element = null;
		this.tracks = [];
		this.zoom = null;
		this.delay = null;
		this.start();
	}

	start() {
		var key = this.config.key;
		// create a canvas
		this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.element.setAttribute("class", "localmap-route");
		this.parent.element.appendChild(this.element);
		// use the JSON immediately
		if (this.config.routeData && this.config.routeData[key]) {
			this.onJsonLoaded(this.config.routeData[key]);
		}
		// or load the route's GPX first
		else {
			var routeXhr = new XMLHttpRequest();
			routeXhr.addEventListener("load", this.onGpxLoaded.bind(this));
			routeXhr.open("GET", this.config.routeUrl.replace("{key}", key), true);
			routeXhr.send();
		}
	}

	stop() {
		// remove the element
		this.parent.element.removeChild(this.element);
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
		var w = this.parent.element.offsetWidth;
		var h = this.parent.element.offsetHeight;
		// adjust the height of the svg
		this.element.setAttribute("viewBox", "0 0 " + w + " " + h);
		this.element.setAttribute("width", w);
		this.element.setAttribute("height", h);
		// (re)draw the route
		var x, y;
		// for every segment
		var line, points, track;
		var increments = this.tracks.length > 10 ? 25 : 1;
		var stroke = 4 / this.config.position.zoom;
		for (var a = 0, b = this.tracks.length; a < b; a += 1) {
			track = this.tracks[a];
			// create a new line
			line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
			line.setAttribute("data-key", track.name);
			line.setAttribute("fill", "none");
			line.setAttribute("stroke", this.config.supportColour(track.name));
			line.setAttribute("stroke-width", stroke);
			line.setAttribute("stroke-linejoin", "miter");
			line.setAttribute("stroke-miterlimit", 1);
			if (this.tracks.length > 10) line.setAttribute("stroke-dasharray", stroke + " " + stroke);
			// draw the line along the track
			points = "";
			for (var c = 0, d = track.coordinates.length; c < d; c += increments) {
				// calculate the current step
				x = parseInt(
					this.config.distortX((track.coordinates[c][0] - min.lon_cover) / (max.lon_cover - min.lon_cover)) *
						w
				);
				y = parseInt(
					this.config.distortY((track.coordinates[c][1] - min.lat_cover) / (max.lat_cover - min.lat_cover)) *
						h
				);
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
			if (lines.length > 10) lines[a].setAttribute("stroke-dasharray", stroke + " " + stroke);
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
			if (features[a].geometry.coordinates[0][0] instanceof Array) {
				coordinates = [].concat.apply([], features[a].geometry.coordinates);
			} else {
				coordinates = features[a].geometry.coordinates;
			}
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

	onGpxLoaded(evt) {
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
		extractCoords(evt.target.responseXML, this.tracks, "trk", "trkpt");
		extractCoords(evt.target.responseXML, this.tracks, "rte", "rtept");
		// redraw
		this.draw();
		// resolve completion
		this.onComplete();
	}
}
