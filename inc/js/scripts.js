/*
	Sydney Train Walks
*/

// establish the class
var SydneyTrainWalks = function(config) {

	// PROPERTIES

	this.config = config || {};
	this.config.extend = function(properties) {
		for (var name in properties) {
			this[name] = properties[name];
		}
	};

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
		// handle external links
		document.body.addEventListener("click", this.remoteLink.bind(this));
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

	// COMPONENTS

	if(config) {
		this.busy = new this.Busy(this);
		this.header = new this.Header(this);
		this.index = new this.Index(this);
		this.overview = new this.Overview(this);
		this.trophies = new this.Trophies(this);
		this.details = new this.Details(this);
		this.about = new this.About(this);
		this.footer = new this.Footer(this);
		this.init();
	}
};

// return as a require.js module
if (typeof define != 'undefined') define([], function() { return SydneyTrainWalks });
if (typeof module != 'undefined') module.exports = SydneyTrainWalks;

// extend the class
SydneyTrainWalks.prototype.About = function(parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.config.extend({
		'about': document.querySelector('.about')
	});

	// METHODS

	this.init = function() {};

	// EVENTS

	if(parent) this.init();

};

// extend the class
SydneyTrainWalks.prototype.Busy = function(parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.config.extend({
		'appView': document.querySelector('#appView')
	});

	// METHODS

	this.init = function() {};

	this.show = function() {
		// remove the cover page
		this.config.appView.className = this.config.appView.className.replace(/-ready/g, '-busy');
	};

	this.hide = function() {
		// remove the cover page
		this.config.appView.className = this.config.appView.className.replace(/-busy/g, '-ready');
	};

  if(parent) this.init();

};

// extend the class
SydneyTrainWalks.prototype.Details = function(parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.returnTo = 'guide';
	this.config.extend({
		'title': document.querySelector('.subtitle > h2'),
		'guide': document.querySelector('.guide'),
		'localmap': document.querySelector('.localmap.directions'),
		'return': document.querySelector('.localmap-return'),
		'wall': document.querySelector('.photowall'),
		'titleTemplate': document.getElementById('title-template'),
		'thumbnailTemplate': document.getElementById('thumbnail-template'),
		'wallTemplate': document.getElementById('wall-template'),
		'creditTemplate': document.getElementById('credit-template')
	});

	// METHODS

	this.init = function() {};

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
			.replace(/{walkDistance}/g, GuideData[id].distance)
			.replace(/{endTransport}/g, markers[markers.length - 1].type)
			.replace(/{endLocation}/g, markers[markers.length - 1].location);
		// add the onclick handler
		this.config.title.onclick = function(evt) {
			evt.preventDefault();
			document.body.className = document.body.className.replace(/screen-photos|screen-guide|screen-map/, 'screen-menu');
		};
	};

	this.updateGuide = function(id) {
		// gather the information
		var _this = this;
		var description = '<p>' + GuideData[id].description.join(' ') + '</p>';
		var duration = GuideData[id].duration;
		var distance = GuideData[id].distance;
		var gpx = this.config.gpx.replace(/{id}/g, id);
		var markers = GuideData[id].markers;
		var there = '<p>' + markers[0].description + '</p>';
		var back = '<p>' + markers[markers.length - 1].description + '</p>';
		var landmarks = this.updateLandmarks(id);
		var updated = GuideData[id].updated;
		var date = new Date(updated).toLocaleDateString('en-AU', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
		// fill the guide with information
		this.config.guide.innerHTML = this.config.guideTemplate.innerHTML
			.replace(/{updated}/g, updated)
			.replace(/{date}/g, date)
			.replace(/{description}/g, description)
			.replace(/{duration}/g, duration)
			.replace(/{distance}/g, distance)
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
				_this.config.guideMap.indicate(link);
				return true;
			},
			'located': function(link) {
				_this.returnTo = 'guide';
				_this.config.guideMap.indicate(link);
				document.body.className = document.body.className.replace(/screen-photos|screen-guide/, 'screen-map');
			},
			'closed': function() {
				_this.config.guideMap.unindicate();
			}
		});
	};

	this.updateLandmarks = function(id) {
		// gather the information
		var prefix = (GuideData[id].alias) ? GuideData[id].alias.key : id;
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
		var prefix = (GuideData[id].alias && GuideData[id].alias.key)
			? GuideData[id].alias.key
			: id;
		// add the click event to the map back button
		this.config.return.addEventListener('click', this.onReturnFromMap.bind(this));
		// clear the old map if active
		if (this.config.guideMap) {
			this.config.guideMap.stop();
		}
		// start the map
		this.config.guideMap = new Localmap({
			'key': id,
			'container': this.config.localmap,
			'legend': null,
			// assets
			'thumbsUrl': this.config.local + '/small/{key}/',
			'photosUrl': this.config.remote + '/medium/{key}/',
			'markersUrl': this.config.local + '/img/marker-{type}.svg',
			'exifUrl': this.config.exif,
			'guideUrl': this.config.local + '/guides/{key}.json',
			'routeUrl': this.config.remote + '/gpx/{key}.gpx',
			'mapUrl': this.config.local + '/maps/{key}.jpg',
      'tilesUrl': this.config.local + '/tiles/{z}/{x}/{y}.jpg',
      'tilesZoom': 15,
			// cache
			'guideData': GuideData,
			'routeData': GpxData,
			'exifData': ExifData,
			// attribution
			'creditsTemplate': this.config.creditTemplate.innerHTML,
			// events
			'checkHotspot': parent.trophies.check.bind(parent.trophies),
			'enterHotspot': parent.trophies.enter.bind(parent.trophies),
			'leaveHotspot': parent.trophies.leave.bind(parent.trophies)
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
		var prefix = (GuideData[id].alias && GuideData[id].alias.key)
			? GuideData[id].alias.key
			: id;
		var start = (GuideData[id].alias && GuideData[id].alias.start)
			? GuideData[id].alias.start
			: 0;
		var end = (GuideData[id].alias && GuideData[id].alias.end)
			? GuideData[id].alias.end + 1
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
				_this.config.guideMap.indicate(link);
				return true;
			},
			'located': function(link) {
				_this.returnTo = 'photos';
				_this.config.guideMap.indicate(link);
				document.body.className = document.body.className.replace(/screen-photos|screen-guide/, 'screen-map');
			},
			'closed': function() {
				_this.config.guideMap.unindicate();
			}
		});
	};

	// EVENTS

	this.onLocate = function(button, evt) {
		// cancel the click
		evt.preventDefault();
		// remember where to return to
		this.returnTo = 'guide';
		// as the map to show the location
		this.config.guideMap.indicate(button);
		// show the map screen
		document.body.className = document.body.className.replace(/screen-photos|screen-guide/, 'screen-map');
	};

	this.onReturnFromMap = function(evt) {
		// cancel the click
		evt.preventDefault();
		// return from the map
		document.body.className = document.body.className.replace(/screen-map/, 'screen-' + this.returnTo);
	};

  if(parent) this.init();

};

// extend the class
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
			if (id.match(/-menu|-overview|-about|-trophies/)) {
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

  if(parent) this.init();

};

// extend the class
SydneyTrainWalks.prototype.Header = function(parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.config.extend({
		'header': document.querySelector('.title a')
	});

	// METHODS

	this.init = function() {
		// add the onclick handler
		this.config.header.onclick = function(evt) {
			evt.preventDefault();
			document.body.className = document.body.className.replace(/screen-photos|screen-guide|screen-map/, 'screen-menu');
		};
	};

  if(parent) this.init();

};

// extend the class
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
			if (searched.indexOf(id) > -1 && id !== '_index') {
				markers = GuideData[id].markers;
				titleHtml = titleTemplate
					.replace(/{startTransport}/g, markers[0].type)
					.replace(/{startLocation}/g, markers[0].location)
					.replace(/{walkLocation}/g, GuideData[id].location)
					.replace(/{walkDuration}/g, GuideData[id].duration)
					.replace(/{walkDistance}/g, GuideData[id].distance)
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
			unsorted = [],
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
					a = guide[a].distance;
					b = guide[b].distance;
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

  if(parent) this.init();

};

// extend the class
SydneyTrainWalks.prototype.Overview = function (parent) {

  // PROPERTIES

  this.parent = parent;
  this.config = parent.config;
  this.overviewMap = null;
  this.awaitTimeout = null;
  this.config.extend = function(properties) {
    for (var name in properties) {
      this[name] = properties[name];
    }
  };
  this.config.extend({
    'overview': document.querySelector('.localmap.overview'),
    'creditTemplate': document.getElementById('credit-template')
  });

  // METHODS

  this.init = function() {
    // wait for the viewport to become visible
    var observer = this.awaitView.bind(this);
    var mutationObserver = new MutationObserver(observer);
    mutationObserver.observe(document.body, {
      'attributes': true,
      'attributeFilter': ['id', 'class', 'style'], 
      'subtree': true
    });
    // try at least once
    this.awaitView();
  };

  this.awaitView = function(mutations, observer) {
    var overview = this.config.overview;
    var resolver = this.createMap.bind(this);
    clearTimeout(this.awaitTimeout);
    this.awaitTimeout = setTimeout(function() {
      if (overview.getBoundingClientRect().right > 0) {
        // generate the map
        resolver();
        // stop waiting
        if(observer) observer.disconnect();
      }
    }, 100);
  };

  this.createMap = function() {
    // generate the map
    var localmap = new Localmap({
      'key': '_index',
      'container': this.config.overview,
      'legend': null,
      // assets
      'thumbsUrl': null,
      'photosUrl': null,
      'markersUrl': this.config.local + '/img/marker-{type}.svg',
      'exifUrl': null,
      'guideUrl': null,
      'routeUrl': null,
      'mapUrl': this.config.local + '/maps/{key}.jpg',
      'tilesUrl': this.config.local + '/tiles/{z}/{x}/{y}.jpg',
      'tilesZoom': 11,
      // cache
      'guideData': this.processMarkers(),
      'routeData': this.mergeRoutes(),
      'exifData': null,
      // attribution
      'creditsTemplate': this.config.creditTemplate.innerHTML
    });
  };

  this.processMarkers = function() {
    // add "onMarkerClicked" event handlers to markers
    var _this = this;
    GuideData['_index'].markers.map(function(marker) {
      marker.description = '';
      marker.callback = _this.onMarkerClicked.bind(_this, marker.id);
    });
    return GuideData;
  };

  this.mergeRoutes = function() {
    var routes = {'_index':{'features':[]}};
    // if the GPX data is available anyway
    if (typeof GpxData != 'undefined') {
      // for every walk
      for (var key in GpxData) {
        // only if this isn't an alias
        if (!GuideData[key].alias) {
          // add the route
					routes['_index'].features = routes['_index'].features.concat(GpxData[key].features);
        }
      }
    }
    // return the result
    return routes;
  };

  // EVENTS

  this.onMarkerClicked = function(id, evt) {
    // update the app for this id
    this.parent.update(id, 'map');
  };

  if(parent) this.init();

};

// extend the class
SydneyTrainWalks.prototype.Trophies = function(parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.config.extend({
		'trophies': document.querySelector('.trophies ul'),
		'trophiesTemplate': document.getElementById('trophies-template'),
		'trophy': document.querySelector('.trophy'),
		'trophyTemplate': document.getElementById('trophy-template')
	});

	// METHODS

	this.init = function() {
		var trophy = this.config.trophy;
		// fill the trophies page
		this.update();
	};

	this.update = function() {
		var a, b, id, marker, wrapper, link;
		var guides = GuideData;
		var container = this.config.trophies;
		var template = this.config.trophiesTemplate;
		// for all the hotspots from all the guides
		this.config.trophies.innerHTML = '';
		for (id in guides) {
			for (a = 0, b = guides[id].markers.length; a < b; a += 1) {
				marker = guides[id].markers[a];
				if (marker.type === 'hotspot') {
					// add a trophy badge
					wrapper = document.createElement('li');
					link = document.createElement('a');
					// if the hotspot is in local storage already
					if (this.getTrophy(marker.title)) {
						// show the full badge
						link.innerHTML += template.innerHTML.replace('{icon}', marker.badge).replace('{title}', marker.title);
						// make it look active
						link.setAttribute('class', 'trophies-active');
						// link it to the details modal
						link.addEventListener('click', this.details.bind(this, marker));
					// else
					} else {
						// show a mystery badge
						link.innerHTML += template.innerHTML.replace('{icon}', marker.type).replace('{title}', '???');
						// make it looks passive
						link.setAttribute('class', 'trophies-passive');
						// deeplink to the guides page
						link.addEventListener('click', this.deeplink.bind(this, id));
					}
					wrapper.appendChild(link);
					container.appendChild(wrapper);
				}
			}
		}
	};

	this.getTrophy = function(title) {
		var storedTrophies = JSON.parse(window.localStorage.getItem('trophies') || "{}");
		return storedTrophies[title];
	};

	this.setTrophy = function(title) {
		var storedTrophies = JSON.parse(window.localStorage.getItem('trophies') || "{}");
		storedTrophies[title] = true;
		window.localStorage.setItem('trophies', JSON.stringify(storedTrophies));
	};

	this.check = function(data) {
		// reply if a reaction to the hotspot is nessecary
		return !this.getTrophy(data.title);
	};

	this.enter = function(data) {
		// if this trophy is not in local storage yet
		if (!this.getTrophy(data.title)) {
			// show the trophy details
			this.details(data);
			// store the trophy in local storage
			//this.setTrophy(data.title);
			// redraw the trophy page
			this.update();
		}
	};

	this.leave = function(data) {
		var trophy = this.config.trophy;
		// hide the modal window again
		trophy.className = trophy.className.replace(/ trophy-active/g, '');
	};

	// EVENTS

	this.details = function(marker) {
		var guides = GuideData;
		var container = this.config.trophy;
		var template = this.config.trophyTemplate;
		// populate the modal
		container.innerHTML = template.innerHTML
			.replace('{icon}', marker.badge)
			.replace('{title}', marker.title)
			.replace('{description}', '<p>' + marker.explanation.join('</p><p>') + '</p>');
		// add the event handler to close the modal popup
		var closer = container.querySelector('footer button');
		closer.addEventListener('click', this.close.bind(this, marker, container));
		// show the modal
		container.className += ' trophy-active';
	};

	this.deeplink = function(id) {
		// open the guide page for the id
		this.parent.update(id, 'map');
	};

	this.close = function(marker, container, evt) {
		// cancel the click
		evt.preventDefault();
		// store the trophy in local storage
		this.setTrophy(marker.title);
		// hide the modal
		container.className = container.className.replace(/ trophy-active/g, '');
	};

	if(parent) this.init();

};

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
    },
    'hotspots': [],
    'checkHotspot': function() { return true; },
    'enterHotspot': function() { return true; },
    'leaveHotspot': function() { return true; }
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
  this.tilesSize = 256;


	// METHODS

  // Slippy map tilenames - https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
  var long2tile = function long2tile(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
  var lat2tile = function lat2tile(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }
  var tile2long = function tile2long(x,z) { return (x/Math.pow(2,z)*360-180); }
  var tile2lat = function tile2lat(y,z) { var n=Math.PI-2*Math.PI*y/Math.pow(2,z); return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n)))); }

	this.start = function() {
		// create the canvas
		this.element = document.createElement('div');
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
		min.zoom = Math.max(container.offsetWidth / element.offsetWidth, container.offsetHeight / element.offsetHeight);
		max.zoom = 2;
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
		element.style.width = croppedWidth + 'px';
		element.style.height = croppedHeight + 'px';
		// double up the bitmap to retina size
		image.style.marginLeft = offsetWidth + 'px';
		image.style.marginTop = offsetHeight + 'px';
		// insert image instead of canvas
		element.appendChild(image);
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
		// take the last item from the queue
		var props = this.tilesQueue.pop();
		// if an image was returned
		if (image) {
			// clone the image into the container
			var tile = image.cloneNode();
			tile.style.left = (props.x * props.w / 2) + 'px';
			tile.style.top = (props.y * props.h / 2) + 'px';
			tile.style.width = (props.w / 2) + 'px';
			tile.style.height = (props.h / 2) + 'px';
			tile.setAttribute('class', 'localmap-tile');
			this.element.appendChild(tile);
		}
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
  this.hotspot = null;
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

  this.checkHotSpot = function(lon, lat) {
    var config = this.config;
		var key = this.config.key;
    // for every marker
    config.hotspots.map(function(marker) {
      // if the marker just entered the hotspot
      if ((lon > marker.minLon && lon < marker.maxLon && lat > marker.minLat && lat < marker.maxLat) && this.hotspot !== marker.title) {
        // remember its name
        this.hotspot = marker.title;
        // trigger the corresponding event
        if (config.checkHotspot(marker)) config.enterHotspot(marker);
      }
      // else if the marker just exited the hotspot
      else if ((lon < marker.minLon || lon > marker.maxLon || lat < marker.minLat || lat > marker.maxLat) && this.hotspot === marker.title) {
        // forget its name
        this.hotspot = null;
        // trigger the corresponding event
        if (config.checkHotspot(marker)) config.leaveHotspot(marker);
      }
    });
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
      // check if the location is within a hotspot
      this.checkHotSpot(lon, lat);
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
		// add a landmark, waypoint, or a hotspot to the map
    switch(markerData.type) {
      case 'waypoint': markerData.element = this.addWaypoint(markerData); break;
      case 'hotspot': markerData.element = this.addHotspot(markerData); break;
      default: markerData.element = this.addLandmark(markerData);
    }
    // add valid markers to the map
    if (markerData.element) {
		  this.parent.element.appendChild(markerData.element);
		  this.elements.push(markerData.element);
    }
	};

	this.addWaypoint = function(markerData) {
		var min = this.config.minimum;
		var max = this.config.maximum;
		var element = document.createElement('span');
		element.setAttribute('class', 'localmap-waypoint');
		element.addEventListener('click', onClicked.bind(this, markerData));
		element.style.left = ((markerData.lon - min.lon_cover) / (max.lon_cover - min.lon_cover) * 100) + '%';
		element.style.top = ((markerData.lat - min.lat_cover) / (max.lat_cover - min.lat_cover) * 100) + '%';
		element.style.cursor = 'pointer';
		return element;
	};

  this.addHotspot = function(markerData) {
    var config = this.config;
    // pre-calculate the hotspot radius
    markerData.maxLon = markerData.lon + markerData.radius;
    markerData.minLon = markerData.lon - markerData.radius;
    markerData.maxLat = markerData.lat + markerData.radius / 1.5;
    markerData.minLat = markerData.lat - markerData.radius / 1.5;
    this.config.hotspots.push(markerData);
    // otherwise handle as a normal landmark
    return (config.checkHotspot(markerData)) ? this.addLandmark(markerData) : null;
  };

	this.addLandmark = function(markerData) {
		var min = this.config.minimum;
		var max = this.config.maximum;
		var element = new Image();
		element.setAttribute('src', this.config.markersUrl.replace('{type}', markerData.type));
		element.setAttribute('title', markerData.description || '');
		element.setAttribute('class', 'localmap-marker');
		element.addEventListener('click', onClicked.bind(this, markerData));
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
