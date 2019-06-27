/*
	Source:
	van Creij, Maurice (2018). "filters.js: Sorting and filtering a list of options.", http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// establish the class
// extend the global object
var Filters = function (config) {

	// PROPERTIES

	this.element = null;
	this.promise = null;
	this.input = null;
	this.select = null;
	this.delay = null;

	// METHODS

	this.init = function (config) {
		// store the configuration
		this.element = config.element;
		this.promise = config.promise || function () {};
		// get the sorter elements
		this.input = this.element.getElementsByTagName('input')[0];
		this.select = this.element.getElementsByTagName('select')[0];
		this.sorters = this.select.getElementsByTagName('option');
		// add the event listener for the input
		this.input.addEventListener('blur', this.onSearchChanged());
		this.input.addEventListener('keyup', this.onSearchChanged());
		this.input.addEventListener('change', this.onSearchChanged());
		// add the event listener for the select
		this.select.addEventListener('change', this.onSorterSelected());
		// add the event listener for the form
		this.element.addEventListener('submit', this.onSearchSubmit());
		// add the reset button to browsers that need it
		if (!/MSIE/i.test(navigator.userAgent)) { this.input.addEventListener('click', this.onSearchReset()); }
		else { this.input.style.backgroundImage = 'none'; }
		// return the object
		return this;
	};

	this.redraw = function (index) {
		// update the drop down
		this.select.selectedIndex = index;
	};

	this.searchFor = function (keyword) {
		var a, b, contents,
			sortees = document.querySelectorAll( this.element.getAttribute('data-target') ),
			findTags = new RegExp('<[^>]*>', 'g'),
			findKeyword = new RegExp(keyword, 'i');
		// for all elements
		for (a = 0, b = sortees.length; a < b; a += 1) {
			// clear the contents of the sortee
			contents = sortees[a].innerHTML.replace(findTags, ' ');
			// show or hide the elements based on the keyword
			sortees[a].style.display = (findKeyword.test(contents)) ? 'block' : 'none';
		}
		// trigger the promise
		this.promise();
	};

	this.sortBy = function (index) {
		var a, b, unsorted = [],
			sorted = [],
			source = this.sorters[index].getAttribute('data-source'),
			method = this.sorters[index].getAttribute('data-type'),
			sortees = document.querySelectorAll( this.element.getAttribute('data-target') ),
			parent = sortees[0].parentNode,
			fragment = document.createDocumentFragment();
		// get the sortee elements
		for (a = 0, b = sortees.length; a < b; a += 1) { unsorted.push(sortees[a]); }
		// sort the elements
		sorted = unsorted.sort(function (a, b) {
			// get the source value
			a = a.querySelector(source).innerHTML;
			b = b.querySelector(source).innerHTML;
			// process the source value
			if (method === 'number') {
				a = parseFloat(a);
				b = parseFloat(b);
			}
			// compare the values
			return (a < b) ? -1 : 1;
		});
		// clone the sorted elements into the document fragment
		for (a = 0, b = sorted.length; a < b; a += 1) { fragment.appendChild( parent.removeChild(sorted[a], true) ); }
		parent.appendChild(fragment);
		// redraw the interface element
		this.redraw(index);
		// trigger the promise
		this.promise();
	};

	// EVENTS

	this.onSearchSubmit = function () {
		var _this = this;
		return function (evt) {
			// cancel the submit
			evt.preventDefault();
			// search manually instead
			_this.searchFor(_this.input.value.trim());
			// deselect the field
			_this.input.blur();
		};
	};

	this.onSearchReset = function () {
		var _this = this;
		return function (evt) {
			// if the  right side of the element is clicked
			if (_this.input.offsetWidth - evt.layerX < 32) {
				// cancel the click
				evt.preventDefault();
				// reset the search
				_this.input.blur();
				_this.input.value = '';
				_this.searchFor('');
			}
		};
	};

	this.onSearchChanged = function () {
		var _this = this;
		return function (evt) {
			// wait for the typing to pause
			clearTimeout(_this.delay);
			_this.delay = setTimeout(function () {
				// perform the search
				_this.searchFor(_this.input.value.trim());
			}, 700);
		};
	};

	this.onSorterSelected = function () {
		var _this = this;
		return function (evt) {
			// cancel the click
			evt.preventDefault();
			// sort the sortees by the selected sorter
			_this.sortBy(_this.select.selectedIndex);
		};
	};

	this.init(config);

};

// return as a require.js module
if (typeof define != 'undefined') define([], function () { return Filters });
if (typeof module != 'undefined') module.exports = Filters;

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
    'container': null,
    'canvasElement': null,
    'assetsUrl': null,
    'markersUrl': null,
    'guideUrl': null,
    'routeUrl': null,
    'mapUrl': null,
    'exifUrl': null,
    'guideData': null,
    'routeData': null,
    'exifData': null,
    'creditsTemplate': null,
    'useTransitions': null,
		'minimum': {
			'lon': null,
			'lat': null,
			'zoom': null
		},
		'maximum': {
			'lon': null,
			'lat': null,
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
    this.config.position.lon = Math.max(Math.min(lon, this.config.maximum.lon), this.config.minimum.lon);
    this.config.position.lat = Math.min(Math.max(lat, this.config.maximum.lat), this.config.minimum.lat);
    this.config.position.zoom = Math.max(Math.min(zoom, this.config.maximum.zoom), this.config.minimum.zoom);
    this.update();
  };

  this.describe = function(markerdata) {
    // show a popup describing the markerdata
    this.components.modal.show(markerdata);
  };

  this.stop = function() {
    // release the container
    this.container.innerHTML = '';
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

  // CLASSES

  this.components = {
    canvas: new this.Canvas(this, this.update.bind(this), this.describe.bind(this), this.focus.bind(this)),
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
	this.element = new Image();
	this.onComplete = onComplete;

	// METHODS

	this.start = function() {
		// load the map
		this.element.addEventListener('load', this.onBackgroundLoaded.bind(this));
		this.element.setAttribute('class', 'localmap-background');
		this.element.setAttribute('src', this.config.mapUrl);
	};

	this.update = function() {};

	this.redraw = function() {
		var container = this.config.container;
		var element = this.element;
		var min = this.config.minimum;
		var max = this.config.maximum;
		// calculate the center
		var centerX = (container.offsetWidth - element.naturalWidth * min.zoom) / 2;
		var centerY = (container.offsetHeight - element.naturalHeight * min.zoom) / 2;
		// store the initial position
		this.config.position.lon = (min.lon + max.lon) / 2;
		this.config.position.lat = (min.lat + max.lat) / 2;
		this.config.position.zoom = min.zoom;
		// position the canvas
		this.parent.element.style.transform = 'translate(' + centerX + 'px, ' + centerY + 'px) scale(' + min.zoom + ')';
		// insert the image into the canvas
		this.parent.element.appendChild(this.element);
	};

	// EVENTS

	this.onBackgroundLoaded = function(evt) {
		var container = this.config.container;
		var min = this.config.minimum;
		var max = this.config.maximum;
		// extract the interpolation limits
		min.zoom = Math.max(container.offsetWidth / this.element.naturalWidth, container.offsetHeight / this.element.naturalHeight);
		max.zoom = 1;
		// center the background
		this.redraw();
		// resolve the promise
		onComplete();
	};

	this.start();

};

// extend the class
Localmap.prototype.Canvas = function (parent, onBackgroundComplete, onMarkerClicked, onMapFocus) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = document.createElement('div');
	this.config.canvasElement = this.element;

	// METHODS

	this.start = function() {
		// create a canvas
		this.element.setAttribute('class', 'localmap-canvas');
		this.element.addEventListener('transitionend', this.onUpdated.bind(this));
		// add the canvas to the parent container
		this.config.container.appendChild(this.element);
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
		var centerX = (pos.lon - min.lon) / (max.lon - min.lon) * element.offsetWidth;
		var centerY = (pos.lat - min.lat) / (max.lat - min.lat) * element.offsetHeight;
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
		element.style.transform = 'translate(' + offsetX + 'px, ' + offsetY + 'px) scale(' + zoom + ')';
	};

	// CLASSES

  this.components = {
		background: new parent.Background(this, onBackgroundComplete),
		markers: new parent.Markers(this, onMarkerClicked),
		indicator: new parent.Indicator(this, onMarkerClicked, onMapFocus),
		route: new parent.Route(this),
		location: new parent.Location(this)
  };

	// EVENTS

	this.onUpdated = function (evt) {
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
		this.elements.zoomin.addEventListener('click', this.onZoomIn.bind(this));
		this.element.appendChild(this.elements.zoomin);
		// add the zoom out button
		this.elements.zoomout = document.createElement('button');
		this.elements.zoomout.innerHTML = 'Zoom out';
		this.elements.zoomout.setAttribute('class', 'localmap-controls-zoomout');
		this.elements.zoomout.addEventListener('click', this.onZoomOut.bind(this));
		this.element.appendChild(this.elements.zoomout);
	};

	// TODO: buttons to incrementally zoom in, zoom out, move north, move south, move east, move west.

	this.update = function() {};

	this.coasting = function() {
		// move the map according to the inertia
		this.parent.focus(
			this.config.position.lon + (this.config.maximum.lon - this.config.minimum.lon) * -this.inertia.x,
			this.config.position.lat + (this.config.maximum.lat - this.config.minimum.lat) * -this.inertia.y,
			this.config.position.zoom + (this.config.maximum.zoom - this.config.minimum.zoom) * this.inertia.z
		);
		// if the inertia is above a certain level
		if (Math.abs(this.inertia.x) > 0.0001 || Math.abs(this.inertia.y) > 0.0001 || Math.abs(this.inertia.z) > 0.0001) {
			// attenuate the inertia
			this.inertia.x *= 0.9;
			this.inertia.y *= 0.9;
			this.inertia.z *= 0.7;
			// continue monitoring
			window.cancelAnimationFrame(this.animationFrame);
			this.animationFrame = window.requestAnimationFrame(this.coasting.bind(this));
		}
	};

	this.startInteraction = function(evt) {
		// reset inertial movement
		this.inertia.x = 0;
		this.inertia.y = 0;
		this.inertia.z = 0;
		// store the initial touch(es)
		this.touches = evt.touches || [{ 'clientX': evt.clientX, 'clientY': evt.clientY }];
	};

	this.moveInteraction = function(evt) {
		evt.preventDefault();
		// retrieve the current and previous touches
		var touches = evt.touches || [{ 'clientX': evt.clientX, 'clientY': evt.clientY }];
		var previous = this.touches;
		// if there is interaction
		if (previous) {
			// calculate the interaction points
			var width = this.config.canvasElement.offsetWidth * this.config.position.zoom;
			var height = this.config.canvasElement.offsetHeight * this.config.position.zoom;
			var nextX = (touches.length > 1) ? (touches[0].clientX + touches[1].clientX) / 2 : touches[0].clientX;
			var nextY = (touches.length > 1) ? (touches[0].clientY + touches[1].clientY) / 2 : touches[0].clientY;
			var prevX = (previous.length > 1) ? (previous[0].clientX + previous[1].clientX) / 2 : previous[0].clientX;
			var prevY = (previous.length > 1) ? (previous[0].clientY + previous[1].clientY) / 2 : previous[0].clientY;
			// update the inertia
			this.inertia.x = (nextX - prevX) / width;
			this.inertia.y = (nextY - prevY) / height;
			this.inertia.z = (touches.length > 1 && previous.length > 1) ? ((touches[0].clientX - touches[1].clientX) - (previous[0].clientX - previous[1].clientX)) / width + ((touches[0].clientY - touches[1].clientY) - (previous[0].clientY - previous[1].clientY)) / height : 0;
			// start coasting on inertia
			this.coasting();
			// store the touches
			this.touches = touches;
		}
	};

	this.endInteraction = function(evt) {
		// clear the interaction
		this.touches = null;
	};

	this.wheelInteraction = function(evt) {
		evt.preventDefault();
		// update the inertia
		this.inertia.z += evt.deltaY / 5000;
		// start coasting on inertia
		this.coasting();
	};

	this.cancelInteraction = function(evt) {};

	// EVENTS

	this.onZoomIn = function(evt) {
		this.parent.focus(
			this.config.position.lon,
			this.config.position.lat,
			this.config.position.zoom * 3/2,
			true
		);
	};

	this.onZoomOut = function(evt) {
		this.parent.focus(
			this.config.position.lon,
			this.config.position.lat,
			this.config.position.zoom * 2/3,
			true
		);
	};

	this.config.container.addEventListener('mousedown', this.startInteraction.bind(this));
	this.config.container.addEventListener('mousemove', this.moveInteraction.bind(this));
	this.config.container.addEventListener('mouseup', this.endInteraction.bind(this));
	this.config.container.addEventListener('wheel', this.wheelInteraction.bind(this));

	this.config.container.addEventListener('touchstart', this.startInteraction.bind(this));
	this.config.container.addEventListener('touchmove', this.moveInteraction.bind(this));
	this.config.container.addEventListener('touchend', this.endInteraction.bind(this));
	this.config.container.addEventListener('touchcancel', this.cancelInteraction.bind(this));

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
	this.onMarkerClicked = onMarkerClicked;
	this.onMapFocus = onMapFocus;
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

	this.update = function() {
		// only resize if the zoom has changed
		if (this.zoom !== this.config.position.zoom) this.resize();
		// only reposition if the content has changed
		if (this.lon !== this.config.indicator.lon  && this.lat !== this.config.indicator.lat) this.reposition();
		// store the current zoom level
		this.zoom = this.config.position.zoom;
	};

	this.show = function(input) {
		console.log('indicator.show', input);
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
    var filename = (source) ? source.split('/').pop() : null;
    var cached = (this.config.exifData) ? this.config.exifData[filename] : {};
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
    this.onMapFocus(this.config.position.lon, this.config.position.lat, this.config.position.zoom * 0.25, true);
	};

	this.resize = function() {
		// resize the marker according to scale
		var scale = 1 / this.config.position.zoom;
		this.element.style.transform = 'scale(' + scale + ')';
	};

	this.reposition = function() {
		var min = this.config.minimum;
		var max = this.config.maximum;
		var lon = this.config.indicator.lon;
		var lat = this.config.indicator.lat;
		// if the location is within bounds
		if (lon > min.lon && lon < max.lon && lat < min.lat && lat > max.lat) {
			// store the new position
			this.lon = lon;
			this.lat = lat;
			// display the marker
			this.element.style.cursor = (this.config.indicator.description) ? 'pointer' : 'default';
			this.element.style.display = 'block';
			this.element.style.left = ((lon - min.lon) / (max.lon - min.lon) * 100) + '%';
			this.element.style.top = ((lat - min.lat) / (max.lat - min.lat) * 100) + '%';
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
    this.onMapFocus(this.config.indicator.lon, this.config.indicator.lat, this.config.indicator.zoom, true);
  };

	this.onIndicatorClicked = function(evt) {
		evt.preventDefault();
		// report that the indicator was clicked
		this.onMarkerClicked(this.config.indicator);
	};

	this.start();

};

// extend the class
Localmap.prototype.Legend = function (parent, onLegendClicked) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.onLegendClicked = onLegendClicked;
	this.elements = [];

	// METHODS

	this.start = function() {};

	this.update = function() {
    // write the legend if needed and available
    if (this.config.legend && this.elements.length === 0) this.elements = this.config.guideData.markers.map(this.addDefinition.bind(this));
  };

  this.addDefinition = function(markerData, index) {
    var definitionData = {};
    // if the marker has a description
    if (markerData.description) {
      // format the path to the external assets
      var guideData = this.config.guideData;
      var key = (guideData.assets) ? guideData.assets.prefix : guideData.gps;
      var image = (markerData.photo) ? this.config.assetsUrl + markerData.photo : this.config.markersUrl.replace('{type}', markerData.type);
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
      definitionData.title.addEventListener('click', this.onLegendClicked.bind(this, markerData));
      definitionData.description.addEventListener('click', this.onLegendClicked.bind(this, markerData));
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

	this.update = function() {
		// only resize if the zoom has changed
		if (this.zoom !== this.config.position.zoom) this.resize();
		// store the current zoom level
		this.zoom = this.config.position.zoom;
	};

	this.resize = function() {
		// resize the marker according to scale
		var scale = 1 / this.config.position.zoom;
		this.element.style.transform = 'scale(' + scale + ')';
	};

	this.requestPosition = function() {
		if (!this.active) {
			// request location updates
			this.locator = navigator.geolocation.watchPosition(this.onReposition.bind(this));
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
		if (lon > min.lon && lon < max.lon && lat < min.lat && lat > max.lat) {
			// display the marker
			this.element.style.display = 'block';
			this.element.style.left = ((lon - min.lon) / (max.lon - min.lon) * 100) + '%';
			this.element.style.top = ((lat - min.lat) / (max.lat - min.lat) * 100) + '%';
		// otherwise
		} else {
			// hide the marker
			this.element.style.display = 'none';
		}
	};

	this.start();

};

// extend the class
Localmap.prototype.Markers = function (parent, onMarkerClicked) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.elements = [];
	this.onMarkerClicked = onMarkerClicked;
	this.zoom = null;

	// METHODS

	this.start = function() {
		// if cached data is available
		if (this.config.guideData) {
			// add the markers from the guide
			this.addGuide();
		// otherwise
		} else {
			// load the guide's JSON first
			var guideXhr = new XMLHttpRequest();
			guideXhr.addEventListener('load', this.onGuideLoaded.bind(this));
			guideXhr.open('GET', this.config.guideUrl, true);
			guideXhr.send();
		}
	};

	// TODO: use cached data or load the JSON file

	this.update = function() {
		// only resize if the zoom has changed
		if (this.zoom !== this.config.position.zoom) this.resize();
		// store the current zoom level
		this.zoom = this.config.position.zoom;
	};

	this.resize = function() {
		console.log('markers resize', this.config.position.zoom);
		// resize the markers according to scale
		var scale = 1 / this.config.position.zoom;
		for (var key in this.elements) {
			this.elements[key].style.transform = 'scale(' + scale + ')'
		}
	};

	this.addGuide = function() {
		var config = this.config;
		var guideData = this.config.guideData;
		// store the interpolation limits
		var min = this.config.minimum;
		var max = this.config.maximum;
		min.lon = (guideData.assets) ? guideData.assets.bounds.west : guideData.bounds.west;
		min.lat = (guideData.assets) ? guideData.assets.bounds.north : guideData.bounds.north;
		max.lon = (guideData.assets) ? guideData.assets.bounds.east : guideData.bounds.east;
		max.lat = (guideData.assets) ? guideData.assets.bounds.south : guideData.bounds.south;
		// store the initial position
		config.position.lon = (max.lon - min.lon) / 2;
		config.position.lat = (max.lat - min.lat) / 2;
		// position every marker in the guide
		guideData.markers.map(this.addMarker.bind(this));
	};

	this.addMarker = function(markerData) {
		// add either a landmark or a waypoint to the map
		markerData.element = (markerData.photo) ? this.addLandmark(markerData) : this.addWaypoint(markerData);
		markerData.element.addEventListener('click', this.onMarkerClicked.bind(this, markerData));
		this.parent.element.appendChild(markerData.element);
		this.elements.push(markerData.element);
	}

	this.addLandmark = function(markerData) {
		var min = this.config.minimum;
		var max = this.config.maximum;
		var element = document.createElement('span');
		element.setAttribute('class', 'localmap-waypoint');
		element.addEventListener('click', this.onMarkerClicked.bind(this, markerData));
		element.style.left = ((markerData.lon - min.lon) / (max.lon - min.lon) * 100) + '%';
		element.style.top = ((markerData.lat - min.lat) / (max.lat - min.lat) * 100) + '%';
		element.style.cursor = 'pointer';
		return element;
	};

	this.addWaypoint = function(markerData) {
		var min = this.config.minimum;
		var max = this.config.maximum;
		var element = new Image();
		element.setAttribute('src', this.config.markersUrl.replace('{type}', markerData.type));
		element.setAttribute('alt', '');
		element.setAttribute('class', 'localmap-marker');
		element.style.left = ((markerData.lon - min.lon) / (max.lon - min.lon) * 100) + '%';
		element.style.top = ((markerData.lat - min.lat) / (max.lat - min.lat) * 100) + '%';
		element.style.cursor = (markerData.description) ? 'pointer' : null;
		return element;
	};

	// EVENTS

	this.onGuideLoaded = function(evt) {
		// decode the guide data
		this.config.guideData = JSON.parse(evt.target.response);
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

	this.update = function() {};

	this.show = function(markerData) {

// TODO: if there is no photo use the icon but as an aside

		// display the photo if available
		if (markerData.photo) {
			this.photo.style.display = null;
			this.photo.style.backgroundImage = 'url(' + this.config.assetsUrl + markerData.photo + ')';
		} else {
			this.photo.style.display = 'none';
		}
		// display the content if available
		if (markerData.description) {
			this.description.innerHTML = (markerData.photo) ? '' : '<img class="localmap-modal-icon" src="' + this.config.markersUrl.replace('{type}', markerData.type) + '" alt=""/>';
			this.description.innerHTML += '<p>' + markerData.description + '</p>';
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
Localmap.prototype.Route = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.elements = [];
	this.coordinates = [];
	this.zoom = null;

	// METHODS

	this.start = function() {
		// use the JSON immediately
		if (this.config.routeData) {
			this.onJsonLoaded(this.config.routeData);
		// or load the route's GPX first
		} else {
			var routeXhr = new XMLHttpRequest();
			routeXhr.addEventListener('load', this.onGpxLoaded.bind(this));
			routeXhr.open('GET', this.config.routeUrl, true);
			routeXhr.send();
		}
		// create a canvas
		this.canvas = document.createElement('canvas');
		this.canvas.setAttribute('class', 'localmap-route')
		this.parent.element.appendChild(this.canvas);
	};

	this.update = function() {
		// only redraw if the zoom has changed
		if (this.zoom !== this.config.position.zoom) this.redraw();
		// store the current zoom level
		this.zoom = this.config.position.zoom;
	};

	this.redraw = function() {
		// adjust the height of the canvas
		this.canvas.width = this.parent.element.offsetWidth;
		this.canvas.height = this.parent.element.offsetHeight;
		// position every trackpoint in the route
		var ctx = this.canvas.getContext('2d');
		// (re)draw the route
		var x, y, z = this.config.position.zoom, w = this.canvas.width, h = this.canvas.height;
		ctx.clearRect(0, 0, w, h);
		ctx.lineWidth = 4 / z;
		ctx.strokeStyle = 'orange';
		ctx.beginPath();
		for (var key in this.coordinates) {
			if (this.coordinates.hasOwnProperty(key) && key % 1 == 0) {
				if (x = null) ctx.moveTo(x, y);
				x = parseInt((this.coordinates[key][0] - this.config.minimum.lon) / (this.config.maximum.lon - this.config.minimum.lon) * w);
				y = parseInt((this.coordinates[key][1] - this.config.minimum.lat) / (this.config.maximum.lat - this.config.minimum.lat) * h);
				ctx.lineTo(x, y);
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
	};

	this.onGpxLoaded = function(evt) {
		// convert GPX into an array of coordinates
		var gpx = evt.target.responseXML;
		var trackpoints = gpx.getElementsByTagName('trkpt');
		for (var key in trackpoints) {
			if (trackpoints.hasOwnProperty(key) && key % 1 == 0) {
				this.coordinates.push([parseFloat(trackpoints[key].getAttribute('lon')), parseFloat(trackpoints[key].getAttribute('lat')), null]);
			}
		}
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

	// METHODS

	this.start = function() {
		// add the scale to the interface
		this.element.setAttribute('class', 'localmap-scale');
		this.config.container.appendChild(this.element);
	};

	this.update = function() {
		// only redraw if the zoom has changed
		if (this.zoom !== this.config.position.zoom) this.redraw();
		// store the current zoom level
		this.zoom = this.config.position.zoom;
	};

	this.redraw = function() {
		// how big is the map in kilometres along the bottom
		var mapSize = this.distance(
			{'lon': this.config.minimum.lon, 'lat': this.config.maximum.lat},
			{'lon': this.config.maximum.lon, 'lat': this.config.maximum.lat}
		);
		// what portion of that is in the container
		var visible = this.config.container.offsetWidth / this.config.canvasElement.offsetWidth / this.config.position.zoom;
		// use a fraction of that as the scale
		var scaleSize = visible * mapSize / 6;
		// round to the nearest increment
		var scale = 50, label = '50km';
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

/*
	Source:
	van Creij, Maurice (2018). "photocylinder.js: Displays a cylindrical projection of a panoramic image.", http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// establish the class
var Photocylinder = function (config) {

		this.only = function (config) {
			// start an instance of the script
			return new this.Main(config, this).init();
		};

		this.each = function (config) {
			var _config, _context = this, instances = [];
			// for all element
			for (var a = 0, b = config.elements.length; a < b; a += 1) {
				// clone the configuration
				_config = Object.create(config);
				// insert the current element
				_config.element = config.elements[a];
				// start a new instance of the object
				instances[a] = new this.Main(_config, _context);
			}
			// return the instances
			return instances;
		};

		return (config.elements) ? this.each(config) : this.only(config);

};

// return as a require.js module
if (typeof define != 'undefined') define([], function () { return Photocylinder });
if (typeof module != 'undefined') module.exports = Photocylinder;

// extend the class
Photocylinder.prototype.Busy = function (container) {

	// PROPERTIES

	this.container = container;

	// METHODS

	this.show = function () {
		// construct the spinner
		this.spinner = document.createElement('div');
		this.spinner.className = (this.container === document.body) ?
			'photocylinder-busy photocylinder-busy-fixed photocylinder-busy-active':
			'photocylinder-busy photocylinder-busy-active';
		this.container.appendChild(this.spinner);
	};

	this.hide = function () {
		// deconstruct the spinner
		if (this.spinner && this.spinner.parentNode) {
			this.spinner.parentNode.removeChild(this.spinner);
			this.spinner = null;
		}
	};

};

// extend the class
Photocylinder.prototype.Fallback = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.popup = this.config.popup;
	this.image = this.config.image;
	this.imageAspect = null;
	this.wrapper = null;
	this.wrapperAspect = null;
	this.fov = null;
	this.magnification = {};
	this.horizontal = {};
	this.vertical = {};
	this.tracked = null;
	this.increment = this.config.idle / 200;
	this.auto = true;

	// METHODS

	this.init = function() {
		// prepare the markup
		this.build();
		// render the display
		this.render();
		// add the controls
		this.controls();
		// rescale after resize
		this.resizeListener = this.resize.bind(this);
		window.addEventListener('resize', this.resizeListener, true);

	};

	this.destroy = function() {
		// cancel all global event listeners
		window.removeEventListener('resize', this.resizeListener, true);
		window.removeEventListener('deviceorientation', this.tiltListener, true);
	};

	this.build = function() {
		// add the wrapper
		this.wrapper = document.createElement('div');
		this.wrapper.setAttribute('class', 'photo-cylinder pc-fallback');
		// TODO: for 360deg images the image needs to be doubled to allow looping
		var clonedImage = this.image.cloneNode(true);
		// add markup here
		this.wrapper.appendChild(this.image);
		// insert the object
		this.popup.appendChild(this.wrapper);
	};

	this.render = function() {
		// get the aspect ratio from the image
		this.imageAspect = this.image.offsetWidth / this.image.offsetHeight;
		// calculate the zoom limits
		this.magnification.min = 1; // TODO: make sure the image fills the width and height
		this.magnification.max = 4;
		// set the initial rotation
		this.recentre();
		// set the initial zoom
		this.resize();
		// if the image is wide enough, start the idle animation
		if (this.imageAspect - this.wrapperAspect >= 1) this.animate();
	};

	this.controls = function() {
		// add touch controls
		this.wrapper.addEventListener('touchstart', this.touch.bind(this, 'start'));
		this.wrapper.addEventListener('touchmove', this.touch.bind(this, 'move'));
		this.wrapper.addEventListener('touchend', this.touch.bind(this, 'end'));
		// add mouse controls
		this.wrapper.addEventListener('mousedown', this.touch.bind(this, 'start'));
		this.wrapper.addEventListener('mousemove', this.touch.bind(this, 'move'));
		this.wrapper.addEventListener('mouseup', this.touch.bind(this, 'end'));
		this.wrapper.addEventListener('mousewheel', this.wheel.bind(this));
	    this.wrapper.addEventListener('DOMMouseScroll', this.wheel.bind(this));
		// add tilt contols
		this.tiltListener = this.tilt.bind(this);
		window.addEventListener("deviceorientation", this.tiltListener, true);
	};

	this.coords = function(evt) {
		return {
			x: evt.screenX || evt.touches[0].screenX,
			y: evt.screenY || evt.touches[0].screenY,
			z: (evt.touches && evt.touches.length > 1) ? Math.abs(evt.touches[0].screenX - evt.touches[1].screenX + evt.touches[0].screenY - evt.touches[1].screenY) : 0
		}
	};

	this.recentre = function() {
		// reset the initial position
		this.magnification.current = this.magnification.min * 1.25;
		this.horizontal.current = 0.5;
		this.vertical.current = 0.5;
	};

	this.magnify = function(factor) {
		// limit the zoom
		this.magnification.current = Math.max(Math.min(factor, this.magnification.max), this.magnification.min);
		// (re)calculate the movement limits
		this.horizontal.min = Math.min(0.5 - (this.magnification.current -  this.wrapperAspect / this.imageAspect) / 2, 0.5);
		this.horizontal.max = Math.max(1 - this.horizontal.min, 0.5);
		this.horizontal.current = Math.max(Math.min(this.horizontal.current, this.horizontal.max), this.horizontal.min);
		this.vertical.min = Math.min(0.5 - (this.magnification.current - 1) / 2, 0.5);
		this.vertical.max = Math.max(1 - this.vertical.min, 0.5);
		this.vertical.current = Math.max(Math.min(this.vertical.current, this.vertical.max), this.vertical.min);
		// implement the zoom
		this.redraw();
	};

	this.move = function(horizontal, vertical) {
		// implement the movement
		this.horizontal.current = Math.max(Math.min(horizontal, this.horizontal.max), this.horizontal.min);
		this.vertical.current = Math.max(Math.min(vertical, this.vertical.max), this.vertical.min);
		// implement the zoom
		this.redraw();
	};

	this.momentum = function() {
		// on requestAnimationFrame count down the delta vectors to ~0
		if (this.magnification.delta || this.horizontal.delta || this.vertical.delta) {
			// reduce the increment
			this.magnification.delta = (Math.abs(this.magnification.delta) > 0.0001) ? this.magnification.delta / 1.05 : 0;
			this.horizontal.delta = (Math.abs(this.horizontal.delta) > 0.001) ? this.horizontal.delta / 1.05 : 0;
			this.vertical.delta = (Math.abs(this.vertical.delta) > 0.001) ? this.vertical.delta / 1.05 : 0;
			// advance rotation incrementally
			this.move(this.horizontal.current + this.horizontal.delta, this.vertical.current + this.vertical.delta);
			this.magnify(this.magnification.current + this.magnification.delta);
			// wait for the next render
			window.requestAnimationFrame(this.momentum.bind(this));
		}
	};

	this.redraw = function() {
		// apply all transformations in one go
		this.image.style.transform = 'translate(' + (this.horizontal.current * -100) + '%, ' + (this.vertical.current * -100) + '%) scale(' + this.magnification.current + ', ' + this.magnification.current + ')';
	};

	this.animate = function(allow) {
		// accept overrides
		if (typeof allow === 'boolean') {
			this.auto = allow;
		}
		// if animation is allowed
		if (this.auto) {
			// in 180 degree pictures adjust increment and reverse, otherwise loop forever
			if (this.horizontal.current + this.increment * 2 > this.horizontal.max) this.increment = -this.config.idle / 200;
			if (this.horizontal.current + this.increment * 2 < this.horizontal.min) this.increment = this.config.idle / 200;
			var step = this.horizontal.current + this.increment;
			// advance rotation incrementally, until interrupted
			this.move(step, this.vertical.current);
			window.requestAnimationFrame(this.animate.bind(this));
		}
	};

	// EVENTS

	this.tilt = function(evt) {
		// stop animating
		this.auto = false;
		// if there was tilt before and the jump is not extreme
		if (this.horizontal.tilted && this.vertical.tilted && Math.abs(evt.alpha - this.horizontal.tilted) < 45 && Math.abs(evt.beta - this.vertical.tilted) < 45) {
			// update the rotation
			this.move(
				this.horizontal.current - (evt.alpha - this.horizontal.tilted) / 180,
				this.vertical.current - (evt.beta - this.vertical.tilted) / 180
			);
		}
		// store the tilt
		this.horizontal.tilted = evt.alpha;
		this.vertical.tilted = evt.beta;
	};

	this.wheel = function(evt) {
		// cancel the scrolling
		evt.preventDefault();
		// stop animating
		this.auto = false;
		// reset the deltas
		this.magnification.delta = 0;
		// get the feedback
		var coords = this.coords(evt);
		var distance = evt.deltaY || evt.wheelDeltaY || evt.wheelDelta;
		this.magnification.delta = distance / this.wrapper.offsetHeight;
		this.magnify(this.magnification.current + this.magnification.delta);
		// continue based on inertia
		this.momentum();
	};

	this.touch = function(phase, evt) {
		// cancel the click
		evt.preventDefault();
		// pick the phase of interaction
		var coords, scale = this.magnification.current / this.magnification.min;
		switch(phase) {
			case 'start':
				// stop animating
				this.auto = false;
				// reset the deltas
				this.magnification.delta = 0;
				this.horizontal.delta = 0;
				this.vertical.delta = 0;
				// start tracking
				this.tracked = this.coords(evt);
				break;
			case 'move':
				if (this.tracked) {
					coords = this.coords(evt);
					// store the momentum
					this.magnification.delta = (this.tracked.z - coords.z) / this.wrapper.offsetWidth * scale * 2;
					this.horizontal.delta = (this.tracked.x - coords.x) / this.wrapper.offsetWidth * scale / this.imageAspect;
					this.vertical.delta = (this.tracked.y - coords.y) / this.wrapper.offsetHeight * scale;
					// calculate the position
					this.move(this.horizontal.current + this.horizontal.delta, this.vertical.current + this.vertical.delta);
					// calculate the zoom
					this.magnify(this.magnification.current - this.magnification.delta);
					// update the step
					this.tracked.x = coords.x;
					this.tracked.y = coords.y;
					this.tracked.z = coords.z;
				}
				break;
			case 'end':
				// stop tracking
				this.tracked = null;
				// continue based on inertia
				this.momentum();
				break;
		}
	};

	this.resize = function() {
		// update the aspect ratio
		this.wrapperAspect = this.wrapper.offsetWidth / this.wrapper.offsetHeight;
		// restore current values
		var factor = this.magnification.current || 1;
		var horizontal = this.horizontal.current || 0.5;
		var vertical = this.vertical.current || 0.5;
		// reset to zoom
		this.magnify(factor);
		// reset the rotation
		this.move(horizontal, vertical);
	};

};

// extend the class
Photocylinder.prototype.Main = function(config, context) {

	// PROPERTIES

	this.context = context;
	this.element = config.element;
	this.config = {
		'container': document.body,
		'spherical' : /r(\d+).jpg/i,
		'standalone': false,
		'slicer': '{src}',
		'idle': 0.1
	};

	for (var key in config) {
		this.config[key] = config[key];
	}

	// METHODS

	this.success = function(url, fov) {
		console.log("success", url);
		var config = this.config;
		// hide the busy indicator
		this.busy.hide();
		// check if the aspect ratio of the image can be determined
		var image = config.image;
		var isWideEnough = (image.naturalWidth && image.naturalHeight && image.naturalWidth / image.naturalHeight > 3);
		// show the popup, or use the container directly
		if (config.standalone) {
			config.popup = config.container;
			config.popup.innerHTML = '';
		} else {
			this.popup = new this.context.Popup(this);
			this.popup.show();
		}
		// insert the viewer, but MSIE and low FOV should default to fallback
		this.stage = (!/msie|trident|edge/i.test(navigator.userAgent) && (this.config.spherical.test(url) || isWideEnough))
		  ? new this.context.Stage(this)
		  : new this.context.Fallback(this);
		this.stage.init();
		// trigger the success handler
		if (config.success) {
			config.success(config.popup);
		}
	};

	this.failure = function(url, fov) {
		var config = this.config;
		// get rid of the image
		this.config.image = null;
		// give up on the popup
		if (this.popup) {
			// remove the popup
			config.popup.parentNode.removeChild(config.popup);
			// remove its reference
			this.popup = null;
		}
		// give up on the stage
		if (this.stage) {
			// remove the stage
			this.stage.destroy();
			config.stage.parentNode.removeChild(config.stage);
			// remove the reference
			this.stage = null;
		}
		// trigger the failure handler
		if (config.failure) {
			config.failure(config.popup);
		}
		// hide the busy indicator
		this.busy.hide();
	};

	this.destroy = function() {
		// shut down sub components
		this.stage.destroy();
	};

	// EVENTS

	this.onElementClicked = function(evt) {
		// prevent the click
		if (evt) evt.preventDefault();
		// show the busy indicator
		this.busy = new this.context.Busy(this.config.container);
		this.busy.show();
		// create the url for the image sizing webservice
	  var url = this.config.url || this.element.getAttribute('href') || this.element.getAttribute('data-url');
	  var size = (this.config.spherical.test(url)) ? 'height=1080&top=0.2&bottom=0.8' : 'height=1080';
		// load the image asset
		this.config.image = new Image();
		this.config.image.src = this.config.slicer.replace('{src}', url).replace('{size}', size);
		// load the viewer when done
		this.config.image.addEventListener('load', this.success.bind(this, url));
		this.config.image.addEventListener('error', this.failure.bind(this, url));
	};

	if (this.config.element) this.config.element.addEventListener('click', this.onElementClicked.bind(this));
	if (this.config.url) this.onElementClicked();

};

// extend the class
Photocylinder.prototype.Popup = function(parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;

	// METHODS

	this.show = function() {
		var config = this.config;
		// if the popup doesn't exist
		if (!config.popup) {
			// create a container for the popup
			config.popup = document.createElement('figure');
			config.popup.className = (config.container === document.body)
				? 'photocylinder-popup photocylinder-popup-fixed photocylinder-popup-passive'
				: 'photocylinder-popup photocylinder-popup-passive';
			// add a close gadget
			this.addCloser();
			// add a locator gadget
			this.addLocator();
			// add the popup to the document
			config.container.appendChild(config.popup);
			// reveal the popup when ready
			setTimeout(this.onShow.bind(this), 0);
		}
	};

	this.hide = function() {
		var config = this.config;
		// if there is a popup
		if (config.popup) {
			// unreveal the popup
			config.popup.className = config.popup.className.replace(/-active/gi, '-passive');
			// and after a while
			var _this = this;
			setTimeout(function() {
				// remove it
				config.container.removeChild(config.popup);
				// remove its reference
				config.popup = null;
				// ask the parent to self destruct
				_this.parent.destroy();
			}, 500);
		}
	};

	this.addCloser = function() {
		var config = this.config;
		// build a close gadget
		var closer = document.createElement('a');
		closer.className = 'photocylinder-closer';
		closer.innerHTML = 'x';
		closer.href = '#close';
		// add the close event handler
		closer.addEventListener('click', this.onHide.bind(this));
		closer.addEventListener('touchstart', this.onHide.bind(this));
		// add the close gadget to the image
		config.popup.appendChild(closer);
	};

	this.addLocator = function(url) {
		var config = this.config;
		// only add if a handler was specified
		if (config.located) {
			// build the geo marker icon
			var locator = document.createElement('a');
			locator.className = 'photocylinder-locator';
			locator.innerHTML = 'Show on a map';
			locator.href = '#map';
			// add the event handler
			locator.addEventListener('click', this.onLocate.bind(this));
			locator.addEventListener('touchstart', this.onLocate.bind(this));
			// add the location marker to the image
			config.popup.appendChild(locator);
		}
	};

	// EVENTS

	this.onShow = function() {
		var config = this.config;
		// show the popup
		config.popup.className = config.popup.className.replace(/-passive/gi, '-active');
		// trigger the closed event if available
		if (config.opened) {
			config.opened(config.element);
		}
	};

	this.onHide = function(evt) {
		var config = this.config;
		// cancel the click
		evt.preventDefault();
		// close the popup
		this.hide();
		// trigger the closed event if available
		if (config.closed) {
			config.closed(config.element);
		}
	};

	this.onLocate = function(evt) {
		var config = this.config;
		// cancel the click
		evt.preventDefault();
		// trigger the located event if available
		if (config.located) {
			config.located(config.element);
		}
	};

};

// extend the class
Photocylinder.prototype.Stage = function (parent) {

	// PROPERTIES

	this.parent = parent;
  this.config = parent.config;
	this.popup = this.config.popup;
	this.image = this.config.image;
	this.imageAspect = null;
	this.wrapper = null;
	this.wrapperAspect = null;
	this.baseAngle = 60;
	this.baseSize = 500;
	this.obj = null;
	this.objRow = null;
	this.objCols = [];
	this.fov = null;
	this.magnification = {};
	this.rotation = {};
	this.offset = {};
	this.tracked = null;
	this.increment = this.config.idle;
	this.auto = true;

	// METHODS

	this.init = function() {
		// prepare the markup
		this.build();
		// render the display
		this.render();
		// add the controls
		this.controls();
		// rescale after resize
		this.resizeListener = this.resize.bind(this);
		window.addEventListener('resize', this.resizeListener, true);
	};

	this.destroy = function() {
		// cancel all global event listeners
		window.removeEventListener('resize', this.resizeListener, true);
		window.removeEventListener('deviceorientation', this.tiltListener, true);
	};

	this.build = function() {
		// add the wrapper
		this.wrapper = document.createElement('div');
		this.wrapper.setAttribute('class', 'photo-cylinder');
		// add the row object
		this.objRow = document.createElement('div');
		this.objRow.setAttribute('class', 'pc-obj-row');
		this.wrapper.appendChild(this.objRow);
		// add the column oblects
		for (var a = 0, b = 8; a < b; a += 1) {
			this.objCols[a] = document.createElement('span');
			this.objCols[a].setAttribute('class', 'pc-obj-col pc-obj-col-' + a);
			this.objRow.appendChild(this.objCols[a]);
		}
		// add the image
		this.wrapper.appendChild(this.image);
		// insert the object
		this.popup.appendChild(this.wrapper);
		// remember the object
		this.config.stage = this.wrapper;
	};

	this.render = function() {
		// retrieve the field of view from the image source
		var url = this.image.getAttribute('src');
		this.fov = this.config.spherical.test(url) ? 360 : 180;
		// get the aspect ratio from the image
		this.imageAspect = this.image.offsetWidth / this.image.offsetHeight;
		// get the field of view property or guess one
		this.wrapper.className += (this.fov < 360) ? ' pc-180' : ' pc-360';
		// calculate the zoom limits - scale = aspect * (360 / fov) * 0.3
		this.magnification.min = Math.max(this.imageAspect * (360 / this.fov) * 0.3, 1);
		this.magnification.max = 4;
		this.magnification.current = this.magnification.min * 1.25;
		// the offset limits are 0 at zoom level 1 be definition, because there is no overscan
		this.offset.min = 0;
		this.offset.max = 0;
		// set the image source as the background image for the polygons
		for (var a = 0, b = this.objCols.length; a < b; a += 1) {
			this.objCols[a].style.backgroundImage = "url('" + url + "')";
		}
		// set the initial zoom
		this.resize();
		// set the initial rotation
		this.recentre();
		// start the idle animation
		this.animate();
	};

	this.controls = function() {
		// add touch controls
		this.wrapper.addEventListener('touchstart', this.touch.bind(this, 'start'));
		this.wrapper.addEventListener('touchmove', this.touch.bind(this, 'move'));
		this.wrapper.addEventListener('touchend', this.touch.bind(this, 'end'));
		// add mouse controls
		this.wrapper.addEventListener('mousedown', this.touch.bind(this, 'start'));
		this.wrapper.addEventListener('mousemove', this.touch.bind(this, 'move'));
		this.wrapper.addEventListener('mouseup', this.touch.bind(this, 'end'));
		this.wrapper.addEventListener('mousewheel', this.wheel.bind(this));
		this.wrapper.addEventListener('DOMMouseScroll', this.wheel.bind(this));
		// add tilt contols
		this.tiltListener = this.tilt.bind(this);
		window.addEventListener("deviceorientation", this.tiltListener, true);
	};

	this.coords = function(evt) {
		return {
			x: evt.screenX || evt.touches[0].screenX,
			y: evt.screenY || evt.touches[0].screenY,
			z: (evt.touches && evt.touches.length > 1) ? Math.abs(evt.touches[0].screenX - evt.touches[1].screenX + evt.touches[0].screenY - evt.touches[1].screenY) : 0
		}
	};

	this.recentre = function() {
		// reset the initial rotation
		this.rotate(this.fov/2);
	};

	this.magnify = function(factor, offset) {
		// limit the zoom
		this.magnification.current = Math.max(Math.min(factor, this.magnification.max), this.magnification.min);
		// calculate the view angle
		this.baseAngle = 60 * this.wrapperAspect * (this.magnification.min / this.magnification.current);
		// centre the zoom
		this.offset.max = (this.magnification.current - this.magnification.min) / 8;
		this.offset.min = -1 * this.offset.max;
		this.offset.current = Math.max(Math.min(offset, this.offset.max), this.offset.min);
		// calculate the rotation limits
		var overscanAngle = (this.baseAngle - 360 / this.objCols.length) / 2;
		this.rotation.min = (this.fov < 360) ? overscanAngle : 0;
		this.rotation.max = (this.fov < 360) ? this.fov - this.baseAngle + overscanAngle : this.fov;
		// redraw the object
		this.redraw();
	};

	this.rotate = function(angle) {
		// limit or loop the rotation
		this.rotation.current = (this.fov < 360) ? Math.max(Math.min(angle, this.rotation.max), this.rotation.min) : angle%360 ;
		// redraw the object
		this.redraw();
	};

	this.momentum = function() {
		// on requestAnimationFrame count down the delta vectors to ~0
		if (this.rotation.delta || this.magnification.delta || this.offset.delta) {
			// reduce the increment
			this.rotation.delta = (Math.abs(this.rotation.delta) > 0.1) ? this.rotation.delta / 1.05 : 0;
			this.magnification.delta = (Math.abs(this.magnification.delta) > 0.0001) ? this.magnification.delta / 1.05 : 0;
			this.offset.delta = (Math.abs(this.offset.delta) > 0.001) ? this.offset.delta / 1.05 : 0;
			// advance rotation incrementally
			this.rotate(this.rotation.current + this.rotation.delta);
			this.magnify(this.magnification.current + this.magnification.delta, this.offset.current + this.offset.delta);
			// wait for the next render
			window.requestAnimationFrame(this.momentum.bind(this));
		}
	};

	this.redraw = function() {
		// update the relative scale
		var scale = this.wrapper.offsetHeight / this.baseSize;
		// apply all transformations in one go
		this.objRow.style.transform = 'translate(-50%, ' + ((0.5 + this.offset.current * scale) * -100) + '%) scale(' + (this.magnification.current * scale) + ') rotateY(' + this.rotation.current + 'deg)';
	};

	this.animate = function(allow) {
		// accept overrides
		if (typeof allow === 'boolean') {
			this.auto = allow;
		}
		// if animation is allowed
		if (this.auto) {
			// in 180 degree pictures adjust increment and reverse, otherwise loop forever
			if (this.rotation.current + this.increment * 2 > this.rotation.max) this.increment = -this.config.idle;
			if (this.rotation.current + this.increment * 2 < this.rotation.min) this.increment = this.config.idle;
			var step = (this.fov < 360) ? this.rotation.current + this.increment : (this.rotation.current + this.increment) % 360;
			// advance rotation incrementally, until interrupted
			this.rotate(step);
			window.requestAnimationFrame(this.animate.bind(this));
		}
	};

	// EVENTS

	this.tilt = function(evt) {
		// stop animating
		this.auto = false;
		// if there was tilt before and the jump is not extreme
		if (this.rotation.tilted && Math.abs(evt.alpha - this.rotation.tilted) < 45) {
			// update the rotation
			this.rotate(this.rotation.current + evt.alpha - this.rotation.tilted);
		}
		// store the tilt
		this.rotation.tilted = evt.alpha;
	};

	this.wheel = function(evt) {
		// cancel the scrolling
		evt.preventDefault();
		// stop animating
		this.auto = false;
		// reset the deltas
		this.magnification.delta = 0;
		// get the feedback
		var coords = this.coords(evt);
		var distance = evt.deltaY || evt.wheelDeltaY || evt.wheelDelta;
		this.magnification.delta = distance / this.wrapper.offsetHeight;
		this.magnify(this.magnification.current + this.magnification.delta, this.offset.current);
		// continue based on inertia
		this.momentum();
	};

	this.touch = function(phase, evt) {
		// cancel the click
		evt.preventDefault();
		// pick the phase of interaction
		var coords, scale = this.magnification.current / this.magnification.min;
		switch(phase) {
			case 'start':
				// stop animating
				this.auto = false;
				// reset the deltas
				this.rotation.delta = 0;
				this.magnification.delta = 0;
				this.offset.delta = 0;
				// start tracking
				this.tracked = this.coords(evt);
				break;
			case 'move':
				if (this.tracked) {
					coords = this.coords(evt);
					// store the momentum
					this.rotation.delta = this.baseAngle * (this.tracked.x - coords.x) / this.wrapper.offsetWidth * scale;
					this.magnification.delta = (this.tracked.z - coords.z) / this.wrapper.offsetWidth * scale * 2;
					this.offset.delta = (this.tracked.y - coords.y) / this.wrapper.offsetHeight;
					// calculate the rotation
					this.rotate(this.rotation.current + this.rotation.delta);
					// calculate the zoom
					this.magnify(this.magnification.current - this.magnification.delta, this.offset.current + this.offset.delta);
					// update the step
					this.tracked.x = coords.x;
					this.tracked.y = coords.y;
					this.tracked.z = coords.z;
				}
				break;
			case 'end':
				// stop tracking
				this.tracked = null;
				// continue based on inertia
				this.momentum();
				break;
		}
	};

	this.resize = function() {
		// update the wrapper aspect ratio
		this.wrapperAspect = (this.wrapper.offsetWidth / this.wrapper.offsetHeight);
		// restore current values
		var factor = this.magnification.current || 1;
		var offset = this.offset.current || 0;
		var angle = this.rotation.current || this.fov/2;
		// reset to zoom
		this.magnify(factor, offset);
		// reset the rotation
		this.rotate(angle);
	};

};

/*
	Source:
	van Creij, Maurice (2014). "useful.photomap.js: Plots the GPS data of the photos in a slideshow on a map", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.

	Dependencies:
	http://www.leaflet.com/
	https://github.com/mapbox/togeojson
*/

// establish the class
var Photomap = function (config) {

	this.only = function (config) {
		// start an instance of the script
		return new this.Main(config, this);
	};

	this.each = function (config) {
		var _config, _context = this, instances = [];
		// for all element
		for (var a = 0, b = config.elements.length; a < b; a += 1) {
			// clone the configuration
			_config = Object.create(config);
			// insert the current element
			_config.element = config.elements[a];
			// delete the list of elements from the clone
			delete _config.elements;
			// start a new instance of the object
			instances[a] = new this.Main(_config, _context).init();
		}
		// return the instances
		return instances;
	};

	return (config.elements) ? this.each(config) : this.only(config);

};

// return as a require.js module
if (typeof define != 'undefined') define([], function () { return Photomap });
if (typeof module != 'undefined') module.exports = Photomap;

// extend the class
Photomap.prototype.Busy = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;

	// METHODS

	this.setup = function () {};
	this.show = function () {};
	this.hide = function () {};
};

// extend the class
Photomap.prototype.Exif = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;

	// METHODS

	this.load = function (url, onComplete) {
		var _this = this, path = url.split('/'), name = path[path.length - 1];
		// if the lat and lon have been cached in exifData
		if (this.config.exifData && this.config.exifData[name] && this.config.exifData[name].lat && this.config.exifData[name].lon) {
			// send back the stored coordinates from the exifData
			onComplete({
				'lat' : this.config.exifData[name].lat,
				'lon' : this.config.exifData[name].lon,
			});
		// else
		} else {
			console.log('PhotomapExif: ajax');
			// retrieve the exif data of a photo
			requests.send({
				url : this.config.exif.replace('{src}', url),
				post : null,
				onProgress : function (reply) {
					return reply;
				},
				onFailure : function (reply) {
					return reply;
				},
				onSuccess : function (reply) {
					var json = requests.decode(reply.responseText);
					var latLon = _this.convert(json);
					// exifData the values
					_this.config.exifData[name] = json;
					// call back the values
					onComplete(latLon);
				}
			});
		}
	};

	this.convert = function (exif) {
		var deg, min, sec, lon, lat;
		// latitude
		deg = (exif.GPS.GPSLatitude[0].match(/\//)) ?
			parseInt(exif.GPS.GPSLatitude[0].split('/')[0], 10) / parseInt(exif.GPS.GPSLatitude[0].split('/')[1], 10):
			parseInt(exif.GPS.GPSLatitude[0], 10);
		min = (exif.GPS.GPSLatitude[1].match(/\//)) ?
			parseInt(exif.GPS.GPSLatitude[1].split('/')[0], 10) / parseInt(exif.GPS.GPSLatitude[1].split('/')[1], 10):
			parseInt(exif.GPS.GPSLatitude[1], 10);
		sec = (exif.GPS.GPSLatitude[2].match(/\//)) ?
			parseInt(exif.GPS.GPSLatitude[2].split('/')[0], 10) / parseInt(exif.GPS.GPSLatitude[2].split('/')[1], 10):
			parseInt(exif.GPS.GPSLatitude[2], 10);
		lat = (deg + min / 60 + sec / 3600) * (exif.GPS.GPSLatitudeRef === "N" ? 1 : -1);
		// longitude
		deg = (exif.GPS.GPSLongitude[0].match(/\//)) ?
			parseInt(exif.GPS.GPSLongitude[0].split('/')[0], 10) / parseInt(exif.GPS.GPSLongitude[0].split('/')[1], 10):
			parseInt(exif.GPS.GPSLongitude[0], 10);
		min = (exif.GPS.GPSLongitude[1].match(/\//)) ?
			parseInt(exif.GPS.GPSLongitude[1].split('/')[0], 10) / parseInt(exif.GPS.GPSLongitude[1].split('/')[1], 10):
			parseInt(exif.GPS.GPSLongitude[1], 10);
		sec = (exif.GPS.GPSLongitude[2].match(/\//)) ?
			parseInt(exif.GPS.GPSLongitude[2].split('/')[0], 10) / parseInt(exif.GPS.GPSLongitude[2].split('/')[1], 10):
			parseInt(exif.GPS.GPSLongitude[2], 10);
		lon = (deg + min / 60 + sec / 3600) * (exif.GPS.GPSLongitudeRef === "W" ? -1 : 1);
		// temporary console report
		if (typeof(console) !== 'undefined') {
			console.log(this.config.indicator);
		}
		// return the values
		return {'lat' : lat, 'lon' : lon};
	};

};

// extend the class
Photomap.prototype.Gpx = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;

	// METHODS

	this.load = function (oncomplete) {
		var _this = this;
		// if the GPX have been cached in gpxData
		if (this.config.gpxData) {
			// call back
			oncomplete();
		// lead it from disk
		} else {
			// show the busy indicator
			parent.busy.show();
			// onload
			requests.send({
				url : this.config.gpx,
				post : null,
				onProgress : function () {},
				onFailure : function () {},
				onSuccess : function (reply) {
					// store the result
					_this.config.gpxData = _this.config.togeojson.gpx(reply.responseXML);
					// call back
					oncomplete();
					// hide the busy indicator
					_this.parent.busy.hide();
				}
			});
		}
	};

	this.coordinates = function () {
		// get the line data from the geojson file
		var features = this.config.gpxData.features, segments = [], coordinates;
		// for all features
		for (var a = 0, b = features.length; a < b; a += 1) {
			// if the coordinates come in sections
			if (features[a].geometry.coordinates[0][0] instanceof Array) {
				// flatten the sections
				coordinates = [].concat.apply([], features[a].geometry.coordinates);
			// else
			} else {
				// use the coordinates directly
				coordinates = features[a].geometry.coordinates;
			}
			// gather all the segments
			segments.push(coordinates);
		}
		// return the flattened segments
		return [].concat.apply([], segments);
	};

};

// extend the class
Photomap.prototype.Indicator = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;

	// METHODS

	this.add = function (lat, lon) {
		var icon;
		var map = this.config.map;
		var indicator = this.config.indicator;
		// if the indicator has coordinates
		if (lon && lat) {
			// store the coordinates
			this.lon = lon;
			this.lat = lat;
			// remove any previous indicator
			if (this.object) {
				map.object.removeLayer(this.object);
			}
			// create the icon
			icon = this.config.leaflet.icon({
				iconUrl: this.config.indicator,
				iconSize: [28, 28],
				iconAnchor: [14, 28]
			});
			// report the location for reference
			console.log('location:', lat, lon);
			// add the marker with the icon
			this.object = this.config.leaflet.marker(
				[this.lat, this.lon],
				{'icon': icon}
			);
			this.object.addTo(map.object);
			// focus the map on the indicator
			this.focus();
		}
	};

	this.remove = function () {
		var map = this.config.map;
		// remove the indicator
		if (this.object) {
			// remove the balloon
			this.object.closePopup();
			map.object.removeLayer(this.object);
			this.object = null;
		}
		// unfocus the indicator
		this.unfocus();
	};

	this.focus = function () {
		// focus the map on the indicator
		this.config.map.object.setView([this.lat, this.lon], this.config.zoom + 2);
		// call for a  redraw
		this.parent.redraw();
	};

	this.unfocus = function () {
		// focus the map on the indicator
		this.config.map.object.setView([this.lat, this.lon], this.config.zoom);
		// call for a  redraw
		this.parent.redraw();
	};

};

// extend the class
Photomap.prototype.Location = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.object = null;
	this.interval = null;

	// METHODS

	// add the Layer with the GPX Track
	this.point = function () {
		// if geolocation is available
		if (navigator.geolocation) {
			// request the position
			navigator.geolocation.watchPosition(
				this.onGeoSuccess(),
				this.onGeoFailure(),
				{ maximumAge : 10000,  timeout : 5000,  enableHighAccuracy : true }
			);
		}
	};

	// redraw the pointer layer
	this.redraw = function () {
		// if geolocation is available
		if (navigator.geolocation) {
			// request the position
			navigator.geolocation.getCurrentPosition(
				this.onGeoSuccess(),
				this.onGeoFailure(),
				{ enableHighAccuracy : true }
			);
		}
	};

	// geo location events
	this.onGeoSuccess = function () {
		var _this = this, _config = this.parent.config;
		return function (geo) {
			// if the marker doesn't exist yet
			if (_this.object === null) {
				// create the icon
				var icon = _this.config.leaflet.icon({
					iconUrl: _config.pointer,
					iconSize: [28, 28],
					iconAnchor: [14, 28]
				});
				// add the marker with the icon
				_this.object = _this.config.leaflet.marker(
					[geo.coords.latitude, geo.coords.longitude],
					{'icon': icon}
				);
				_this.object.addTo(_config.map.object);
			} else {
				_this.object.setLatLng([geo.coords.latitude, geo.coords.longitude]);
			}
		};
	};

	this.onGeoFailure = function () {
		var _this = this;
		return function () {
			console.log('geolocation failed');
		};
	};

};

// extend the class
Photomap.prototype.Main = function (config, context) {

	// PROPERTIES

	this.config = config;
	this.context = context;
	this.element = config.element;

	// METHODS

	this.init = function () {
		var _this = this;
		// show the busy indicator
		this.busy.setup();
		// load the gpx track
		this.gpx.load(function () {
			// draw the map
			_this.map.setup();
			// plot the route
			_this.route.plot();
			// show the permanent markers
			_this.markers.add();
			// show the indicator
			_this.indicator.add();
			// start the location pointer
			_this.location.point();
		});
		// return the object
		return this;
	};

	this.redraw = function () {
		var _this = this;
		// wait for a change to redraw
		clearTimeout(this.config.redrawTimeout);
		this.config.redrawTimeout = setTimeout(function () {
			// redraw the map
			//_this.map.redraw();
			// redraw the plotted route
			_this.route.redraw();
		}, 500);
	};

	// PUBLIC

	this.indicate = function (element) {
		var _this = this,
			config = this.config,
			url = element.getAttribute('data-url') || element.getAttribute('src') || element.getAttribute('href'),
			title = element.getAttribute('data-title') || element.getAttribute('title');
		this.exif.load(url, function (coords) {
			_this.indicator.add(coords.lat, coords.lon);
		});
	};

	this.unindicate = function () {
		this.indicator.remove();
	};

	this.stop = function () {
		this.map.remove();
	};

	// CLASSES

	this.busy = new this.context.Busy(this);
	this.exif = new this.context.Exif(this);
	this.gpx = new this.context.Gpx(this);
	this.map = new this.context.Map(this);
	this.route = new this.context.Route(this);
	this.markers = new this.context.Markers(this);
	this.indicator = new this.context.Indicator(this);
	this.location = new this.context.Location(this);

	// EVENTS

	this.init();

};

// extend the class
Photomap.prototype.Map = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;

	// METHODS

	this.setup = function () {
		var id = this.parent.element.id;
		// define the map
		this.config.map = {};
		this.config.map.object = this.config.leaflet.map(id);
		// add the scale
		this.config.leaflet.control.scale({imperial:false}).addTo(this.config.map.object);
		// add the tiles
		var tileLayer = this.config.leaflet.tileLayer(this.config.tiles, {
			attribution: this.config.credit,
			errorTileUrl: this.config.missing,
			minZoom: this.config.minZoom,
			maxZoom: this.config.maxZoom
		}).addTo(this.config.map.object);
		// if there is a local tile store, try and handle failing tiles
		if (this.config.local) {
			tileLayer.on('tileloadstart', this.onFallback(this.config.local));
		}
		// get the centre of the map
		this.bounds();
		// refresh the map after scrolling
		var _this = this;
		this.config.map.object.on('moveend', function (e) { _this.parent.redraw(); });
		this.config.map.object.on('zoomend', function (e) { _this.parent.redraw(); });
	};

	this.remove = function () {
		// ask leaflet to remove itself if available
		if (this.config.map && this.config.map.object) {
			this.config.map.object.remove();
		}
	};

	this.bounds = function () {
		var a, b, points, minLat = 999, minLon = 999, maxLat = -999, maxLon = -999;
		// for all navigation points
		points = this.parent.gpx.coordinates();
		for (a = 0 , b = points.length; a < b; a += 1) {
			minLon = (points[a][0] < minLon) ? points[a][0] : minLon;
			minLat = (points[a][1] < minLat) ? points[a][1] : minLat;
			maxLon = (points[a][0] > maxLon) ? points[a][0] : maxLon;
			maxLat = (points[a][1] > maxLat) ? points[a][1] : maxLat;
		}
		// extend the bounds a little
		minLat -= 0.01;
		minLon -= 0.01;
		maxLat += 0.01;
		maxLon += 0.01;
		// limit the bounds
		this.config.map.object.fitBounds([
			[minLat, minLon],
			[maxLat, maxLon]
		]);
		this.config.map.object.setMaxBounds([
			[minLat, minLon],
			[maxLat, maxLon]
		]);
	};

	this.beginning = function () {
		var a, b,
			points = this.parent.gpx.coordinates(),
			totLon = points[0][0] * points.length,
			totLat = points[0][1] * points.length;
		// for all navigation points
		for (a = 0 , b = points.length; a < b; a += 1) {
			totLon += points[a][0];
			totLat += points[a][1];
		}
		// average the centre
		this.config.map.centre = {
			'lon' : totLon / points.length / 2,
			'lat' : totLat / points.length / 2
		};
		// apply the centre
		this.config.map.object.setView([this.config.map.centre.lat, this.config.map.centre.lon], this.config.zoom);
		// call for a redraw
		this.parent.redraw();
	};

	this.centre = function () {
		var a, b, points,
			totLat = 0, totLon = 0;
		// for all navigation points
		points = this.parent.gpx.coordinates();
		for (a = 0 , b = points.length; a < b; a += 1) {
			totLon += points[a][0];
			totLat += points[a][1];
		}
		// average the centre
		this.config.map.centre = {
			'lon' : totLon / points.length,
			'lat' : totLat / points.length
		};
		// apply the centre
		this.config.map.object.setView([this.config.map.centre.lat, this.config.map.centre.lon], this.config.zoom);
		// call for a redraw
		this.parent.redraw();
	};

	this.onFallback = function (local) {
		return function (element) {
			var src = element.tile.getAttribute('src');
			element.tile.setAttribute('data-failed', 'false');
			element.tile.addEventListener('error', function () {
				// if this tile has not failed before
				if (element.tile.getAttribute('data-failed') === 'false') {
					// mark the element as a failure
					element.tile.setAttribute('data-failed', 'true');
					// recover the coordinates
					var parts = src.split('/'),
						length = parts.length,
						z = parseInt(parts[length - 3]),
						x =	parseInt(parts[length - 2]),
						y = parseInt(parts[length - 1]);
					// try the local source instead
					element.tile.src = local.replace('{z}', z).replace('{x}', x).replace('{y}', y);
					console.log('fallback to:', element.tile.src);
				}
			});
		};
	};

};

// extend the class
Photomap.prototype.Markers = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;

	// METHODS

	// add the Layer with the permanent markers
	this.add = function () {
		var name, marker, icon;
		// get the track points from the GPX file
		var points = this.parent.gpx.coordinates();
		// for all markers
		var _this = this;
		this.config.markers.map(function (marker, index) {
			// disregard the waypoints with photos
			if (!marker.photo) {
				// create the icon
				icon = _this.config.leaflet.icon({
					iconUrl: _this.config.marker.replace('{type}', marker.type),
					iconSize: [28, 28],
					iconAnchor: [14, 28]
				});
				// add the marker with the icon
				marker.object = _this.config.leaflet.marker(
					[marker.lat, marker.lon],
					{'icon': icon}
				);
				marker.object.addTo(_this.config.map.object);
				// if there is a desciption
				if (marker.description) {
					// add the popup to the marker
					marker.popup = marker.object.bindPopup(marker.description);
					// add the click handler
					marker.object.on('click', _this.onMarkerClicked(marker));
				}
			}
		});
	};

	this.onMarkerClicked = function (marker) {
		var _this = this;
		return function (evt) {
			// show the marker message in a balloon
			marker.object.openPopup();
		};
	};

};

// extend the class
Photomap.prototype.Route = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;

	// METHODS

	// add the Layer with the GPX Track
	this.plot = function () {
		// plot the geoJson object
		this.config.route = {};
		this.config.route.object = this.config.leaflet.geoJson(this.config.gpxData, {
			style : function (feature) { return { 'color': '#ff6600', 'weight': 5, 'opacity': 0.66 }; }
		});
		this.config.route.object.addTo(this.config.map.object);
	};

	// redraw the geoJSON layer
	this.redraw = function () {
		if (this.config.route) {
			// remove the layer
			this.config.map.object.removeLayer(this.config.route.object);
			// re-add the layer
			this.plot();
		}
	};

};

/*
	Source:
	van Creij, Maurice (2018). "photowall.js: Simple photo wall", http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// establish the class
var Photowall = function (config) {

		this.only = function (config) {
			// start an instance of the script
			return new this.Main(config, this);
		};

		this.each = function (config) {
			var _config, _context = this, instances = [];
			// for all element
			for (var a = 0, b = config.elements.length; a < b; a += 1) {
				// clone the configuration
				_config = Object.create(config);
				// insert the current element
				_config.element = config.elements[a];
				// start a new instance of the object
				instances[a] = new this.Main(_config, _context);
			}
			// return the instances
			return instances;
		};

		return (config.elements) ? this.each(config) : this.only(config);

};

// return as a require.js module
if (typeof define != 'undefined') define([], function () { return Photowall });
if (typeof module != 'undefined') module.exports = Photowall;

// extend the class
Photowall.prototype.Main = function(config, context) {

  // PROPERTIES

  this.config = config;
  this.context = context;
  this.element = config.element;

  // METHODS

  this.init = function() {
    // find all the links
    var photos = this.element.getElementsByTagName('img');
    // process all photos
    for (var a = 0, b = photos.length; a < b; a += 1) {
      // move the image to the tile's background
      photos[a].style.visibility = 'hidden';
      photos[a].parentNode.style.backgroundImage = "url('" + photos[a].getAttribute('src') + "')";
    }
    // return the object
    return this;
  };

  this.init();

};

/*
	Source:
	van Creij, Maurice (2018). "polyfills.js: A library of useful polyfills to ease working with HTML5 in legacy environments.", http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// establish the class
var Polyfills = function () {

  // enabled the use of HTML5 elements in Internet Explorer
  this.html5 = function() {
    var a, b, elementsList = ['section', 'nav', 'article', 'aside', 'hgroup', 'header', 'footer', 'dialog', 'mark', 'dfn', 'time', 'progress', 'meter', 'ruby', 'rt', 'rp', 'ins', 'del', 'figure', 'figcaption', 'video', 'audio', 'source', 'canvas', 'datalist', 'keygen', 'output', 'details', 'datagrid', 'command', 'bb', 'menu', 'legend'];
    if (navigator.userAgent.match(/msie/gi)) {
      for (a = 0, b = elementsList.length; a < b; a += 1) {
        document.createElement(elementsList[a]);
      }
    }
  };

  // allow array.indexOf in older browsers
  this.arrayIndexOf = function() {
    if (!Array.prototype.indexOf) {
      Array.prototype.indexOf = function(obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i += 1) {
          if (this[i] === obj) {
            return i;
          }
        }
        return -1;
      };
    }
  };

  // allow array.isArray in older browsers
  this.arrayIsArray = function() {
    if (!Array.isArray) {
      Array.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
      };
    }
  };

  // allow array.map in older browsers (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
  this.arrayMap = function() {

    // Production steps of ECMA-262, Edition 5, 15.4.4.19
    // Reference: http://es5.github.io/#x15.4.4.19
    if (!Array.prototype.map) {

      Array.prototype.map = function(callback, thisArg) {

        var T, A, k;

        if (this == null) {
          throw new TypeError(' this is null or not defined');
        }

        // 1. Let O be the result of calling ToObject passing the |this|
        //    value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get internal
        //    method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== 'function') {
          throw new TypeError(callback + ' is not a function');
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 1) {
          T = thisArg;
        }

        // 6. Let A be a new array created as if by the expression new Array(len)
        //    where Array is the standard built-in constructor with that name and
        //    len is the value of len.
        A = new Array(len);

        // 7. Let k be 0
        k = 0;

        // 8. Repeat, while k < len
        while (k < len) {

          var kValue, mappedValue;

          // a. Let Pk be ToString(k).
          //   This is implicit for LHS operands of the in operator
          // b. Let kPresent be the result of calling the HasProperty internal
          //    method of O with argument Pk.
          //   This step can be combined with c
          // c. If kPresent is true, then
          if (k in O) {

            // i. Let kValue be the result of calling the Get internal
            //    method of O with argument Pk.
            kValue = O[k];

            // ii. Let mappedValue be the result of calling the Call internal
            //     method of callback with T as the this value and argument
            //     list containing kValue, k, and O.
            mappedValue = callback.call(T, kValue, k, O);

            // iii. Call the DefineOwnProperty internal method of A with arguments
            // Pk, Property Descriptor
            // { Value: mappedValue,
            //   Writable: true,
            //   Enumerable: true,
            //   Configurable: true },
            // and false.

            // In browsers that support Object.defineProperty, use the following:
            // Object.defineProperty(A, k, {
            //   value: mappedValue,
            //   writable: true,
            //   enumerable: true,
            //   configurable: true
            // });

            // For best browser support, use the following:
            A[k] = mappedValue;
          }
          // d. Increase k by 1.
          k++;
        }

        // 9. return A
        return A;
      };
    }

  };

  // allow document.querySelectorAll (https://gist.github.com/connrs/2724353)
  this.querySelectorAll = function() {
    if (!document.querySelectorAll) {
      document.querySelectorAll = function(a) {
        var b = document,
          c = b.documentElement.firstChild,
          d = b.createElement("STYLE");
        return c.appendChild(d), b.__qsaels = [], d.styleSheet.cssText = a + "{x:expression(document.__qsaels.push(this))}", window.scrollBy(0, 0), b.__qsaels;
      };
    }
  };

  // allow addEventListener (https://gist.github.com/jonathantneal/3748027)
  this.addEventListener = function() {
    !window.addEventListener && (function(WindowPrototype, DocumentPrototype, ElementPrototype, addEventListener, removeEventListener, dispatchEvent, registry) {
      WindowPrototype[addEventListener] = DocumentPrototype[addEventListener] = ElementPrototype[addEventListener] = function(type, listener) {
        var target = this;
        registry.unshift([target, type, listener, function(event) {
          event.currentTarget = target;
          event.preventDefault = function() {
            event.returnValue = false;
          };
          event.stopPropagation = function() {
            event.cancelBubble = true;
          };
          event.target = event.srcElement || target;
          listener.call(target, event);
        }]);
        this.attachEvent("on" + type, registry[0][3]);
      };
      WindowPrototype[removeEventListener] = DocumentPrototype[removeEventListener] = ElementPrototype[removeEventListener] = function(type, listener) {
        for (var index = 0, register; register = registry[index]; ++index) {
          if (register[0] == this && register[1] == type && register[2] == listener) {
            return this.detachEvent("on" + type, registry.splice(index, 1)[0][3]);
          }
        }
      };
      WindowPrototype[dispatchEvent] = DocumentPrototype[dispatchEvent] = ElementPrototype[dispatchEvent] = function(eventObject) {
        return this.fireEvent("on" + eventObject.type, eventObject);
      };
    })(Window.prototype, HTMLDocument.prototype, Element.prototype, "addEventListener", "removeEventListener", "dispatchEvent", []);
  };

  // allow console.log
  this.consoleLog = function() {
    var overrideTest = new RegExp('console-log', 'i');
    if (!window.console || overrideTest.test(document.querySelectorAll('html')[0].className)) {
      window.console = {};
      window.console.log = function() {
        // if the reporting panel doesn't exist
        var a, b, messages = '',
          reportPanel = document.getElementById('reportPanel');
        if (!reportPanel) {
          // create the panel
          reportPanel = document.createElement('DIV');
          reportPanel.id = 'reportPanel';
          reportPanel.style.background = '#fff none';
          reportPanel.style.border = 'solid 1px #000';
          reportPanel.style.color = '#000';
          reportPanel.style.fontSize = '12px';
          reportPanel.style.padding = '10px';
          reportPanel.style.position = (navigator.userAgent.indexOf('MSIE 6') > -1) ? 'absolute' : 'fixed';
          reportPanel.style.right = '10px';
          reportPanel.style.bottom = '10px';
          reportPanel.style.width = '180px';
          reportPanel.style.height = '320px';
          reportPanel.style.overflow = 'auto';
          reportPanel.style.zIndex = '100000';
          reportPanel.innerHTML = '&nbsp;';
          // store a copy of this node in the move buffer
          document.body.appendChild(reportPanel);
        }
        // truncate the queue
        var reportString = (reportPanel.innerHTML.length < 1000) ? reportPanel.innerHTML : reportPanel.innerHTML.substring(0, 800);
        // process the arguments
        for (a = 0, b = arguments.length; a < b; a += 1) {
          messages += arguments[a] + '<br/>';
        }
        // add a break after the message
        messages += '<hr/>';
        // output the queue to the panel
        reportPanel.innerHTML = messages + reportString;
      };
    }
  };

  // allows Object.create (https://gist.github.com/rxgx/1597825)
  this.objectCreate = function() {
    if (typeof Object.create !== "function") {
      Object.create = function(original) {
        function Clone() {}
        Clone.prototype = original;
        return new Clone();
      };
    }
  };

  // allows String.trim (https://gist.github.com/eliperelman/1035982)
  this.stringTrim = function() {
    if (!String.prototype.trim) {
      String.prototype.trim = function() {
        return this.replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
      };
    }
    if (!String.prototype.ltrim) {
      String.prototype.ltrim = function() {
        return this.replace(/^\s+/, '');
      };
    }
    if (!String.prototype.rtrim) {
      String.prototype.rtrim = function() {
        return this.replace(/\s+$/, '');
      };
    }
    if (!String.prototype.fulltrim) {
      String.prototype.fulltrim = function() {
        return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' ');
      };
    }
  };

  // allows localStorage support
  this.localStorage = function() {
    if (!window.localStorage) {
      if (/MSIE 8|MSIE 7|MSIE 6/i.test(navigator.userAgent)) {
        window.localStorage = {
          getItem: function(sKey) {
            if (!sKey || !this.hasOwnProperty(sKey)) {
              return null;
            }
            return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
          },
          key: function(nKeyId) {
            return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
          },
          setItem: function(sKey, sValue) {
            if (!sKey) {
              return;
            }
            document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
            this.length = document.cookie.match(/\=/g).length;
          },
          length: 0,
          removeItem: function(sKey) {
            if (!sKey || !this.hasOwnProperty(sKey)) {
              return;
            }
            document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
            this.length--;
          },
          hasOwnProperty: function(sKey) {
            return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
          }
        };
        window.localStorage.length = (document.cookie.match(/\=/g) || window.localStorage).length;
      } else {
        Object.defineProperty(window, "localStorage", new(function() {
          var aKeys = [],
            oStorage = {};
          Object.defineProperty(oStorage, "getItem", {
            value: function(sKey) {
              return sKey ? this[sKey] : null;
            },
            writable: false,
            configurable: false,
            enumerable: false
          });
          Object.defineProperty(oStorage, "key", {
            value: function(nKeyId) {
              return aKeys[nKeyId];
            },
            writable: false,
            configurable: false,
            enumerable: false
          });
          Object.defineProperty(oStorage, "setItem", {
            value: function(sKey, sValue) {
              if (!sKey) {
                return;
              }
              document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
            },
            writable: false,
            configurable: false,
            enumerable: false
          });
          Object.defineProperty(oStorage, "length", {
            get: function() {
              return aKeys.length;
            },
            configurable: false,
            enumerable: false
          });
          Object.defineProperty(oStorage, "removeItem", {
            value: function(sKey) {
              if (!sKey) {
                return;
              }
              document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
            },
            writable: false,
            configurable: false,
            enumerable: false
          });
          this.get = function() {
            var iThisIndx;
            for (var sKey in oStorage) {
              iThisIndx = aKeys.indexOf(sKey);
              if (iThisIndx === -1) {
                oStorage.setItem(sKey, oStorage[sKey]);
              } else {
                aKeys.splice(iThisIndx, 1);
              }
              delete oStorage[sKey];
            }
            for (aKeys; aKeys.length > 0; aKeys.splice(0, 1)) {
              oStorage.removeItem(aKeys[0]);
            }
            for (var aCouple, iKey, nIdx = 0, aCouples = document.cookie.split(/\s*;\s*/); nIdx < aCouples.length; nIdx++) {
              aCouple = aCouples[nIdx].split(/\s*=\s*/);
              if (aCouple.length > 1) {
                oStorage[iKey = unescape(aCouple[0])] = unescape(aCouple[1]);
                aKeys.push(iKey);
              }
            }
            return oStorage;
          };
          this.configurable = false;
          this.enumerable = true;
        })());
      }
    }
  };

  // allows bind support
  this.functionBind = function() {
    // Credit to Douglas Crockford for this bind method
    if (!Function.prototype.bind) {
      Function.prototype.bind = function(oThis) {
        if (typeof this !== "function") {
          // closest thing possible to the ECMAScript 5 internal IsCallable function
          throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }
        var aArgs = Array.prototype.slice.call(arguments, 1),
          fToBind = this,
          fNOP = function() {},
          fBound = function() {
            return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
          };
        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();
        return fBound;
      };
    }
  };

  // startup
  this.html5();
  this.arrayIndexOf();
  this.arrayIsArray();
  this.arrayMap();
  this.querySelectorAll();
  this.addEventListener();
  this.consoleLog();
  this.objectCreate();
  this.stringTrim();
  this.localStorage();
  this.functionBind();

};

// return as a require.js module
if (typeof define != 'undefined') define([], function () { return polyfills });
if (typeof module != 'undefined') module.exports = polyfills;

/*
	Source:
	van Creij, Maurice (2018). "requests.js: A library of useful functions to ease working with AJAX and JSON.", http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/


// establish the class
var requests = {

	// adds a random argument to the AJAX URL to bust the cache
	randomise : function (url) {
		return url.replace('?', '?time=' + new Date().getTime() + '&');
	},

	// perform all requests in a single application
	all : function (queue, results) {
		// set up storage for the results
		var _this = this, _url = queue.urls[queue.urls.length - 1], _results = results || [];
		// perform the first request in the queue
		this.send({
			url : _url,
			post : queue.post || null,
			contentType : queue.contentType || 'text/xml',
			timeout : queue.timeout || 4000,
			onTimeout : queue.onTimeout || function (reply) { return reply; },
			onProgress : function (reply) {
				// report the fractional progress of the whole queue
				queue.onProgress({});
			},
			onFailure : queue.onFailure || function (reply) { return reply; },
			onSuccess : function (reply) {
				// store the results
				_results.push({
					'url' : _url,
					'response' : reply.response,
					'responseText' : reply.responseText,
					'responseXML' : reply.responseXML,
					'status' : reply.status,
				});
				// pop one request off the queue
				queue.urls.length = queue.urls.length - 1;
				// if there are more items in the queue
				if (queue.urls.length > 0) {
					// perform the next request
					_this.all(queue, _results);
				// else
				} else {
					// trigger the success handler
					queue.onSuccess(_results);
				}
			}
		});
	},

	// create a request that is compatible with the browser
	create : function (properties) {
		var serverRequest,
			_this = this;
		// create a microsoft only xdomain request
		if (window.XDomainRequest && properties.xdomain) {
			// create the request object
			serverRequest = new XDomainRequest();
			// add the event handler(s)
			serverRequest.onload = function () { properties.onSuccess(serverRequest, properties); };
			serverRequest.onerror = function () { properties.onFailure(serverRequest, properties); };
			serverRequest.ontimeout = function () { properties.onTimeout(serverRequest, properties); };
			serverRequest.onprogress = function () { properties.onProgress(serverRequest, properties); };
		}
		// or create a standard HTTP request
		else if (window.XMLHttpRequest) {
			// create the request object
			serverRequest = new XMLHttpRequest();
			// set the optional timeout if available
			if (serverRequest.timeout) { serverRequest.timeout = properties.timeout || 0; }
			// add the event handler(s)
			serverRequest.ontimeout = function () { properties.onTimeout(serverRequest, properties); };
			serverRequest.onreadystatechange = function () { _this.update(serverRequest, properties); };
		}
		// or use the fall back
		else {
			// create the request object
			serverRequest = new ActiveXObject("Microsoft.XMLHTTP");
			// add the event handler(s)
			serverRequest.onreadystatechange = function () { _this.update(serverRequest, properties); };
		}
		// return the request object
		return serverRequest;
	},

	// perform and handle an AJAX request
	send : function (properties) {
		// add any event handlers that weren't provided
		properties.onSuccess = properties.onSuccess || function () {};
		properties.onFailure = properties.onFailure || function () {};
		properties.onTimeout = properties.onTimeout || function () {};
		properties.onProgress = properties.onProgress || function () {};
		// create the request object
		var serverRequest = this.create(properties);
		// if the request is a POST
		if (properties.post) {
			try {
				// open the request
				serverRequest.open('POST', properties.url, true);
				// set its header
				serverRequest.setRequestHeader("Content-type", properties.contentType || "application/x-www-form-urlencoded");
				// send the request, or fail gracefully
				serverRequest.send(properties.post);
			}
			catch (errorMessage) { properties.onFailure({ readyState : -1, status : -1, statusText : errorMessage }); }
		// else treat it as a GET
		} else {
			try {
				// open the request
				serverRequest.open('GET', this.randomise(properties.url), true);
				// send the request
				serverRequest.send();
			}
			catch (errorMessage) { properties.onFailure({ readyState : -1, status : -1, statusText : errorMessage }); }
		}
	},

	// regularly updates the status of the request
	update : function (serverRequest, properties) {
		// react to the status of the request
		if (serverRequest.readyState === 4) {
			switch (serverRequest.status) {
				case 200 :
					properties.onSuccess(serverRequest, properties);
					break;
				case 304 :
					properties.onSuccess(serverRequest, properties);
					break;
				default :
					properties.onFailure(serverRequest, properties);
			}
		} else {
			properties.onProgress(serverRequest, properties);
		}
	},

	// turns a string back into a DOM object
	deserialize : function (text) {
		var parser, xmlDoc;
		// if the DOMParser exists
		if (window.DOMParser) {
			// parse the text as an XML DOM
			parser = new DOMParser();
			xmlDoc = parser.parseFromString(text, "text/xml");
		// else assume this is Microsoft doing things differently again
		} else {
			// parse the text as an XML DOM
			xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.async = "false";
			xmlDoc.loadXML(text);
		}
		// return the XML DOM object
		return xmlDoc;
	},

	// turns a json string into a JavaScript object
	decode : function (text) {
		var object;
		object = {};
		// if JSON.parse is available
		if (typeof JSON !== 'undefined' && typeof JSON.parse !== 'undefined') {
			// use it
			object = JSON.parse(text);
		// if jQuery is available
		} else if (typeof jQuery !== 'undefined') {
			// use it
			object = jQuery.parseJSON(text);
		}
		// return the object
		return object;
	}

};

// return as a require.js module
if (typeof define != 'undefined') define([], function () { return requests });
if (typeof module != 'undefined') module.exports = requests;

toGeoJSON = (function() {
    'use strict';

    var removeSpace = (/\s*/g),
        trimSpace = (/^\s*|\s*$/g),
        splitSpace = (/\s+/);
    // generate a short, numeric hash of a string
    function okhash(x) {
        if (!x || !x.length) return 0;
        for (var i = 0, h = 0; i < x.length; i++) {
            h = ((h << 5) - h) + x.charCodeAt(i) | 0;
        } return h;
    }
    // all Y children of X
    function get(x, y) { return x.getElementsByTagName(y); }
    function attr(x, y) { return x.getAttribute(y); }
    function attrf(x, y) { return parseFloat(attr(x, y)); }
    // one Y child of X, if any, otherwise null
    function get1(x, y) { var n = get(x, y); return n.length ? n[0] : null; }
    // https://developer.mozilla.org/en-US/docs/Web/API/Node.normalize
    function norm(el) { if (el.normalize) { el.normalize(); } return el; }
    // cast array x into numbers
    function numarray(x) {
        for (var j = 0, o = []; j < x.length; j++) o[j] = parseFloat(x[j]);
        return o;
    }
    function clean(x) {
        var o = {};
        for (var i in x) if (x[i]) o[i] = x[i];
        return o;
    }
    // get the content of a text node, if any
    function nodeVal(x) {
        if (x) { norm(x); }
        return (x && x.firstChild && x.firstChild.nodeValue) || '';
    }
    // get one coordinate from a coordinate array, if any
    function coord1(v) { return numarray(v.replace(removeSpace, '').split(',')); }
    // get all coordinates from a coordinate array as [[],[]]
    function coord(v) {
        var coords = v.replace(trimSpace, '').split(splitSpace),
            o = [];
        for (var i = 0; i < coords.length; i++) {
            o.push(coord1(coords[i]));
        }
        return o;
    }
    function coordPair(x) {
        var ll = [attrf(x, 'lon'), attrf(x, 'lat')],
            ele = get1(x, 'ele');
        if (ele) ll.push(parseFloat(nodeVal(ele)));
        return ll;
    }

    // create a new feature collection parent object
    function fc() {
        return {
            type: 'FeatureCollection',
            features: []
        };
    }

    var serializer;
    if (typeof XMLSerializer !== 'undefined') {
        serializer = new XMLSerializer();
    // only require xmldom in a node environment
    } else if (typeof exports === 'object' && typeof process === 'object' && !process.browser) {
        serializer = new (require('xmldom').XMLSerializer)();
    }
    function xml2str(str) { return serializer.serializeToString(str); }

    var t = {
        kml: function(doc, o) {
            o = o || {};

            var gj = fc(),
                // styleindex keeps track of hashed styles in order to match features
                styleIndex = {},
                // atomic geospatial types supported by KML - MultiGeometry is
                // handled separately
                geotypes = ['Polygon', 'LineString', 'Point', 'Track'],
                // all root placemarks in the file
                placemarks = get(doc, 'Placemark'),
                styles = get(doc, 'Style');

            for (var k = 0; k < styles.length; k++) {
                styleIndex['#' + attr(styles[k], 'id')] = okhash(xml2str(styles[k])).toString(16);
            }
            for (var j = 0; j < placemarks.length; j++) {
                gj.features = gj.features.concat(getPlacemark(placemarks[j]));
            }
            function kmlColor(v) {
                var color, opacity;
                v = v || "";
                if (v.substr(0, 1) === "#") v = v.substr(1);
                if (v.length === 6 || v.length === 3) color = v;
                if (v.length === 8) {
                    opacity = parseInt(v.substr(0, 2), 16) / 255;
                    color = v.substr(2);
                }
                return [color, isNaN(opacity) ? undefined : opacity];
            }
            function gxCoord(v) { return numarray(v.split(' ')); }
            function gxCoords(root) {
                var elems = get(root, 'coord', 'gx'), coords = [];
                for (var i = 0; i < elems.length; i++) coords.push(gxCoord(nodeVal(elems[i])));
                return coords;
            }
            function getGeometry(root) {
                var geomNode, geomNodes, i, j, k, geoms = [];
                if (get1(root, 'MultiGeometry')) return getGeometry(get1(root, 'MultiGeometry'));
                if (get1(root, 'MultiTrack')) return getGeometry(get1(root, 'MultiTrack'));
                for (i = 0; i < geotypes.length; i++) {
                    geomNodes = get(root, geotypes[i]);
                    if (geomNodes) {
                        for (j = 0; j < geomNodes.length; j++) {
                            geomNode = geomNodes[j];
                            if (geotypes[i] == 'Point') {
                                geoms.push({
                                    type: 'Point',
                                    coordinates: coord1(nodeVal(get1(geomNode, 'coordinates')))
                                });
                            } else if (geotypes[i] == 'LineString') {
                                geoms.push({
                                    type: 'LineString',
                                    coordinates: coord(nodeVal(get1(geomNode, 'coordinates')))
                                });
                            } else if (geotypes[i] == 'Polygon') {
                                var rings = get(geomNode, 'LinearRing'),
                                    coords = [];
                                for (k = 0; k < rings.length; k++) {
                                    coords.push(coord(nodeVal(get1(rings[k], 'coordinates'))));
                                }
                                geoms.push({
                                    type: 'Polygon',
                                    coordinates: coords
                                });
                            } else if (geotypes[i] == 'Track') {
                                geoms.push({
                                    type: 'LineString',
                                    coordinates: gxCoords(geomNode)
                                });
                            }
                        }
                    }
                }
                return geoms;
            }
            function getPlacemark(root) {
                var geoms = getGeometry(root), i, properties = {},
                    name = nodeVal(get1(root, 'name')),
                    styleUrl = nodeVal(get1(root, 'styleUrl')),
                    description = nodeVal(get1(root, 'description')),
                    timeSpan = get1(root, 'TimeSpan'),
                    extendedData = get1(root, 'ExtendedData'),
                    lineStyle = get1(root, 'LineStyle'),
                    polyStyle = get1(root, 'PolyStyle');

                if (!geoms.length) return [];
                if (name) properties.name = name;
                if (styleUrl && styleIndex[styleUrl]) {
                    properties.styleUrl = styleUrl;
                    properties.styleHash = styleIndex[styleUrl];
                }
                if (description) properties.description = description;
                if (timeSpan) {
                    var begin = nodeVal(get1(timeSpan, 'begin'));
                    var end = nodeVal(get1(timeSpan, 'end'));
                    properties.timespan = { begin: begin, end: end };
                }
                if (lineStyle) {
                    var linestyles = kmlColor(nodeVal(get1(lineStyle, 'color'))),
                        color = linestyles[0],
                        opacity = linestyles[1],
                        width = parseFloat(nodeVal(get1(lineStyle, 'width')));
                    if (color) properties.stroke = color;
                    if (!isNaN(opacity)) properties['stroke-opacity'] = opacity;
                    if (!isNaN(width)) properties['stroke-width'] = width;
                }
                if (polyStyle) {
                    var polystyles = kmlColor(nodeVal(get1(polyStyle, 'color'))),
                        pcolor = polystyles[0],
                        popacity = polystyles[1],
                        fill = nodeVal(get1(polyStyle, 'fill')),
                        outline = nodeVal(get1(polyStyle, 'outline'));
                    if (pcolor) properties.fill = pcolor;
                    if (!isNaN(popacity)) properties['fill-opacity'] = popacity;
                    if (fill) properties['fill-opacity'] = fill === "1" ? 1 : 0;
                    if (outline) properties['stroke-opacity'] = outline === "1" ? 1 : 0;
                }
                if (extendedData) {
                    var datas = get(extendedData, 'Data'),
                        simpleDatas = get(extendedData, 'SimpleData');

                    for (i = 0; i < datas.length; i++) {
                        properties[datas[i].getAttribute('name')] = nodeVal(get1(datas[i], 'value'));
                    }
                    for (i = 0; i < simpleDatas.length; i++) {
                        properties[simpleDatas[i].getAttribute('name')] = nodeVal(simpleDatas[i]);
                    }
                }
                return [{
                    type: 'Feature',
                    geometry: (geoms.length === 1) ? geoms[0] : {
                        type: 'GeometryCollection',
                        geometries: geoms
                    },
                    properties: properties
                }];
            }
            return gj;
        },
        gpx: function(doc, o) {
            var i,
                tracks = get(doc, 'trk'),
                routes = get(doc, 'rte'),
                waypoints = get(doc, 'wpt'),
                // a feature collection
                gj = fc();
            for (i = 0; i < tracks.length; i++) {
                gj.features.push(getTrack(tracks[i]));
            }
            for (i = 0; i < routes.length; i++) {
                gj.features.push(getRoute(routes[i]));
            }
            for (i = 0; i < waypoints.length; i++) {
                gj.features.push(getPoint(waypoints[i]));
            }
            function getPoints(node, pointname) {
                var pts = get(node, pointname), line = [];
                for (var i = 0; i < pts.length; i++) {
                    line.push(coordPair(pts[i]));
                }
                return line;
            }
            function getTrack(node) {
                var segments = get(node, 'trkseg'), track = [];
                for (var i = 0; i < segments.length; i++) {
                    track.push(getPoints(segments[i], 'trkpt'));
                }
                return {
                    type: 'Feature',
                    properties: getProperties(node),
                    geometry: {
                        type: track.length === 1 ? 'LineString' : 'MultiLineString',
                        coordinates: track.length === 1 ? track[0] : track
                    }
                };
            }
            function getRoute(node) {
                return {
                    type: 'Feature',
                    properties: getProperties(node),
                    geometry: {
                        type: 'LineString',
                        coordinates: getPoints(node, 'rtept')
                    }
                };
            }
            function getPoint(node) {
                var prop = getProperties(node);
                prop.sym = nodeVal(get1(node, 'sym'));
                return {
                    type: 'Feature',
                    properties: prop,
                    geometry: {
                        type: 'Point',
                        coordinates: coordPair(node)
                    }
                };
            }
            function getProperties(node) {
                var meta = ['name', 'desc', 'author', 'copyright', 'link',
                            'time', 'keywords'],
                    prop = {},
                    k;
                for (k = 0; k < meta.length; k++) {
                    prop[meta[k]] = nodeVal(get1(node, meta[k]));
                }
                return clean(prop);
            }
            return gj;
        }
    };
    return t;
})();

if (typeof module !== 'undefined') module.exports = toGeoJSON;

/*
	Sydney Train Walks - About View
*/

// create the constructor if needed
var SydneyTrainWalks = SydneyTrainWalks || function() {};

// extend the constructor
SydneyTrainWalks.prototype.About = function(parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.config.extend({
		'about': document.querySelector('.about')
	});

	// METHODS

	this.init = function() {
		
		// return the object
		return this;
	};

	// EVENTS


};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = SydneyTrainWalks.About;
}

/*
	Sydney Train Walks - Footer Navigation
*/

// create the constructor if needed
var SydneyTrainWalks = SydneyTrainWalks || function() {};

// extend the constructor
SydneyTrainWalks.prototype.Busy = function(parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.config.extend({
		'appView': document.querySelector('#appView')
	});

	// METHODS

	this.init = function() {
		// return the object
		return this;
	};

	this.show = function() {
		// remove the cover page
		this.config.appView.className = this.config.appView.className.replace(/-ready/g, '-busy');
	};

	this.hide = function() {
		// remove the cover page
		this.config.appView.className = this.config.appView.className.replace(/-busy/g, '-ready');
	};

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = SydneyTrainWalks.Busy;
}

/*
	Sydney Train Walks - Details View
*/

// create the constructor if needed
var SydneyTrainWalks = SydneyTrainWalks || function() {};

// extend the constructor
SydneyTrainWalks.prototype.Details = function(parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.returnTo = 'guide';

	this.config.extend({
		'title': document.querySelector('.subtitle > h2'),
		'guide': document.querySelector('.guide'),
		'localmap': document.querySelector('.localmap'),
		'return': document.querySelector('.localmap-return'),
		'wall': document.querySelector('.photowall'),
		'titleTemplate': document.getElementById('title-template'),
		'thumbnailTemplate': document.getElementById('thumbnail-template'),
		'wallTemplate': document.getElementById('wall-template'),
		'creditTemplate': document.getElementById('credit-template')
	});

	// METHODS

	this.init = function() {
		// return the object
		return this;
	};

	this.update = function(id) {
		// update all the elements with the id
		this.updateTitle(id);
		this.updateGuide(id);
		this.updateMap(id);
		this.updateWall(id);
	};

	this.updateTitle = function(id) {
		// fill in the title template
		var markers = GuideData[id].markers;
		this.config.title.innerHTML = this.config.titleTemplate.innerHTML
			.replace(/{startTransport}/g, markers[0].type)
			.replace(/{startLocation}/g, markers[0].location)
			.replace(/{walkLocation}/g, GuideData[id].location)
			.replace(/{walkDuration}/g, GuideData[id].duration)
			.replace(/{walkLength}/g, GuideData[id].length)
			.replace(/{endTransport}/g, markers[markers.length - 1].type)
			.replace(/{endLocation}/g, markers[markers.length - 1].location);
		// add the onclick handler
		this.config.title.onclick = function(evt) { document.location.replace('./'); };
	};

	this.updateGuide = function(id) {
		// gather the information
		var _this = this;
		var description = '<p>' + GuideData[id].description.join('</p><p>') + '</p>';
		var duration = GuideData[id].duration;
		var length = GuideData[id].length;
		var gpx = this.config.gpx.replace(/{id}/g, id);
		var markers = GuideData[id].markers;
		var there = '<p>' + markers[0].description + '</p>';
		var back = '<p>' + markers[markers.length - 1].description + '</p>';
		var landmarks = this.updateLandmarks(id);
		// fill the guide with information
		this.config.guide.innerHTML = this.config.guideTemplate.innerHTML
			.replace(/{description}/g, description)
			.replace(/{duration}/g, duration)
			.replace(/{length}/g, length)
			.replace(/{gpx}/g, gpx)
			.replace(/{there}/g, there)
			.replace(/{back}/g, back)
			.replace(/{landmarks}/g, landmarks);
		// add event handlers for the locator icons
		var buttons = document.querySelectorAll('.guide .guide-locate');
		for (var a = 0, b = buttons.length; a < b; a += 1) {
			buttons[a].addEventListener('click', this.onLocate.bind(this, buttons[a]));
		}
		// start the script for the image viewer
		this.config.photocylinder = new Photocylinder({
			'elements': document.querySelectorAll('.guide .cylinder-image'),
			'container': this.config.guide,
			'spherical': /fov360|\d{3}_r\d{6}/i,
			'cylindrical': /fov180/i,
			'slicer': this.config.slice,
			'idle': 0.1,
			'opened': function(link) {
				_this.returnTo = 'guide';
				_this.config.photomap.indicate(link);
				return true;
			},
			'located': function(link) {
				_this.returnTo = 'guide';
				_this.config.photomap.indicate(link);
				document.body.className = document.body.className.replace(/screen-photos|screen-guide/, 'screen-map');
			},
			'closed': function() {
				_this.config.photomap.unindicate();
			}
		});
	};

	this.updateLandmarks = function(id) {
		// gather the information
		var prefix = (GuideData[id].assets) ? GuideData[id].assets.prefix : id;
		var landmark, landmarks = "";
		var thumbnailTemplate = this.config.thumbnailTemplate.innerHTML;
		// fill the guide with landmarks
		GuideData[id].markers.map(function (marker) {
			// it is a landmark if it has a photo
			if (marker.photo) {
				// get the description
				landmark = thumbnailTemplate
					.replace(/{id}/g, prefix)
					.replace(/{src}/g, marker.photo.toLowerCase())
					.replace(/{description}/g, marker.description);
				// add extra markup for optional landmarks
				if (marker.optional) { landmarks += '<div class="guide-optional">' + landmark + '</div>'; }
				else if (marker.detour) { landmarks += '<div class="guide-detour">' + landmark + '</div>'; }
				else if (marker.attention) { landmarks += '<div class="guide-attention">' + landmark + '</div>'; }
				else { landmarks += landmark; }
			}
		});
		// return the landmarks
		return landmarks;
	};

	this.updateMap = function(id) {
		// get the properties if this is a segment of another walk
		var prefix = (GuideData[id].assets && GuideData[id].assets.prefix)
			? GuideData[id].assets.prefix
			: id;
		// add the click event to the map back button
		this.config.return.addEventListener('click', this.onReturnFromMap.bind(this));
		// clear the old map if active
		if (this.config.photomap) {
			this.config.photomap.stop();
		}
		// start the map
		this.config.photomap = new Localmap({
			'container': this.config.localmap,
			'legend': null,
			'assetsUrl': './inc/medium/' + prefix + '/',
			'markersUrl': './inc/img/marker-{type}.svg',
			'guideUrl': './inc/guides/' + id + '.json',
			'routeUrl': './inc/gpx/' + id + '.gpx',
			'mapUrl': './inc/maps/' + prefix + '.jpg',
			'exifUrl': this.config.exif,
			'guideData': GuideData[id],
			'routeData': GpxData[id],
			'exifData': ExifData[prefix],
			'creditsTemplate': 'Maps &copy; <a href="http://www.4umaps.eu/mountain-bike-hiking-bicycle-outdoor-topographic-map.htm" target="_blank">4UMaps</a>, Data &copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> and contributors, CC BY-SA'
		});
	};

	this.updateWall = function(id) {
		var _this = this,
			src,
			srcs = [],
			wallTemplate = this.config.wallTemplate.innerHTML,
			wallHtml = '';
		// reset the wall
		this.config.wall.className = this.config.wall.className.replace(/-active/g, '-passive');
		// get the properties if this is a segment of another walk
		var prefix = (GuideData[id].assets && GuideData[id].assets.prefix)
			? GuideData[id].assets.prefix
			: id;
		var start = (GuideData[id].assets && GuideData[id].assets.start)
			? GuideData[id].assets.start
			: 0;
		var end = (GuideData[id].assets && GuideData[id].assets.end)
			? GuideData[id].assets.end + 1
			: null;
		// get the photos
		for (src in ExifData[prefix]) {
			srcs.push(src);
		}
		// create a list of photos
		for (var a = start, b = end || srcs.length; a < b; a += 1) {
			wallHtml += wallTemplate
				.replace(/{id}/g, prefix)
				.replace(/{src}/g, srcs[a]);
		}
		// fill the wall with the photos
		this.config.wall.innerHTML = '<ul>' + wallHtml + '</ul>';
		// start the script for the wall
		this.config.photowall = new Photowall({
			'element': this.config.wall
		});
		// start the script for the image viewer
		this.config.photocylinder = new Photocylinder({
			'elements': document.querySelectorAll('.photowall .cylinder-image'),
			'container': this.config.wall,
			'spherical': /fov360|\d{3}_r\d{6}/i,
			'cylindrical': /fov180/i,
			'slicer': this.config.slice,
			'idle': 0.1,
			'opened': function(link) {
				_this.returnTo = 'photos';
				_this.config.photomap.indicate(link);
				return true;
			},
			'located': function(link) {
				_this.returnTo = 'photos';
				_this.config.photomap.indicate(link);
				document.body.className = document.body.className.replace(/screen-photos|screen-guide/, 'screen-map');
			},
			'closed': function() {
				_this.config.photomap.unindicate();
			}
		});
	};

	// EVENTS

	this.onLocate = function(button, evt) {
		console.log('onLocate', button);
		// cancel the click
		evt.preventDefault();
		// remember where to return to
		this.returnTo = 'guide';
		// as the map to show the location
		this.config.photomap.indicate(button);
		// show the map screen
		document.body.className = document.body.className.replace(/screen-photos|screen-guide/, 'screen-map');
	};

	this.onReturnFromMap = function(evt) {
		// cancel the click
		evt.preventDefault();
		// return from the map
		document.body.className = document.body.className.replace(/screen-map/, 'screen-' + this.returnTo);
	};

	this.onSignExpanded = function(sign, signs, evt) {
		// get the current size
		var isLong = sign.className.match(/-long/);
		// reset all signs
		for (var a = 0, b = signs.length; a < b; a += 1) {
			// add a click event handler
			signs[a].className = signs[a].className.replace('-long', '-short');
		}
		// expand this sign
		if (!isLong) {
			sign.className = sign.className.replace('-short', '-long');
		}
	};

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = SydneyTrainWalks.Details;
}

/*
	Sydney Train Walks - Footer Navigation
*/

// create the constructor if needed
var SydneyTrainWalks = SydneyTrainWalks || function() {};

// extend the constructor
SydneyTrainWalks.prototype.Footer = function(parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.config.extend({
		'origin': 'menu',
		'footer': document.querySelector('.toolbar'),
		'footerTemplate': document.getElementById('footer-template')
	});

	// METHODS

	this.init = function() {
		// build the footer with a blank id
		this.update(null);
		// add a global click handler to the footer
		this.config.footer.addEventListener('click', this.onFooterClicked.bind(this));
		// add the event handler for the browser back button
		document.addEventListener("backbutton", this.onBackButton.bind(this));
		// return the object
		return this;
	};

	this.update = function() {
		// fill the menu with options
		this.config.footer.innerHTML = this.config.footerTemplate.innerHTML;
	};

	// EVENTS

	this.onBackButton = function(evt) {
		// if this is not an entry page
		console.log("onBackButton", document.body.className);
		if (!/menu|overview/.test(document.body.className)) {
			// cancel the back button
			evt.preventDefault();
			// return to the origin page
			window.localStorage.removeItem('id');
			window.localStorage.removeItem('mode');
			document.body.className = 'screen-' + this.config.origin;
		// if this is a cordova app
		} else if (navigator.app && navigator.app.exitApp) {
			// close the app
			navigator.app.exitApp();
		}
	}

	this.onFooterClicked = function(evt) {
		// get the target of the click
		var target = evt.target || evt.srcElement,
			id = target.getAttribute('id');
		// if a button was clicked
		if (id && id.match(/footer-to-/)) {
			// cancel any clicks
			evt.preventDefault();
			// if this is a menu page
			if (id.match(/-menu|-overview|-about/)) {
				// reset the local storage when returning to the menu
				window.localStorage.removeItem('id');
				window.localStorage.removeItem('mode');
				// remember what menu screen was the origin
				this.config.origin = id.substr(10);
			}
			// apply the mode to the body
			document.body.className = 'screen-' + id.substr(10);
		}
	};
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = SydneyTrainWalks.Footer;
}

/*
	Sydney Train Walks - Index View
*/

// create the constructor if needed
var SydneyTrainWalks = SydneyTrainWalks || function() {};

// extend the constructor
SydneyTrainWalks.prototype.Index = function(parent) {

	// PROPERTIES

	this.parent = parent;
	this.searchFor = '';
	this.searchDelay = null;
	this.sortBy = 'length';
	this.config = parent.config;
	this.config.extend({
		'sorting': document.getElementById('sorting'),
		'menu': document.querySelector('.navigation > menu'),
		'titleTemplate': document.getElementById('title-template'),
		'menuTemplate': document.getElementById('menu-template'),
		'guideTemplate': document.getElementById('guide-template')
	});

	// METHODS

	this.init = function() {
		var input = this.config.sorting.getElementsByTagName('input')[0],
			select = this.config.sorting.getElementsByTagName('select')[0];
		// build the menu
		this.update();
		// add the global click handler to the menu
		this.config.menu.addEventListener('click', this.onMenuClicked.bind(this));
		// event handler for sorting options
		input.addEventListener('focus', this.onSearchFocus.bind(this, input));
		input.addEventListener('blur', this.onSearchChanged.bind(this, input));
		input.addEventListener('keyup', this.onSearchChanged.bind(this, input));
		input.addEventListener('change', this.onSearchChanged.bind(this, input));
		select.addEventListener('focus', this.onSortingFocus.bind(this, select));
		select.addEventListener('change', this.onSortingSelected.bind(this, select));
		// event handler for the form
		input.parentNode.parentNode.addEventListener('submit', this.onSearchSubmitted.bind(this, input));
		// add the reset button to browsers that need it
		if (!/MSIE/i.test(navigator.userAgent)) {
			input.addEventListener('click', this.onSearchReset.bind(this, input));
		} else {
			input.style.backgroundImage = 'none';
		}
		// return the object
		return this;
	};

	this.update = function() {
		var id, markers,
			menuTemplate = this.config.menuTemplate.innerHTML,
			titleTemplate = this.config.titleTemplate.innerHTML,
			menuHtml = '',
			titleHtml = '';
		// sort the guides
		var searched = this.searchGuide(GuideData, this.searchFor);
		var sorted = this.sortGuide(GuideData, this.sortBy);
		// for every available guide
		for (var a = 0, b = sorted.length; a < b; a += 1) {
			id = sorted[a];
			// if the id occurs in the search results
			if (searched.indexOf(id) > -1) {
				markers = GuideData[id].markers;
				titleHtml = titleTemplate
					.replace(/{startTransport}/g, markers[0].type)
					.replace(/{startLocation}/g, markers[0].location)
					.replace(/{walkLocation}/g, GuideData[id].location)
					.replace(/{walkDuration}/g, GuideData[id].duration)
					.replace(/{walkLength}/g, GuideData[id].length)
					.replace(/{endTransport}/g, markers[markers.length - 1].type)
					.replace(/{endLocation}/g, markers[markers.length - 1].location);
				menuHtml += menuTemplate
					.replace(/{id}/g, id)
					.replace(/{title}/g, titleHtml);
			}
		}
		// fill the menu with options
		this.config.menu.innerHTML = (menuHtml === '')
			? '<li class="no-results">No results...</li>'
			: menuHtml;
	};

	this.searchGuide = function(guide, keyword) {
		var id,
			locations,
			searched = [],
			search = new RegExp(keyword, 'i');
		// create an array of guides
		for (id in guide) {
			// fetch the locations to search for
			locations = guide[id].location;
			guide[id].markers.map(function(marker) { if (marker.location) locations += ' ' + marker.location; });
			// add the guide if it includes the keyword
			if (search.test(locations)) {
				searched.push(id);
			}
		}
		// return the searched guides
		return searched;
	};

	this.sortGuide = function(guide, option) {
		var id,
			unsorted = [];
		sorted = [];
		// create an array of guides
		for (id in guide) {
			unsorted.push(id);
		}
		// sort the array by the prefered method
		switch (option) {
			case 'start':
				sorted = unsorted.sort(function(a, b) {
					a = guide[a].markers[0].location;
					b = guide[b].markers[0].location;
					return (a < b)
						? -1
						: 1;
				});
				break;
			case 'finish':
				sorted = unsorted.sort(function(a, b) {
					a = guide[a].markers[markers.length - 1].location;
					b = guide[b].markers[markers.length - 1].location;
					return (a < b)
						? -1
						: 1;
				});
				break;
			case 'region':
				sorted = unsorted.sort(function(a, b) {
					a = guide[a].location;
					b = guide[b].location;
					return (a < b)
						? -1
						: 1;
				});
				break;
			case 'duration':
				sorted = unsorted.sort(function(a, b) {
					a = guide[a].duration;
					b = guide[b].duration;
					return a - b;
				});
				break;
			case 'length':
				sorted = unsorted.sort(function(a, b) {
					a = guide[a].length;
					b = guide[b].length;
					return a - b;
				});
				break;
			case 'rain':
				sorted = unsorted.map(function(a) {
					return (guide[a].rain) ? a : null;
				});
				break;
			case 'fireban':
				sorted = unsorted.map(function(a) {
					return (guide[a].fireban) ? a : null;
				});
				break;
			default:
				sorted = unsorted;
		}
		// return the ordered guides
		return sorted;
	};

	// EVENTS

	this.onSearchFocus = function(input, evt) {
		// reset the previous state
		window.localStorage.setItem('id', null);
		window.localStorage.setItem('mode', null);
	};

	this.onSearchReset = function(input, evt) {
		// if the  right side of the element is clicked
		if (input.offsetWidth - evt.layerX < 32) {
			// cancel the click
			evt.preventDefault();
			// reset the search
			input.blur();
			input.value = '';
			this.searchFor = '';
			this.update();
		}
	};

	this.onSearchSubmitted = function(input, evt) {
		// cancel the submit
		evt.preventDefault();
		// perform the search
		this.searchFor = input.value.trim();
		this.update();
		// deselect the input field
		input.blur();
	};

	this.onSearchChanged = function(input, evt) {
		var _this = this;
		// wait for the typing to pause
		clearTimeout(_this.searchDelay);
		this.searchDelay = setTimeout(function() {
			// perform the search
			_this.searchFor = input.value.trim();
			_this.update();
		}, 700);
	};

	this.onSortingFocus = function(input, evt) {
		// reset the previous state
		window.localStorage.setItem('id', null);
		window.localStorage.setItem('mode', null);
	};

	this.onSortingSelected = function(select, evt) {
		// perform the sort
		this.sortBy = select.value;
		this.update();
	};

	this.onMenuClicked = function(evt) {
		// cancel the click
		evt.preventDefault();
		// get the target of the click
		var id,
			target = evt.target || evt.srcElement;
		// get the id of the click
		while (!id) {
			id = target.getAttribute('data-id');
			target = target.parentNode;
		}
		// update the app for this id
		this.parent.update(id, 'map');
	};

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = SydneyTrainWalks.Index;
}

/*
	Sydney Train Walks
*/

// create the constructor if needed
var SydneyTrainWalks = SydneyTrainWalks || function() {};

// extend the constructor
SydneyTrainWalks.prototype.Main = function(config, context) {

	// PROPERTIES

	this.context = context;
	this.config = config;

	this.config.extend = function(properties) {
		for (var name in properties) {
			this[name] = properties[name];
		}
	};

	// COMPONENTS

	this.busy = new context.Busy(this).init();
	this.index = new context.Index(this).init();
	// TODO: generate an overview using localmap instead of leaflet
	//this.overview = new context.Overview(this).init();
	this.details = new context.Details(this).init();
	this.about = new context.About(this).init();
	this.footer = new context.Footer(this).init();

	// METHODS

	this.init = function() {
		// notice if this is iOS
		var parent = document.getElementsByTagName('html')[0];
		parent.className = (navigator.userAgent.match(/ipad;|iphone|ipod touch;/i))
			? parent.className.replace('ios-false', 'ios-true')
			: parent.className.replace('ios-true', 'ios-false');
		// recover the previous state
		var storedId = window.localStorage.getItem('id');
		var storedMode = window.localStorage.getItem('mode') || 'map';
		// recover the state from the url
		storedId = this.getQuery('id') || storedId ;
		storedMode = this.getQuery('mode') || storedMode;
		// restore the previous state
		if (storedId && storedMode && GuideData[storedId]) {
			// update the interface to the stored state
			this.update(storedId, storedMode);
		}
		// remove busy screen after a redraw
		setTimeout(this.busy.hide.bind(this), 300);
		// return the object
		return this;
	};

	this.update = function(id, mode) {
		// store the current state
		window.localStorage.setItem('id', id);
		window.localStorage.setItem('mode', mode);
		// update the body class
		document.body.className = 'screen-' + mode;
		// update the details
		this.details.update(id);
		// update the footer
		this.footer.update(id);
	};

	this.getQuery = function(property) {
		var param = document.location.search.split(property + '=');
		return (param.length > 1) ? param[1].split(/&|#/)[0] : null;
	};

	this.remoteLink = function(evt) {
		var href = evt.target.getAttribute("href");
		if(/^http/i.test(href) && !/.jpg$/i.test(href)) {
			evt.preventDefault();
			window.open(href, '_system', 'location=yes');
		}
	};

	// EVENTS

	document.body.addEventListener("click", this.remoteLink.bind(this));

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = SydneyTrainWalks.Main;
}

/*
	Sydney Train Walks - Overview Map
*/

// create the constructor if needed
var SydneyTrainWalks = SydneyTrainWalks || function() {};

// extend the constructor
SydneyTrainWalks.prototype.Overview = function(parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.overviewMap = null;
	this.overviewMarker = null;
	this.config.extend = function(properties) {
		for (var name in properties) {
			this[name] = properties[name];
		}
	};
	this.config.extend({
		'overview': document.querySelector('.overview'),
		'creditTemplate': document.getElementById('credit-template')
	});

	// METHODS

	this.init = function() {
		var a, b;
		// get the markers from the guide data
		var markers = this.getMarkers();
		// get the routes from the gpx data
		var routes = this.getRoutes();
		// calculate the bounds of the map
		var bounds = this.getBounds(markers);
		// start a map
		var map = L.map(this.config.overview.id);
		// add the scale
		L.control.scale({imperial:false}).addTo(map);
		// add the tiles
		var tiles = L.tileLayer(this.config.onlineTiles, {
			attribution: this.config.creditTemplate.innerHTML,
			errorTileUrl: this.config.missing,
			minZoom: 8,
			maxZoom: 15
		}).addTo(map);
		// add a fallback for offline mode
		tiles.on('tileloadstart', this.onTileFailure.bind(this, this.config.offlineTiles));
		// create an icon
		var icon = L.icon({
			iconUrl: "./inc/img/marker-walk.png",
			iconSize: [28, 28],
			iconAnchor: [14, 28]
		});
		// add the markers
		var marker;
		for (a = 0, b = markers.length; a < b; a += 1) {
			// add the marker with the icon
			marker = L.marker([
				markers[a].lat,
				markers[a].lon
			], {
				'icon': icon,
				'title': markers[a].id
			});
			marker.addTo(map);
			marker.on('click', this.onMarkerClicked.bind(this, markers[a].id));
		}
		// add the routes
		var route;
		for (a = 0, b = routes.length; a < b; a += 1) {
			routes[a].addTo(map);
		};
		// limit the bounds
		map.fitBounds([
			[bounds.minLat, bounds.minLon],
			[bounds.maxLat , bounds.maxLon]
		]);
		map.setMaxBounds([
			[bounds.minLat, bounds.minLon],
			[bounds.maxLat, bounds.maxLon]
		]);
		map.setView([bounds.avgLat, bounds.avgLon], 8);
		// watch the location
		this.watchLocation();
		// return the object
		this.overviewMap = map;
		return this;
	};

	this.getMarkers = function() {
		var markers = [];
		// for every walk
		for (var key in GuideData) {
			// create a marker between the start and end point
			markers.push({
				'lon': GuideData[key].lon,
				'lat': GuideData[key].lat,
				'id': key
			});
		}
		// return the result
		return markers;
	};

	this.getRoutes = function() {
		var routes = [];
		// if the GPX data is available anyway
		if (typeof GpxData != 'undefined') {
			// for every walk
			for (var key in GuideData) {
				// only if this isn't an alias
				if (!GuideData[key].assets) {
					// create a route
					routes.push(
						L.geoJson(GpxData[key], {
							style : function (feature) { return { 'color': '#ff6600', 'weight': 5, 'opacity': 0.66 }; }
						})
					);
				}
			}
		}
		// return the result
		return routes;
	};

	this.getBounds = function(markers) {
		var minLat = 999,
			minLon = 999,
			maxLat = -999,
			maxLon = -999,
			totLat = 0,
			totLon = 0;
		// calculate the bounds of the map
		for (a = 0, b = markers.length; a < b; a += 1) {
			minLon = (markers[a].lon < minLon) ? markers[a].lon : minLon;
			minLat = (markers[a].lat < minLat) ? markers[a].lat : minLat;
			maxLon = (markers[a].lon > maxLon) ? markers[a].lon : maxLon;
			maxLat = (markers[a].lat > maxLat) ? markers[a].lat : maxLat;
			totLat += markers[a].lat;
			totLon += markers[a].lon;
		}
		// return the result
		return {
			'minLat': minLat - 0.3,
			'maxLat': maxLat + 0.3,
			'minLon': minLon - 0.3,
			'maxLon': maxLon + 0.3,
			'avgLat': totLat / markers.length,
			'avgLon': totLon / markers.length
		};
	};

	this.watchLocation = function(evt) {
		// if geolocation is available
		if (navigator.geolocation) {
			// request the position
			navigator.geolocation.watchPosition(
				this.onGeoSuccess(),
				this.onGeoFailure(),
				{ maximumAge : 10000,  timeout : 5000,  enableHighAccuracy : true }
			);
		}
	};

	// EVENTS

	this.onMarkerClicked = function(id, evt) {
		// update the app for this id
		this.parent.update(id, 'map');
	};

	this.onTileFailure = function(url, element) {
		var src = element.tile.getAttribute('src');
		element.tile.setAttribute('data-failed', 'false');
		element.tile.addEventListener('error', function() {
			// if this tile has not failed before
			if (element.tile.getAttribute('data-failed') === 'false') {
				// mark the element as a failure
				element.tile.setAttribute('data-failed', 'true');
				// recover the coordinates
				var parts = src.split('/'),
					length = parts.length,
					z = parseInt(parts[length - 3]),
					x = parseInt(parts[length - 2]),
					y = parseInt(parts[length - 1]);
				// try the local source instead
				element.tile.src = url.replace('{z}', z).replace('{x}', x).replace('{y}', y);
			}
		});
	};

	// geo location events
	this.onGeoSuccess = function () {
		var _this = this;
		return function (geo) {
			// if the marker doesn't exist yet
			if (_this.overviewMarker === null) {
				// create the icon
				var icon = L.icon({
					iconUrl: "./inc/img/marker-location.png",
					iconSize: [28, 28],
					iconAnchor: [14, 28]
				});
				// add the marker with the icon
				_this.overviewMarker = L.marker(
					[geo.coords.latitude, geo.coords.longitude],
					{'icon': icon}
				);
				_this.overviewMarker.addTo(_this.overviewMap);
			} else {
				_this.overviewMarker.setLatLng([geo.coords.latitude, geo.coords.longitude]);
			}
		};
	};

	this.onGeoFailure = function () {
		return function () {
			console.log('geolocation failed');
		};
	};

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = SydneyTrainWalks.Overview;
}

/*
	Sydney Train Walks
*/

// create the constructor if needed
SydneyTrainWalks = SydneyTrainWalks || function() {};

// extend the constructor
SydneyTrainWalks.prototype.init = function(config) {

	// PROPERTIES

	"use strict";

	// METHODS

	this.only = function(config) {
		// start an instance of the script
		return new this.Main(config, this).init();
	};

	this.each = function(config) {
		var _config,
			_context = this,
			instances = [];
		// for all element
		for (var a = 0, b = config.elements.length; a < b; a += 1) {
			// clone the configuration
			_config = Object.create(config);
			// insert the current element
			_config.element = config.elements[a];
			// delete the list of elements from the clone
			delete _config.elements;
			// start a new instance of the object
			instances[a] = new this.Main(_config, _context).init();
		}
		// return the instances
		return instances;
	};

	// START

	return (config.elements)
		? this.each(config)
		: this.only(config);

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = SydneyTrainWalks;
}
