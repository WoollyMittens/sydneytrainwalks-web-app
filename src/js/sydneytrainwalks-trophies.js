// extend the class
SydneyTrainWalks.prototype.Trophies = function(parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.config.extend({
		'trophies': document.querySelector('.trophies'),
		'trophiesTemplate': document.getElementById('trophies-template'),
		'trophy': document.querySelector('.trophy'),
		'trophyTemplate': document.getElementById('trophy-template')
	});

	// METHODS

	this.init = function() {
		// fill the trophies page
		this.update();
		// add the event handler to close the modal popup
	};

	this.update = function() {
		var a, b, id, marker, wrapper;
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
					wrapper = document.createElement('a');
					// if the hotspot is in local storage already
					if (this.getTrophy(marker.title)) {
						// show the full badge
						wrapper.innerHTML += template.innerHTML.replace('{icon}', marker.badge).replace('{title}', marker.title);
						// make it look active
						wrapper.setAttribute('class', 'trophies-active');
						// link it to the details modal
						wrapper.addEventListener('click', this.details.bind(this, id, marker));
					// else
					} else {
						// show a mystery badge
						wrapper.innerHTML += template.innerHTML.replace('{icon}', marker.type).replace('{title}', '???');
						// make it looks passive
						wrapper.setAttribute('class', 'trophies-passive');
						// deeplink to the guides page
						wrapper.addEventListener('click', this.deeplink.bind(this, id));
					}
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

	// EVENTS

	this.details = function(id, marker) {
		console.log('trophy details:', id, marker);
		// populate the modal
		// show the modal
	};

	this.deeplink = function(id) {
		console.log('trophy deeplink:', id);
		// open the guide page for the id
	};

	this.enter = function(data) {
		// if this trophy is not in local storage yet
		console.log(this);
		if (!this.getTrophy(data.title)) {
			// show the trophy details
			this.details(data);
			// store the trophy in local storage
			this.setTrophy(data.title);
			// redraw the trophy page
			this.update();
		}
		console.log('entering trophy location:', data);
	};

	this.leave = function(data) {
		console.log('leaving trophy location:', data);
	};

	if(parent) this.init();

};
