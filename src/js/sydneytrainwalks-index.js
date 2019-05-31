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
