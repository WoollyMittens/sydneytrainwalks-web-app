import { long2tile, lat2tile, tile2long, tile2lat } from "./slippy.js";

export class Trophies {
	constructor(parent) {
		this.parent = parent;
		this.config = parent.config;
		this.config.extend({
			'trophies': document.querySelector('.trophies ul'),
			'trophiesTemplate': document.getElementById('trophies-template'),
			'trophy': document.querySelector('.trophy'),
			'trophyTemplate': document.getElementById('trophy-template')
		});
		this.init();
	}

	update() {
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

	addBadge(id, marker) {
		var link = document.createElement('a');
		var template = this.config.trophiesTemplate;
		// show the full badge
		link.innerHTML += template.innerHTML
			.replace(/{icon}/g, marker.badge)
			.replace(/{title}/g, marker.title);
		// make it look active
		link.setAttribute('class', 'trophies-active');
		// link it to the details modal
		link.addEventListener('click', this.details.bind(this, marker));
		// return the link
		return link;
	};

	addMystery(id, marker) {
		var link = document.createElement('a');
		var template = this.config.trophiesTemplate;
		// show a mystery badge
		link.innerHTML += template.innerHTML
			.replace(/{icon}/g, marker.type)
			.replace(/{title}/g, '???');
		// make it looks passive
		link.setAttribute('class', 'trophies-passive');
		// deeplink to the guides page
		link.addEventListener('click', this.deeplink.bind(this, id));
		// return the link
		return link;
	};

	getTrophy(title) {
		var storedTrophies = JSON.parse(window.localStorage.getItem('trophies') || "{}");
		return storedTrophies[title];
	};

	setTrophy(title) {
		var storedTrophies = JSON.parse(window.localStorage.getItem('trophies') || "{}");
		storedTrophies[title] = true;
		window.localStorage.setItem('trophies', JSON.stringify(storedTrophies));
	};

	check(data) {
		// reply if a reaction to the hotspot is nessecary
		return !this.getTrophy(data.title);
	};

	enter(data) {
		// if this trophy is not in local storage yet
		if (!this.getTrophy(data.title)) {
			// show the trophy details
			this.details(data);
			// redraw the trophy page
			this.update();
		}
	};

	leave(data) {
		var trophy = this.config.trophy;
		// hide the modal window again
		trophy.className = trophy.className.replace(/ trophy-active/g, '');
	};

	details(marker) {
		var guides = GuideData;
		var container = this.config.trophy;
		var template = this.config.trophyTemplate;
		// calculate the tile this trophy occurs on
		var tile = [15, long2tile(marker.lon, 15), lat2tile(marker.lat, 15)];
		var background = marker.title.replace(/:|\.|\,|\'|\s|\?|\!/g, '_').toLowerCase().trim();
		// populate the modal
		container.innerHTML = template.innerHTML
			.replace(/{icon}/g, marker.badge)
			.replace(/{title}/g, marker.title)
			//.replace(/\{tile\}/g, 'tiles/' + tile.join('/'))
			.replace(/{tile}/g, 'trophies/' + background)
			.replace(/{background}/g, 'trophies/' + background)
			.replace(/{description}/g, '<p>' + marker.explanation.join('</p><p>') + '</p>');
		// add the event handler to close the modal popup
		var closer = container.querySelector('footer button');
		closer.addEventListener('click', this.close.bind(this, marker, container));
		// show the modal
		container.className += ' trophy-active';
	}

	deeplink(id) {
		// open the guide page for the id
		this.parent.update(id, 'map');
	}

	close(marker, container, evt) {
		// cancel the click
		evt.preventDefault();
		// store the trophy in local storage
		this.setTrophy(marker.title);
		// redraw the trophies page
		this.update();
		// hide the modal
		container.className = container.className.replace(/ trophy-active/g, '');
	}

	init() {
		var trophy = this.config.trophy;
		// fill the trophies page
		this.update();
	}
}
