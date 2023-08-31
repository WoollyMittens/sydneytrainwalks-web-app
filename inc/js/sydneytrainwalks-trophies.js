//import { long2tile, lat2tile, tile2long, tile2lat } from "./slippy.js";

export class Trophies {
	constructor(config, guideIds, loadGuide, updateView, busy) {
		this.config = config;
		this.trophiesElement = document.querySelector('.trophies ul');
		this.trophiesTemplate = document.getElementById('trophies-template');
		this.trophyElement = document.querySelector('.trophy');
		this.trophyTemplate = document.getElementById('trophy-template');
		this.guideIds = guideIds;
		this.loadGuide = loadGuide;
		this.parentView = updateView;
		this.busyIndicator = busy;
		this.init();
	}

	async update() {
		// show the busy indicator
		this.busyIndicator.show();
		// clear the container
		this.trophiesElement.innerHTML = '';
		// filter out the trophies from the markers
		var duplicates = {}, trophies = [];
		for (let id of this.guideIds) {
			// load the guide
			let guide = await this.loadGuide(id);
			// for every marker in the guide
			for (let marker of guide.markers) {
				// if the marker is a (new) trophy
				if (marker.type === 'hotspot' && !duplicates[marker.title]) {
					// store the title to avoid duplicates
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
		trophies.sort((a, b) => {
			return (a.marker.title > b.marker.title) ? 1 : -1;
		});
		// insert the markers
		trophies.map((trophy) => {
			var wrapper, link;
			// add a trophy badge
			wrapper = document.createElement('li');
			link = (this.getTrophy(trophy.marker.title)) ? this.addBadge(trophy.id, trophy.marker) : this.addMystery(trophy.id, trophy.marker);
			wrapper.appendChild(link);
			this.trophiesElement.appendChild(wrapper);
		});
		// hide the busy indicator
		this.busyIndicator.hide();
	};

	addBadge(id, marker) {
		var link = document.createElement('a');
		var template = this.trophiesTemplate;
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
		var template = this.trophiesTemplate;
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
		var trophy = this.trophyElement;
		// hide the modal window again
		trophy.className = trophy.className.replace(/ trophy-active/g, '');
	};

	details(marker) {
		var container = this.trophyElement;
		var template = this.trophyTemplate;
		// calculate the tile this trophy occurs on
		//var tile = [15, long2tile(marker.lon, 15), lat2tile(marker.lat, 15)];
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
		this.parentView(id, 'map');
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
		// wait for the viewport to become visible
		new IntersectionObserver((entries, observer) => {
			if (entries[0].intersectionRatio > 0.5) {
				// fill the trophies page
				this.update();
				// stop waiting
				observer.disconnect();
			}
		}).observe(this.trophiesElement);
	}
}
