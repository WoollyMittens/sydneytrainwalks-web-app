import { long2tile, lat2tile, tile2long, tile2lat } from "./slippy.js";

export class Background {
	constructor(config, container, onComplete) {
		this.config = config;
		this.container = container;
		this.onComplete = onComplete;
		this.element = null;
		this.image = new Image();
		this.tilesQueue = null;
		this.tilesSize = 256;
		this.start();
	}

	start() {
		// create the canvas
		this.element = document.createElement("div");
		this.element.setAttribute("class", "localmap-background");
		this.container.appendChild(this.element);
		// load the map as tiles
		if (this.config.tilesUrl) {
			this.loadTiles();
		}
		// or load the map as a bitmap
		else {
			this.loadBitmap();
		}
		// catch window resizes
		window.addEventListener("resize", this.redraw.bind(this));
	}

	update() {}

	redraw() {
		var container = this.config.container;
		var element = this.element;
		var min = this.config.minimum;
		var max = this.config.maximum;
		// calculate the limits
		min.zoom = Math.max(container.offsetWidth / element.offsetWidth, container.offsetHeight / element.offsetHeight);
		max.zoom = 3;
	}

	loadBitmap() {
		// load the map as a bitmap
		this.image.addEventListener("load", this.onBitmapLoaded.bind(this));
		this.image.setAttribute("src", this.config.mapUrl);
	}

	drawBitmap() {
		var container = this.config.container;
		var element = this.element;
		var image = this.image;
		var min = this.config.minimum;
		var max = this.config.maximum;
		// use the bounds of subsets of walks
		var pixelsPerLon = image.naturalWidth / (max.lon - min.lon);
		var pixelsPerLat = image.naturalHeight / (max.lat - min.lat);
		var offsetWidth = (min.lon - min.lon_cover) * pixelsPerLon;
		var offsetHeight = (min.lat - min.lat_cover) * pixelsPerLat;
		var croppedWidth = (max.lon_cover - min.lon_cover) * pixelsPerLon;
		var croppedHeight = (max.lat_cover - min.lat_cover) * pixelsPerLat;
		var displayWidth = croppedWidth / 2;
		var displayHeight = croppedHeight / 2;
		// set the size of the canvas to the bitmap
		element.style.width = croppedWidth + "px";
		element.style.height = croppedHeight + "px";
		// double up the bitmap to retina size
		image.style.marginLeft = offsetWidth + "px";
		image.style.marginTop = offsetHeight + "px";
		// insert image instead of canvas
		element.appendChild(image);
		// redraw the component
		this.redraw();
		// resolve the promise
		this.onComplete();
	}

	measureTiles() {
		var min = this.config.minimum;
		var max = this.config.maximum;
		var pos = this.config.position;
		// calculate the cols and rows of tiles
		var minX = long2tile(min.lon_cover, this.config.tilesZoom);
		var minY = lat2tile(min.lat_cover, this.config.tilesZoom);
		var maxX = long2tile(max.lon_cover, this.config.tilesZoom);
		var maxY = lat2tile(max.lat_cover, this.config.tilesZoom);
		// determine the centre tile
		var state = JSON.parse(localStorage.getItem("localmap"));
		if (state) {
			pos.lon = state.lon;
			pos.lat = state.lat;
		}
		var posX = long2tile(pos.lon, this.config.tilesZoom);
		var posY = lat2tile(pos.lat, this.config.tilesZoom);
		// return the values
		return {
			minX: minX,
			minY: minY,
			maxX: maxX,
			maxY: maxY,
			posX: posX,
			posY: posY,
		};
	}

	scoreMarkers() {
		var markers = this.config.guideData.markers;
		var lookup = {};
		var x, y, t, r, b, l;
		for (var idx = 0, max = markers.length; idx < max; idx += 1) {
			x = long2tile(markers[idx].lon, this.config.tilesZoom);
			y = lat2tile(markers[idx].lat, this.config.tilesZoom);
			// select coordinates around
			t = y - 1;
			r = x + 1;
			b = t + 1;
			l = x - 1;
			// top row
			lookup[l + "_" + t] = -10;
			lookup[x + "_" + t] = -10;
			lookup[r + "_" + t] = -10;
			// middle row
			lookup[l + "_" + y] = -10;
			lookup[x + "_" + y] = -20;
			lookup[r + "_" + y] = -10;
			// bottom row
			lookup[l + "_" + b] = -10;
			lookup[x + "_" + b] = -10;
			lookup[r + "_" + b] = -10;
		}
		return lookup;
	}

	loadTiles() {
		var container = this.config.container;
		var element = this.element;
		var coords = this.measureTiles();
		// calculate the size of the grid
		var gridWidth = Math.max(coords.maxX - coords.minX, 1);
		var gridHeight = Math.max(coords.maxY - coords.minY, 1);
		var tileSize = this.tilesSize;
		var croppedWidth = gridWidth * tileSize;
		var croppedHeight = gridHeight * tileSize;
		var displayWidth = croppedWidth / 2;
		var displayHeight = croppedHeight / 2;
		// set the size of the canvas to the correct size
		element.width = croppedWidth;
		element.height = croppedHeight;
		// double up the bitmap to retina size
		element.style.width = displayWidth + "px";
		element.style.height = displayHeight + "px";
		// create a queue of tiles
		this.tilesQueue = [];
		var scoreLookup = this.scoreMarkers();
		for (var x = coords.minX; x <= coords.maxX; x += 1) {
			for (var y = coords.minY; y <= coords.maxY; y += 1) {
				this.tilesQueue.push({
					url: this.config.tilesUrl.replace("{x}", x).replace("{y}", y).replace("{z}", this.config.tilesZoom),
					x: x - coords.minX,
					y: y - coords.minY,
					w: tileSize,
					h: tileSize,
					d: Math.abs(x - coords.posX) + Math.abs(y - coords.posY),
					r: scoreLookup[x + "_" + y] || 0,
				});
			}
		}
		// render the tiles closest to the centre first
		this.tilesQueue.sort(function (a, b) {
			return b.d + b.r - (a.d + a.r);
		});
		// load the first tile
		this.image = new Image();
		this.image.addEventListener("load", this.onTileLoaded.bind(this));
		this.image.addEventListener("error", this.onTileError.bind(this));
		this.image.setAttribute("src", this.tilesQueue[this.tilesQueue.length - 1].url);
		// redraw the component
		this.redraw();
		// resolve the promise
		this.onComplete();
	}

	drawTile(image) {
		// take the last item from the queue
		var props = this.tilesQueue.pop();
		// if an image was returned
		if (image) {
			// clone the image into the container
			var tile = image.cloneNode();
			tile.style.left = (props.x * props.w) / 2 + "px";
			tile.style.top = (props.y * props.h) / 2 + "px";
			tile.style.width = props.w / 2 + "px";
			tile.style.height = props.h / 2 + "px";
			tile.setAttribute("class", "localmap-tile");
			this.element.appendChild(tile);
		}
		// if there's more tiles in the queue
		if (this.tilesQueue.length > 0) {
			// load the next tile
			this.image.setAttribute("src", this.tilesQueue[this.tilesQueue.length - 1].url);
		}
	}

	onBitmapLoaded(evt) {
		// place the bitmap on the canvas
		this.drawBitmap();
	}

	onTileLoaded(evt) {
		// place the bitmap on the canvas
		this.drawTile(evt.target);
	}

	onTileError(evt) {
		this.drawTile(null);
	}
}
