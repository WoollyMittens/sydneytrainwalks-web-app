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
		var guides = GuideData;
		var container = this.config.trophies;
		// clear the container
		container.innerHTML = '';
		// filter out the trophies from the markers
		var a, b, id, marker, duplicates = {}, trophies = [];
		for (id in guides) {
			for (a = 0, b = guides[id].markers.length; a < b; a += 1) {
				marker = guides[id].markers[a];
				if (marker.type === 'hotspot' && !duplicates[marker.title]) {
					// store the title to avoid duplicats
					duplicates[marker.title] = true;
					// store the trophy
					trophies.push({
						'id': id,
						'marker': marker
					});
				}
			}
		}
		// sort the trophies
		trophies.sort(function(a, b) {
			return (a.marker.title > b.marker.title) ? 1 : -1;
		});
		// insert the markers
		var _this = this;
		trophies.map(function(trophy) {
			var wrapper, link;
			// add a trophy badge
			wrapper = document.createElement('li');
			link = (_this.getTrophy(trophy.marker.title)) ? _this.addBadge(trophy.id, trophy.marker) : _this.addMystery(trophy.id, trophy.marker);
			wrapper.appendChild(link);
			container.appendChild(wrapper);
		});
	};

	this.addBadge = function(id, marker) {
		var link = document.createElement('a');
		var template = this.config.trophiesTemplate;
		// show the full badge
		link.innerHTML += template.innerHTML
			.replace('{icon}', marker.badge)
			.replace('{title}', marker.title);
		// make it look active
		link.setAttribute('class', 'trophies-active');
		// link it to the details modal
		link.addEventListener('click', this.details.bind(this, marker));
		// return the link
		return link;
	};

	this.addMystery = function(id, marker) {
		var link = document.createElement('a');
		var template = this.config.trophiesTemplate;
		// show a mystery badge
		link.innerHTML += template.innerHTML
			.replace('{icon}', marker.type)
			.replace('{title}', '???');
		// make it looks passive
		link.setAttribute('class', 'trophies-passive');
		// deeplink to the guides page
		link.addEventListener('click', this.deeplink.bind(this, id));
		// return the link
		return link;
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
			// redraw the trophy page
			this.update();
		}
	};

	this.leave = function(data) {
		var trophy = this.config.trophy;
		// hide the modal window again
		trophy.className = trophy.className.replace(/ trophy-active/g, '');
	};

	// Slippy map tilenames - https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
  var long2tile = function long2tile(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
  var lat2tile = function lat2tile(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }
  var tile2long = function tile2long(x,z) { return (x/Math.pow(2,z)*360-180); }
  var tile2lat = function tile2lat(y,z) { var n=Math.PI-2*Math.PI*y/Math.pow(2,z); return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n)))); }

	// EVENTS

	this.details = function(marker) {
		var guides = GuideData;
		var container = this.config.trophy;
		var template = this.config.trophyTemplate;
		// calculate the tile this trophy occurs on
		var tile = [15, long2tile(marker.lon, 15), lat2tile(marker.lat, 15)];
		var background = marker.title.replace(/:|\.|\,|\'|\s|\?|\!/g, '_').toLowerCase().trim();
		// populate the modal
		container.innerHTML = template.innerHTML
			.replace('{icon}', marker.badge)
			.replace('{title}', marker.title)
			//.replace('{tile}', 'tiles/' + tile.join('/'))
			.replace('{tile}', 'trophies/' + background)
			.replace('{background}', 'trophies/' + background)
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
		// redraw the trophies page
		this.update();
		// hide the modal
		container.className = container.className.replace(/ trophy-active/g, '');
	};

	if(parent) this.init();

};
