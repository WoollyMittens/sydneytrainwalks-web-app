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
