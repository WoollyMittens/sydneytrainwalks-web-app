/*
	Source:
	van Creij, Maurice (2019). "useful.parkmap.js: An interactive map of the local area.", version 20190516, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// establish the class
var Localmap = function(config) {

  // PROPERTIES

  this.config = {
    'key': null,
    'alias': null,
    'container': null,
    'canvasWrapper': null,
    'canvasElement': null,
    'thumbsUrl': null,
    'photosUrl': null,
    'markersUrl': null,
    'guideUrl': null,
    'routeUrl': null,
    'mapUrl': null,
    'tilesUrl': null,
    'tilesZoom': 15,
    'exifUrl': null,
    'guideData': null,
    'routeData': null,
    'exifData': null,
    'creditsTemplate': null,
    'useTransitions': null,
		'minimum': {
			'lon': null,
			'lat': null,
			'lon_cover': null,
			'lat_cover': null,
			'zoom': null
		},
		'maximum': {
			'lon': null,
			'lat': null,
			'lon_cover': null,
			'lat_cover': null,
			'zoom': null
		},
		'position': {
			'lon': null,
			'lat': null,
			'zoom': null
		},
    'indicator': {
      'icon': null,
      'photo': null,
      'description': null,
      'lon': null,
			'lat': null,
			'zoom': null,
      'referrer': null
    }
  };

  for (var key in config)
    this.config[key] = config[key];

  // METHODS

  this.update = function() {
    // retard the save state
    clearTimeout(this.saveTimeout);
    this.saveTimeout = window.setTimeout(this.store.bind(this), 1000);
    // retard the update
		window.cancelAnimationFrame(this.animationFrame);
		this.animationFrame = window.requestAnimationFrame(this.redraw.bind(this));
  };

  this.redraw = function() {
    // update all components
    for (var key in this.components)
      if (this.components[key].update)
        this.components[key].update(this.config);
  };

  this.focus = function(lon, lat, zoom, smoothly) {
    // try to keep the focus within bounds
    this.config.useTransitions = smoothly;
    this.config.position.lon = Math.max(Math.min(lon, this.config.maximum.lon_cover), this.config.minimum.lon_cover);
    this.config.position.lat = Math.min(Math.max(lat, this.config.maximum.lat_cover), this.config.minimum.lat_cover);
    this.config.position.zoom = Math.max(Math.min(zoom, this.config.maximum.zoom), this.config.minimum.zoom);
    this.update();
  };

  this.store = function() {
    // create a save state selected properties
    var state = {};
    state[this.config.key] = {
      'lon': this.config.position.lon,
      'lat': this.config.position.lat,
      'zoom': this.config.position.zoom
    };
    // save the state to local storage
    localStorage.setItem('localmap', JSON.stringify(state));
  };

  this.restore = function(lon, lat, zoom) {
    // load the state from local storage
    var state = JSON.parse(localStorage.getItem('localmap'));
    // if the stored state applied to this instance of the map, restore the value
    var key = this.config.key;
    if (state && state[key]) { this.focus(state[key].lon, state[key].lat, state[key].zoom, false); }
    // otherwise restore the fallback
    else { this.focus(lon, lat, zoom, false); }
  };

  this.describe = function(markerdata) {
    // show a popup describing the markerdata
    this.components.modal.show(markerdata);
    // resolve any callback
    if (markerdata.callback) markerdata.callback(markerdata);
  };

  this.stop = function() {
    // remove each component
    for (var key in this.components)
      if (this.components[key].stop)
        this.components[key].stop(this.config);
  };

  this.indicate = function(input) {
    var canvas = this.components.canvas;
    var indicator = canvas.components.indicator;
    // reset the previous
    indicator.reset();
    // ask the indicator to indicate
    indicator.show(input);
    // cancel any associated events
    return false;
  };

  this.unindicate = function() {
    var canvas = this.components.canvas;
    var indicator = canvas.components.indicator;
    // reset the indicator
    indicator.hide();
    // cancel any associated events
    return false;
  };

  // EVENTS

  this.onComplete = function() {
    // remove the busy indicator
    this.config.container.className = this.config.container.className.replace(/ localmap-busy/g, '');
    // global update
    var max = this.config.maximum;
    var min = this.config.minimum;
    this.restore(
      (max.lon_cover - min.lon_cover) / 2 + min.lon_cover,
      (max.lat_cover - min.lat_cover) / 2 + min.lat_cover,
      min.zoom * 1.25
    );
  };

  // CLASSES

  this.config.container.className += ' localmap-busy';

  this.components = {
    canvas: new this.Canvas(this, this.onComplete.bind(this), this.describe.bind(this), this.focus.bind(this)),
    controls: new this.Controls(this),
    scale: new this.Scale(this),
    credits: new this.Credits(this),
    modal: new this.Modal(this),
    legend: new this.Legend(this, this.indicate.bind(this))
  };

};

// return as a require.js module
if (typeof define != 'undefined') define([], function() { return Localmap });
if (typeof module != 'undefined') module.exports = Localmap;

// extend the class
Localmap.prototype.Background = function (parent, onComplete) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = null;
	this.image = new Image();
	this.tilesQueue = null;
  this.resolution = (/android 5|android 6|android 7/i.test(navigator.userAgent)) ? 3072 : 4096;

	// METHODS

  // Slippy map tilenames - https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
  var long2tile = function long2tile(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
  var lat2tile = function lat2tile(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }
  var tile2long = function tile2long(x,z) { return (x/Math.pow(2,z)*360-180); }
  var tile2lat = function tile2lat(y,z) { var n=Math.PI-2*Math.PI*y/Math.pow(2,z); return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n)))); }

	this.start = function() {
		// create the canvas
		this.element = document.createElement('canvas');
		this.element.setAttribute('class', 'localmap-background');
		this.parent.element.appendChild(this.element);
    this.parent.canvasElement = this.element;
		// load the map as tiles
		if (this.config.tilesUrl) { this.loadTiles(); }
		// or load the map as a bitmap
		else { this.loadBitmap(); }
		// catch window resizes
		window.addEventListener('resize', this.redraw.bind(this));
	};

  this.stop = function() {
    // remove the element
    this.parent.element.removeChild(this.element);
  };

	this.update = function() {};

	this.redraw = function() {
		var container = this.config.container;
		var element = this.element;
		var min = this.config.minimum;
		var max = this.config.maximum;
		// calculate the limits
		min.zoom = Math.max(container.offsetWidth / element.width * 2, container.offsetHeight / element.height * 2);
		max.zoom = 3;
	};

	this.loadBitmap = function() {
		var key = this.config.alias || this.config.key;
		// load the map as a bitmap
		this.image.addEventListener('load', this.onBitmapLoaded.bind(this));
		this.image.setAttribute('src', this.config.mapUrl.replace('{key}', key));
	};

	this.drawBitmap = function() {
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
		element.width = croppedWidth;
		element.height = croppedHeight;
		// double up the bitmap to retina size
		element.style.width = displayWidth + 'px';
		element.style.height = displayHeight + 'px';
		// paste the image into the canvas
		element.getContext('2d').drawImage(image, offsetWidth, offsetHeight);
		// redraw the component
		this.redraw();
		// resolve the promise
		onComplete();
	};

	this.measureTiles = function() {
		var min = this.config.minimum;
		var max = this.config.maximum;
		var pos = this.config.position;
		// calculate the cols and rows of tiles
		var minX = long2tile(min.lon_cover, this.config.tilesZoom);
		var minY = lat2tile(min.lat_cover, this.config.tilesZoom);
		var maxX = long2tile(max.lon_cover, this.config.tilesZoom);
		var maxY = lat2tile(max.lat_cover, this.config.tilesZoom);
		// determine the centre tile
		var state = JSON.parse(localStorage.getItem('localmap'));
    var key = this.config.key;
    if (state && state[key]) { pos.lon = state[key].lon; pos.lat = state[key].lat; };
		var posX = long2tile(pos.lon, this.config.tilesZoom);
		var posY = lat2tile(pos.lat, this.config.tilesZoom);
		// return the values
		return {
			'minX': minX,
			'minY': minY,
			'maxX': maxX,
			'maxY': maxY,
			'posX': posX,
			'posY': posY
		};
	};

  this.scoreMarkers = function() {
    var markers = this.config.guideData[this.config.key].markers;
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
      lookup[l + '_' + t] = -10;
      lookup[x + '_' + t] = -10;
      lookup[r + '_' + t] = -10;
      // middle row
      lookup[l + '_' + y] = -10;
      lookup[x + '_' + y] = -20;
      lookup[r + '_' + y] = -10;
      // bottom row
      lookup[l + '_' + b] = -10;
      lookup[x + '_' + b] = -10;
      lookup[r + '_' + b] = -10;
    }
    return lookup;
  };

	this.loadTiles = function() {
		var container = this.config.container;
		var element = this.element;
		var coords = this.measureTiles();
		// calculate the size of the canvas, limit the dimensions to 4096x4096
    var gridWidth = Math.max(coords.maxX - coords.minX, 1);
    var gridHeight = Math.max(coords.maxY - coords.minY, 1);
    var tileSize = Math.min(this.resolution / gridWidth, this.resolution / gridHeight, 256);
		var croppedWidth = gridWidth * tileSize;
		var croppedHeight = gridHeight * tileSize;
		var displayWidth = croppedWidth / 2;
		var displayHeight = croppedHeight / 2;
		// set the size of the canvas to the correct size
		element.width = croppedWidth;
		element.height = croppedHeight;
		// double up the bitmap to retina size
		element.style.width = displayWidth + 'px';
		element.style.height = displayHeight + 'px';
		// create a queue of tiles
		this.tilesQueue = [];
    var scoreLookup = this.scoreMarkers();
		for (var x = coords.minX; x <= coords.maxX; x += 1) {
			for (var y = coords.minY; y <= coords.maxY; y += 1) {
				this.tilesQueue.push({
					url: this.config.tilesUrl.replace('{x}', x).replace('{y}', y).replace('{z}', this.config.tilesZoom),
					x: x - coords.minX,
					y: y - coords.minY,
          w: tileSize,
          h: tileSize,
					d: Math.abs(x - coords.posX) + Math.abs(y - coords.posY),
          r: scoreLookup[x + '_' + y] || 0
				});
			}
		}
		// render the tiles closest to the centre first
		this.tilesQueue.sort(function(a, b){return (b.d + b.r) - (a.d + a.r)});
		// load the first tile
		this.image = new Image();
		this.image.addEventListener('load', this.onTileLoaded.bind(this));
		this.image.addEventListener('error', this.onTileError.bind(this));
		this.image.setAttribute('src', this.tilesQueue[this.tilesQueue.length - 1].url);
		// redraw the component
		this.redraw();
		// resolve the promise
		onComplete();
	};

	this.drawTile = function(image) {
		var props = this.tilesQueue.pop();
		// draw the image onto the canvas
		if (image) this.element.getContext('2d').drawImage(image, props.x * props.w, props.y * props.h, props.w, props.h);
		// if there's more tiles in the queue
		if (this.tilesQueue.length > 0) {
			// load the next tile
			this.image.setAttribute('src', this.tilesQueue[this.tilesQueue.length - 1].url);
		}
	};

	// EVENTS

	this.onBitmapLoaded = function(evt) {
		// place the bitmap on the canvas
		this.drawBitmap();
	};

	this.onTileLoaded = function(evt) {
		// place the bitmap on the canvas
		this.drawTile(evt.target);
	};

	this.onTileError = function(evt) {
		this.drawTile(null);
	};

	this.start();

};

// extend the class
Localmap.prototype.Canvas = function (parent, onComplete, onMarkerClicked, onMapFocus) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = document.createElement('div');
	this.config.canvasWrapper = this.element;
  this.config.canvasElement = null;

	// METHODS

	this.start = function() {
		// create a canvas
		this.element.setAttribute('class', 'localmap-canvas');
		this.element.addEventListener('transitionend', this.onUpdated.bind(this));
		// add the canvas to the parent container
		this.config.container.appendChild(this.element);
		// start adding components in turn
		this.addMarkers();
	};

  this.stop = function() {
    // remove each sub-component
    for (var key in this.components)
      if (this.components[key].stop)
        this.components[key].stop(this.config);
    // remove the element
    this.config.container.removeChild(this.element);
  };

	this.update = function() {
		// redraw this component
		this.redraw();
		// update all sub-components
    for (var key in this.components)
      if (this.components[key].update)
        this.components[key].update(this.config);
	};

	this.redraw = function() {
		var container = this.config.container;
		var element = this.element;
		var min = this.config.minimum;
		var max = this.config.maximum;
		var pos = this.config.position;
		// convert the lon,lat to x,y
		var centerX = (pos.lon - min.lon_cover) / (max.lon_cover - min.lon_cover) * element.offsetWidth;
		var centerY = (pos.lat - min.lat_cover) / (max.lat_cover - min.lat_cover) * element.offsetHeight;
		// limit the zoom
		var zoom = Math.max(Math.min(pos.zoom, max.zoom), min.zoom);
		// convert the center into an offset
		var offsetX = -centerX * zoom + container.offsetWidth / 2;
		var offsetY = -centerY * zoom + container.offsetHeight / 2;
		// apply the limits
		offsetX = Math.max(Math.min(offsetX, 0), container.offsetWidth - element.offsetWidth * zoom);
		offsetY = Math.max(Math.min(offsetY, 0), container.offsetHeight - element.offsetHeight * zoom);
		// position the background
		if (this.config.useTransitions) this.element.className += ' localmap-canvas-transition';
		element.style.transform = 'translate3d(' + offsetX + 'px, ' + offsetY + 'px, 0px) scale3d(' + zoom + ', ' + zoom + ',1)';
	};

	// CLASSES

  this.components = {
		indicator: new parent.Indicator(this, onMarkerClicked, onMapFocus),
		location: new parent.Location(this)
  };

	// EVENTS

	this.addMarkers = function() {
		// add the markers to the canvas
		this.components.markers = new parent.Markers(this, onMarkerClicked, this.addBackground.bind(this));
	};

	this.addBackground = function() {
		// add the background to the canvas
		this.components.background = new parent.Background(this, this.addRoute.bind(this));
	};

	this.addRoute = function() {
		// add the route to the canvas
		this.components.route = new parent.Route(this, onComplete);
	};

	this.onUpdated = function(evt) {
		// remove the transition
		this.element.className = this.element.className.replace(/ localmap-canvas-transition/g, '');
	};

	this.start();

};

// extend the class
Localmap.prototype.Controls = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.touches = null;
	this.inertia = {x:0, y:0, z:0};
	this.elements = {};
	this.range = {};
	this.steps = {x:0.03, y:0.03, z:0.03};
	this.zoom = null;
	this.last = null;

	// METHODS

	this.start = function() {
		// add controls to the page
		this.element = document.createElement('nav');
		this.element.setAttribute('class', 'localmap-controls');
		this.config.container.appendChild(this.element);
		// add the zoom in button
		this.elements.zoomin = document.createElement('button');
		this.elements.zoomin.innerHTML = 'Zoom in';
		this.elements.zoomin.setAttribute('class', 'localmap-controls-zoomin');
		this.elements.zoomin.addEventListener('click', this.buttonInteraction.bind(this, 1.5));
		this.element.appendChild(this.elements.zoomin);
		// add the zoom out button
		this.elements.zoomout = document.createElement('button');
		this.elements.zoomout.innerHTML = 'Zoom out';
		this.elements.zoomout.setAttribute('class', 'localmap-controls-zoomout');
		this.elements.zoomout.addEventListener('click', this.buttonInteraction.bind(this, 0.667));
		this.element.appendChild(this.elements.zoomout);
	};

  this.stop = function() {
    // remove the element
    this.config.container.removeChild(this.element);
  };

	this.update = function() {
		// only redraw if the zoom has changed
		if (this.zoom !== this.config.position.zoom) {
			// check if the buttons are at their limits
			this.elements.zoomin.disabled = (this.config.position.zoom === this.config.maximum.zoom);
			this.elements.zoomout.disabled = (this.config.position.zoom === this.config.minimum.zoom);
		}
		// store the current zoom level
		this.zoom = this.config.position.zoom;
	};

	this.reposition = function(hasInertia, controlMethod) {
		// cancel any pending timeout
		window.cancelAnimationFrame(this.animationFrame);
		// move the map according to the inertia
		this.parent.focus(
			this.config.position.lon + this.range.lon * -this.inertia.x,
			this.config.position.lat + this.range.lat * -this.inertia.y,
			this.config.position.zoom + this.range.zoom * this.inertia.z,
			false
		);
		// if the inertia is above a certain level
		if (hasInertia && (Math.abs(this.inertia.x) > 0.001 || Math.abs(this.inertia.y) > 0.001 || Math.abs(this.inertia.z) > 0.001)) {
			// attenuate the inertia
			var decay = (controlMethod == 'touch') ? 0.7 : 0.9;
			this.inertia.x *= decay;
			this.inertia.y *= decay;
			this.inertia.z = 0;
			// continue monitoring
			this.animationFrame = window.requestAnimationFrame(this.reposition.bind(this, hasInertia, controlMethod));
		}
	};

	this.startInteraction = function(method, evt) {
		// reset inertial movement
		this.inertia.x = 0;
		this.inertia.y = 0;
		this.inertia.z = 0;
		// update the interpolation interval
		this.range.lon = this.config.maximum.lon_cover - this.config.minimum.lon_cover;
		this.range.lat = this.config.maximum.lat_cover - this.config.minimum.lat_cover;
		this.range.zoom = this.config.maximum.zoom - this.config.minimum.zoom;
		this.range.x = this.config.canvasWrapper.offsetWidth * this.config.position.zoom;
		this.range.y = this.config.canvasWrapper.offsetHeight * this.config.position.zoom;
		// store the initial touch(es)
		this.touches = evt.touches || [{ 'clientX': evt.clientX, 'clientY': evt.clientY }];
	};

	this.moveInteraction = function(method, evt) {
		evt.preventDefault();
		// retrieve the current and previous touches
		var touches = evt.touches || [{ 'clientX': evt.clientX, 'clientY': evt.clientY }];
		var previous = this.touches;
		// if there is interaction
		if (previous) {
			// cancel the double click
			this.last = new Date() - 500;
			// for multi touch
			if (touches.length > 1 && previous.length > 1) {
				var dX = (Math.abs(touches[0].clientX - touches[1].clientX) - Math.abs(previous[0].clientX - previous[1].clientX)) / this.config.container.offsetWidth;
				var dY = (Math.abs(touches[0].clientY - touches[1].clientY) - Math.abs(previous[0].clientY - previous[1].clientY)) / this.config.container.offsetHeight;
				this.inertia.x = ((touches[0].clientX - previous[0].clientX) + (touches[1].clientX - previous[1].clientX)) / 2 / this.range.x;
				this.inertia.y = ((touches[0].clientY - previous[0].clientY) + (touches[1].clientY - previous[1].clientY)) / 2 / this.range.y;
				this.inertia.z = (dX + dY) / 2;
			} else {
				this.inertia.x = (touches[0].clientX - previous[0].clientX) / this.range.x;
				this.inertia.y = (touches[0].clientY - previous[0].clientY) / this.range.y;
				this.inertia.z = 0;
			}
			// limit the innertia
			this.inertia.x = Math.max(Math.min(this.inertia.x, this.steps.x), -this.steps.x);
			this.inertia.y = Math.max(Math.min(this.inertia.y, this.steps.y), -this.steps.y);
			this.inertia.z *= this.config.position.zoom;
			// movement without inertia
			this.reposition(false, method);
			// store the touches
			this.touches = touches;
		}
	};

	this.endInteraction = function(method, evt) {
		// clear the interaction
		this.touches = null;
		// movement with inertia
		this.reposition(true, method);
	};

	this.buttonInteraction = function(factor, evt) {
		// cancel the double click
		this.last = new Date() - 500;
		// perform the zoom
		this.parent.focus(
			this.config.position.lon,
			this.config.position.lat,
			this.config.position.zoom * factor,
			true
		);
	};

	this.wheelInteraction = function(method, evt) {
		evt.preventDefault();
		// update the range
		this.range.lon = this.config.maximum.lon_cover - this.config.minimum.lon_cover;
		this.range.lat = this.config.maximum.lat_cover - this.config.minimum.lat_cover;
		this.range.zoom = this.config.maximum.zoom - this.config.minimum.zoom;
		// update the inertia
		this.inertia.z += (evt.deltaY > 0) ? this.steps.z : -this.steps.z;
		// movement with inertia
		this.reposition(true, method);
	};

	this.dblclickInteraction = function(method, evt) {
		// if the previous tap was short enough ago
		if (new Date() - this.last < 250) {
			// zoom in on the map
			this.parent.focus(
				this.config.position.lon,
				this.config.position.lat,
				this.config.position.zoom * 1.5,
				true
			);
		}
		// update the time since the last click
		this.last = new Date();
	};

	this.cancelInteraction = function(method, evt) {
		console.log('cancelInteraction');
	};

	// EVENTS

	this.config.container.addEventListener('mousedown', this.startInteraction.bind(this, 'mouse'));
	this.config.container.addEventListener('mousemove', this.moveInteraction.bind(this, 'mouse'));
	this.config.container.addEventListener('mouseup', this.endInteraction.bind(this, 'mouse'));
	this.config.container.addEventListener('wheel', this.wheelInteraction.bind(this, 'mouse'));
	this.config.container.addEventListener('click', this.dblclickInteraction.bind(this, 'mouse'));

	this.config.container.addEventListener('touchstart', this.startInteraction.bind(this, 'touch'));
	this.config.container.addEventListener('touchmove', this.moveInteraction.bind(this, 'touch'));
	this.config.container.addEventListener('touchend', this.endInteraction.bind(this, 'touch'));
	this.config.container.addEventListener('touchcancel', this.cancelInteraction.bind(this, 'touch'));

	this.start();

};

// extend the class
Localmap.prototype.Credits = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = null;

	// METHODS

	this.start = function() {
		this.element = document.createElement('figcaption');
		this.element.setAttribute('class', 'localmap-credits');
		this.element.innerHTML = this.config.creditsTemplate;
		this.config.container.appendChild(this.element);
	};

  this.stop = function() {
    // remove the element
    this.config.container.removeChild(this.element);
  };

	this.update = function() {};

	// EVENTS

	this.start();

};

// extend the class
Localmap.prototype.Indicator = function (parent, onMarkerClicked, onMapFocus) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = new Image();
	this.zoom = null;
	this.lon = null;
	this.lat = null;

	// METHODS

	this.start = function() {
		// create the indicator
		this.element.setAttribute('src', this.config.markersUrl.replace('{type}', 'focus'));
		this.element.setAttribute('alt', '');
		this.element.setAttribute('class', 'localmap-indicator');
		// get marker data from API call
		this.element.addEventListener('click', this.onIndicatorClicked.bind(this));
		this.parent.element.appendChild(this.element);
	};

  this.stop = function() {
    // remove the element
    this.parent.element.removeChild(this.element);
  };

	this.update = function() {
		// only resize if the zoom has changed
		if (this.zoom !== this.config.position.zoom) this.resize();
		// only reposition if the content has changed
		if (this.lon !== this.config.indicator.lon  && this.lat !== this.config.indicator.lat) this.reposition();
		// store the current zoom level
		this.zoom = this.config.position.zoom;
	};

	this.show = function(input) {
		// handle the event if this was used as one
    if (input.target) input = input.target;
    // gather the parameters from diverse input
    if (!input.getAttribute) input.getAttribute = function(attr) { return input[attr]; };
    if (!input.setAttribute) input.setAttribute = function(attr, value) { input[attr] = value; };
    var source = input.getAttribute('data-url') || input.getAttribute('src') || input.getAttribute('href') || input.getAttribute('photo');
    var description = input.getAttribute('data-title') || input.getAttribute('title') || input.getAttribute('description') || input.innerHTML;
    var lon = input.getAttribute('data-lon') || input.getAttribute('lon');
    var lat = input.getAttribute('data-lat') || input.getAttribute('lat');
    // try to get the coordinates from the cached exif data
		var key = this.config.alias || this.config.key;
    var filename = (source) ? source.split('/').pop() : null;
    var cached = (this.config.exifData && this.config.exifData[key]) ? this.config.exifData[key][filename] : {};
    // populate the indicator's model
    this.config.indicator = {
      'photo': filename,
      'description': description,
      'lon': lon || cached.lon,
      'lat': lat || cached.lat,
			'zoom': this.config.maximum.zoom,
      'referrer': input.referrer || input
    };
    // if the coordinates are known
    if (this.config.indicator.lon && this.config.indicator.lat) {
      // display the indicator immediately
      this.onIndicateSuccess();
    } else {
      // try to retrieve them from the photo
      var guideXhr = new XMLHttpRequest();
      guideXhr.addEventListener('load', this.onExifLoaded.bind(this));
      guideXhr.open('GET', this.config.exifUrl.replace('{src}', source), true);
      guideXhr.send();
    }
	};

	this.reset = function() {
		// de-activate the originating element
    if (this.config.indicator.referrer) this.config.indicator.referrer.setAttribute('data-localmap', 'passive');
    // clear the indicator
    this.config.indicator = { 'icon': null, 'photo': null, 'description': null, 'lon': null, 'lat': null, 'zoom': null, 'origin': null };
	};

	this.hide = function() {
		// reset the indicator object
		this.reset();
    // zoom out a little
    onMapFocus(this.config.position.lon, this.config.position.lat, this.config.position.zoom * 0.25, true);
	};

	this.resize = function() {
		// resize the marker according to scale
		var scale = 1 / this.config.position.zoom;
		this.element.style.transform = 'scale3d(' + scale + ', ' + scale + ', 1)';
	};

	this.reposition = function() {
		var min = this.config.minimum;
		var max = this.config.maximum;
		var lon = this.config.indicator.lon;
		var lat = this.config.indicator.lat;
		// if the location is within bounds
		if (lon > min.lon_cover && lon < max.lon_cover && lat < min.lat_cover && lat > max.lat_cover) {
			// store the new position
			this.lon = lon;
			this.lat = lat;
			// display the marker
			this.element.style.cursor = (this.config.indicator.description) ? 'pointer' : 'default';
			this.element.style.display = 'block';
			this.element.style.left = ((lon - min.lon_cover) / (max.lon_cover - min.lon_cover) * 100) + '%';
			this.element.style.top = ((lat - min.lat_cover) / (max.lat_cover - min.lat_cover) * 100) + '%';
		// otherwise
		} else {
			// hide the marker
			this.lon = null;
			this.lat = null;
			this.element.style.display = 'none';
		}
	};

	// EVENTS

	this.onExifLoaded = function(result) {
    var exif = JSON.parse(result.target.response);
    var deg, min, sec, ref, coords = {};
    // if the exif data contains GPS information
    if (exif && exif.GPS) {
      // convert the lon into a usable format
      deg = parseInt(exif.GPS.GPSLongitude[0]);
      min = parseInt(exif.GPS.GPSLongitude[1]);
      sec = parseInt(exif.GPS.GPSLongitude[2]) / 100;
      ref = exif.GPS.GPSLongitudeRef;
      this.config.indicator.lon = (deg + min / 60 + sec / 3600) * (ref === "W" ? -1 : 1);
      // convert the lat into a usable format
      deg = parseInt(exif.GPS.GPSLatitude[0]);
      min = parseInt(exif.GPS.GPSLatitude[1]);
      sec = parseInt(exif.GPS.GPSLatitude[2]) / 100;
      ref = exif.GPS.GPSLatitudeRef;
      this.config.indicator.lat = (deg + min / 60 + sec / 3600) * (ref === "N" ? 1 : -1);
      // return the result
      this.onIndicateSuccess();
    }
  };

  this.onIndicateSuccess = function() {
    // activate the originating element
    this.config.indicator.referrer.setAttribute('data-localmap', 'active');
    // highlight a location with an optional description on the map
    onMapFocus(this.config.indicator.lon, this.config.indicator.lat, this.config.indicator.zoom, true);
  };

	this.onIndicatorClicked = function(evt) {
		evt.preventDefault();
		// report that the indicator was clicked
		onMarkerClicked(this.config.indicator);
	};

	this.start();

};

// extend the class
Localmap.prototype.Legend = function (parent, onLegendClicked) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.elements = [];

	// METHODS

	this.start = function() {};

  this.stop = function() {
    // remove the element
    if (this.config.legend) this.config.legend.innerHTML = '';
  };

	this.update = function() {
		var key = this.config.key;
		var guideData = this.config.guideData[key];
    // write the legend if needed and available
    if (this.config.legend && this.elements.length === 0){
			this.elements = guideData.markers.map(this.addDefinition.bind(this));
		}
  };

  this.addDefinition = function(markerData) {
    var definitionData = {};
    // if the marker has a description
    if (markerData.description) {
      // format the path to the external assets
			var key = this.config.alias || this.config.key;
      var image = (markerData.photo) ? this.config.thumbsUrl.replace('{key}', key) + markerData.photo : this.config.markersUrl.replace('{type}', markerData.type);
      var text = markerData.description || markerData.type;
      // create a container for the elements
      var fragment = document.createDocumentFragment();
      // add the title
      definitionData.title = document.createElement('dt');
      definitionData.title.className += (markerData.photo) ? ' localmap-legend-photo' : ' localmap-legend-icon';
      definitionData.title.innerHTML = '<img alt="' + markerData.type + '" src="' + image + '"/>';
      definitionData.title.style.backgroundImage = 'url("' + image + '")';
      fragment.appendChild(definitionData.title);
      // add the description
      definitionData.description = document.createElement('dd');
      definitionData.description.className += (markerData.optional || markerData.detour || markerData.warning) ? ' localmap-legend-alternate' : '';
      definitionData.description.innerHTML = '<p>' + text + '</p>';
      fragment.appendChild(definitionData.description);
      // add the event handlers
			markerData.referrer = definitionData.title;
      definitionData.title.addEventListener('click', onLegendClicked.bind(this, markerData));
      definitionData.description.addEventListener('click', onLegendClicked.bind(this, markerData));
      // add the container to the legend
      this.config.legend.appendChild(fragment);
    }
    // return the objects
    return definitionData;
  };

	// EVENTS

	this.start();

};

// extend the class
Localmap.prototype.Location = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = new Image();
	this.zoom = null;
	this.active = false;
	this.options = {
		enableHighAccuracy: true
	};

	// METHODS

	this.start = function() {
		if ("geolocation" in navigator) {
			// display a button to activate geolocation
			this.permissions = document.createElement('nav');
			this.permissions.setAttribute('class', 'localmap-permissions');
			this.button = document.createElement('button');
			this.button.setAttribute('title', 'Allow geolocation');
			this.button.innerHTML = 'Allow geolocation';
			this.button.setAttribute('class', 'localmap-permissions-location');
			this.permissions.appendChild(this.button);
			this.config.container.appendChild(this.permissions);
			// activate geolocation upon interaction
			this.button.addEventListener('click', this.requestPosition.bind(this));
			this.config.container.addEventListener('mouseup', this.requestPosition.bind(this));
			this.config.container.addEventListener('touchend', this.requestPosition.bind(this));
			// try activating geolocation automatically
			this.requestPosition();
		}
	};

  this.stop = function() {
    // remove the element
    this.config.container.removeChild(this.permissions);
  };

	this.update = function() {
		// only resize if the zoom has changed
		if (this.zoom !== this.config.position.zoom) this.resize();
		// store the current zoom level
		this.zoom = this.config.position.zoom;
	};

	this.resize = function() {
		// resize the marker according to scale
		var scale = 1 / this.config.position.zoom;
		this.element.style.transform = 'scale3d(' + scale + ', ' + scale + ', 1)';
	};

	this.requestPosition = function() {
		if (!this.active) {
			// request location updates
			this.locator = navigator.geolocation.watchPosition(
				this.onReposition.bind(this),
				this.onPositionFailed.bind(this),
				this.options
			);
			// create the indicator
			this.element.setAttribute('src', this.config.markersUrl.replace('{type}', 'location'));
			this.element.setAttribute('alt', '');
			this.element.setAttribute('class', 'localmap-location');
			this.parent.element.appendChild(this.element);
			// hide the button
			this.button.style.display = 'none';
		}
	};

	// EVENTS

	this.onReposition = function(position) {
		var min = this.config.minimum;
		var max = this.config.maximum;
		var lon = position.coords.longitude;
		var lat = position.coords.latitude;
		// if the location is within bounds
		if (lon > min.lon_cover && lon < max.lon_cover && lat < min.lat_cover && lat > max.lat_cover) {
			// display the marker
			this.element.style.display = 'block';
			this.element.style.left = ((lon - min.lon_cover) / (max.lon_cover - min.lon_cover) * 100) + '%';
			this.element.style.top = ((lat - min.lat_cover) / (max.lat_cover - min.lat_cover) * 100) + '%';
		// otherwise
		} else {
			// hide the marker
			this.element.style.display = 'none';
		}
	};

	this.onPositionFailed = function(error) {
		console.log('requestPosition:', error);
	};

	this.start();

};

// extend the class
Localmap.prototype.Markers = function (parent, onClicked, onComplete) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.elements = [];
	this.zoom = null;
	this.delay = null;

	// METHODS

	this.start = function() {
		var key = this.config.key;
		// if cached data is available
		if (this.config.guideData && this.config.guideData[key]) {
			// add the markers from the guide
			this.addGuide();
		// otherwise
		} else {
			// load the guide's JSON first
			var guideXhr = new XMLHttpRequest();
			guideXhr.addEventListener('load', this.onGuideLoaded.bind(this));
			guideXhr.open('GET', this.config.guideUrl.replace('{key}', this.config.key), true);
			guideXhr.send();
		}
	};

  this.stop = function() {
    // TODO: remove the elements
  };

	this.update = function() {
		// defer redraw until idle
		if (this.config.position.zoom !== this.zoom) {
			clearTimeout(this.delay);
			this.delay = setTimeout(this.redraw.bind(this), 100);
		}
		// store the current zoom level
		this.zoom = this.config.position.zoom;
	};

	this.redraw = function() {
		// redraw the markers according to scale
		var scale = 1 / this.config.position.zoom;
		for (var key in this.elements) {
			this.elements[key].style.transform = 'scale3d(' + scale + ', ' + scale + ', 1)'
		}
	};

	this.addGuide = function() {
		var config = this.config;
		var key = this.config.key;
		var guideData = this.config.guideData[key];
		// store the key
		config.alias = (guideData.alias) ? guideData.alias.key : guideData.key;
		// store the interpolation limits
		var min = config.minimum;
		var max = config.maximum;
		min.lon = (guideData.alias) ? guideData.alias.bounds.west : guideData.bounds.west;
		min.lat = (guideData.alias) ? guideData.alias.bounds.north : guideData.bounds.north;
		max.lon = (guideData.alias) ? guideData.alias.bounds.east : guideData.bounds.east;
		max.lat = (guideData.alias) ? guideData.alias.bounds.south : guideData.bounds.south;
    // store the coverage limits
		min.lon_cover = guideData.bounds.west;
		min.lat_cover = guideData.bounds.north;
		max.lon_cover = guideData.bounds.east;
		max.lat_cover = guideData.bounds.south;
		// assume an initial position
		var pos = config.position;
		pos.lon = (max.lon_cover - min.lon_cover) / 2 + min.lon_cover;
		pos.lat = (max.lat_cover - min.lat_cover) / 2 + min.lat_cover;
		// position every marker in the guide
		guideData.markers.map(this.addMarker.bind(this));
		// resolve completion
		onComplete();
	};

	this.addMarker = function(markerData) {
		// add either a landmark or a waypoint to the map
		markerData.element = (markerData.photo) ? this.addLandmark(markerData) : this.addWaypoint(markerData);
		markerData.element.addEventListener('click', onClicked.bind(this, markerData));
		this.parent.element.appendChild(markerData.element);
		this.elements.push(markerData.element);
	}

	this.addLandmark = function(markerData) {
		var min = this.config.minimum;
		var max = this.config.maximum;
		var element = document.createElement('span');
		element.setAttribute('class', 'localmap-waypoint');
		element.style.left = ((markerData.lon - min.lon_cover) / (max.lon_cover - min.lon_cover) * 100) + '%';
		element.style.top = ((markerData.lat - min.lat_cover) / (max.lat_cover - min.lat_cover) * 100) + '%';
		element.style.cursor = 'pointer';
		return element;
	};

	this.addWaypoint = function(markerData) {
		var min = this.config.minimum;
		var max = this.config.maximum;
		var element = new Image();
		element.setAttribute('src', this.config.markersUrl.replace('{type}', markerData.type));
		element.setAttribute('title', markerData.description || '');
		element.setAttribute('class', 'localmap-marker');
		element.style.left = ((markerData.lon - min.lon_cover) / (max.lon_cover - min.lon_cover) * 100) + '%';
		element.style.top = ((markerData.lat - min.lat_cover) / (max.lat_cover - min.lat_cover) * 100) + '%';
		element.style.cursor = (markerData.description || markerData.callback) ? 'pointer' : null;
		return element;
	};

	// EVENTS

	this.onGuideLoaded = function(evt) {
		// decode the guide data
		this.config.guideData = this.config.guideData || {};
		this.config.guideData[this.config.key] = JSON.parse(evt.target.response);
		// add the markers from the guide
		this.addGuide();
	};

	this.start();

};

// extend the class
Localmap.prototype.Modal = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = null;

	// METHODS

	this.start = function() {
		// create the modal
		this.element = document.createElement('section');
		this.element.setAttribute('class', 'localmap-modal localmap-modal-hidden');
		// add the photo
		this.photo = document.createElement('figure');
		this.photo.setAttribute('class', 'localmap-modal-photo');
		this.element.appendChild(this.photo);
		// add the content area
		this.description = document.createElement('article');
		this.description.setAttribute('class', 'localmap-modal-content');
		this.element.appendChild(this.description);
		// add a close button
		this.closer = document.createElement('button');
		this.closer.setAttribute('class', 'localmap-modal-closer');
		this.closer.innerHTML = 'Close';
		this.closer.addEventListener('click', this.onDismiss.bind(this));
		this.element.appendChild(this.closer);
		// insert the modal
		this.config.container.appendChild(this.element);
	};

  this.stop = function() {
    // remove the element
    this.config.container.removeChild(this.element);
  };

	this.update = function() {};

	this.show = function(markerData) {
		var key = this.config.alias || this.config.key;
		// display the photo if available
		if (markerData.photo) {
			this.photo.style.backgroundImage = 'url(' + this.config.photosUrl.replace('{key}', key) + markerData.photo + '), url(' + this.config.thumbsUrl.replace('{key}', key) + markerData.photo + ')';
      this.photo.className = 'localmap-modal-photo';
		} else {
			this.photo.style.backgroundImage = 'url(' + this.config.markersUrl.replace('{type}', markerData.type) + ')';
      this.photo.className = 'localmap-modal-icon';
		}
		// display the content if available
		if (markerData.description) {
			this.description.innerHTML = '<p>' + markerData.description + '</p>';
		} else {
			return false;
		}
		// show the modal
		this.element.className = this.element.className.replace(/-hidden/g, '-visible');
	};

	// EVENTS

	this.onDismiss = function(evt) {
		evt.preventDefault();
		// hide the modal
		this.element.className = this.element.className.replace(/-visible/g, '-hidden');
	};

	this.start();

};

// extend the class
Localmap.prototype.Route = function (parent, onComplete) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = null;
	this.coordinates = [];
	this.zoom = null;
	this.delay = null;

	// METHODS

	this.start = function() {
		var key = this.config.key;
		// create a canvas
		this.element = document.createElement('canvas');
		this.element.setAttribute('class', 'localmap-route')
		this.parent.element.appendChild(this.element);
		// use the JSON immediately
		if (this.config.routeData && this.config.routeData[key]) {
			this.onJsonLoaded(this.config.routeData[key]);
		}
		// or load the route's GPX first
		else {
			var routeXhr = new XMLHttpRequest();
			routeXhr.addEventListener('load', this.onGpxLoaded.bind(this));
			routeXhr.open('GET', this.config.routeUrl.replace('{key}', key), true);
			routeXhr.send();
		}
	};

  this.stop = function() {
    // remove the element
    this.parent.element.removeChild(this.element);
  };

	this.update = function() {
		// defer redraw until idle
		if (this.config.position.zoom !== this.zoom) {
			clearTimeout(this.delay);
			this.delay = setTimeout(this.redraw.bind(this), 100);
		}
		// store the current zoom level
		this.zoom = this.config.position.zoom;
	};

	this.redraw = function() {
		var min = this.config.minimum;
		var max = this.config.maximum;
		// adjust the height of the canvas
		this.element.width = this.parent.element.offsetWidth;
		this.element.height = this.parent.element.offsetHeight;
		// position every trackpoint in the route
		var ctx = this.element.getContext('2d');
		// (re)draw the route
		var x0, y0, x1, y1, z = this.config.position.zoom, w = this.element.width, h = this.element.height;
		ctx.clearRect(0, 0, w, h);
		ctx.lineWidth = 4 / z;
		ctx.strokeStyle = 'orange';
		ctx.beginPath();
		for (var key in this.coordinates) {
			if (this.coordinates.hasOwnProperty(key) && key % 1 == 0) {
        // calculate the current step
				x1 = parseInt((this.coordinates[key][0] - min.lon_cover) / (max.lon_cover - min.lon_cover) * w);
				y1 = parseInt((this.coordinates[key][1] - min.lat_cover) / (max.lat_cover - min.lat_cover) * h);
        // if the step seems valid, draw the step
  			if ((Math.abs(x1 - x0) + Math.abs(y1 - y0)) < 30) { ctx.lineTo(x1, y1); }
        // or jump unlikely/erroneous steps
        else { ctx.moveTo(x1, y1); }
        // store current step as the previous step
        x0 = x1;
        y0 = y1;
			}
		}
		ctx.stroke();
	};

	// EVENTS

	this.onJsonLoaded = function (geojson) {
		// convert JSON into an array of coordinates
		var features = geojson.features, segments = [], coordinates;
		for (var a = 0, b = features.length; a < b; a += 1) {
			if (features[a].geometry.coordinates[0][0] instanceof Array) {
				coordinates = [].concat.apply([], features[a].geometry.coordinates);
			} else {
				coordinates = features[a].geometry.coordinates;
			}
			segments.push(coordinates);
		}
		this.coordinates = [].concat.apply([], segments);
    // redraw
    this.redraw();
		// resolve completion
		onComplete();
	};

	this.onGpxLoaded = function(evt) {
		// convert GPX into an array of coordinates
		var gpx = evt.target.responseXML;
		var trackpoints = gpx.querySelectorAll('trkpt,rtept');
		for (var key in trackpoints) {
			if (trackpoints.hasOwnProperty(key) && key % 1 == 0) {
				this.coordinates.push([parseFloat(trackpoints[key].getAttribute('lon')), parseFloat(trackpoints[key].getAttribute('lat')), null]);
			}
		}
    // redraw
    this.redraw();
		// resolve completion
		onComplete();
	};

	this.start();

};

// extend the class
Localmap.prototype.Scale = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = document.createElement('div');
	this.zoom = null;
	this.delay = null;

	// METHODS

	this.start = function() {
		// add the scale to the interface
		this.element.setAttribute('class', 'localmap-scale');
		this.config.container.appendChild(this.element);
	};

  this.stop = function() {
    // remove the element
    this.config.container.removeChild(this.element);
  };

	this.update = function() {
		// defer redraw until idle
		if (this.config.position.zoom !== this.zoom) {
			clearTimeout(this.delay);
			this.delay = setTimeout(this.redraw.bind(this), 10);
		}
		// store the current zoom level
		this.zoom = this.config.position.zoom;
	};

	this.redraw = function() {
		// how big is the map in kilometres along the bottom
		var mapSize = this.distance(
			{'lon': this.config.minimum.lon_cover, 'lat': this.config.maximum.lat_cover},
			{'lon': this.config.maximum.lon_cover, 'lat': this.config.maximum.lat_cover}
		);
		// what portion of that is in the container
		var visible = this.config.container.offsetWidth / this.config.canvasWrapper.offsetWidth / this.config.position.zoom;
		// use a fraction of that as the scale
		var scaleSize = visible * mapSize / 6;
		// round to the nearest increment
		var scale = 100, label = '100km';
		if (scaleSize < 50) { scale = 50; label = '50km' }
		if (scaleSize < 20) { scale = 20; label = '20km' }
		if (scaleSize < 10) { scale = 10; label = '10km' }
		if (scaleSize < 5) { scale = 5; label = '5km' }
		if (scaleSize < 2) { scale = 2; label = '2km' }
		if (scaleSize < 1) { scale = 1; label = '1km' }
		if (scaleSize < 0.5) { scale = 0.5; label = '500m' }
		if (scaleSize < 0.2) { scale = 0.2; label = '200m' }
		if (scaleSize < 0.1) { scale = 0.1; label = '100m' }
		// size the scale to the increment
		this.element.style.width = (scale / visible / mapSize * 100) + '%';
		// fill the scale with the increment
		this.element.innerHTML = label;
	};

	this.distance = function(A, B) {
		var lonA = Math.PI * A.lon / 180;
		var lonB = Math.PI * B.lon / 180;
		var latA = Math.PI * A.lat / 180;
		var latB = Math.PI * B.lat / 180;
		var x = (lonA - lonB) * Math.cos((latA + latB)/2);
		var y = latA - latB;
		var d = Math.sqrt(x*x + y*y) * 6371;
		return d;
	};

	// EVENTS

	this.start();

};
