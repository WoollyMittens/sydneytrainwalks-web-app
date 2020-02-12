// extend the class
SydneyTrainWalks.prototype.Index = function(parent) {

	// PROPERTIES

	this.parent = parent;
	this.searchFor = '';
	this.searchDelay = null;
	this.sortBy = 'length';
	this.config = parent.config;
	this.config.extend({
		'searchForm': document.getElementById('sorting'),
		'searchInput': document.querySelector('.searching-label input'),
		'sortSelect': document.querySelector('.sorting-label select'),
		'filterSelect': document.querySelector('.filtering-label select'),
		'menu': document.querySelector('.navigation > menu'),
		'titleTemplate': document.getElementById('title-template'),
		'menuTemplate': document.getElementById('menu-template'),
		'guideTemplate': document.getElementById('guide-template')
	});

	// METHODS

	this.init = function() {
		var searchForm = this.config.searchForm;
		var searchInput = this.config.searchInput;
		var sortSelect = this.config.sortSelect;
		var filterSelect = this.config.filterSelect;
		// build the menu
		this.update();
		// add the global click handler to the menu
		this.config.menu.addEventListener('click', this.onMenuClicked.bind(this));
		// event handlers for search option
		searchInput.addEventListener('focus', this.onFieldFocus.bind(this));
		searchInput.addEventListener('blur', this.onSearchChanged.bind(this, searchInput));
		searchInput.addEventListener('keyup', this.onSearchChanged.bind(this, searchInput));
		searchInput.addEventListener('change', this.onSearchChanged.bind(this, searchInput));
		// event handlers for the sort option
		sortSelect.addEventListener('focus', this.onFieldFocus.bind(this));
		sortSelect.addEventListener('change', this.onSortSelected.bind(this, sortSelect));
		// event handlers for the filter option
		filterSelect.addEventListener('focus', this.onFieldFocus.bind(this));
		filterSelect.addEventListener('change', this.onFilterSelected.bind(this, filterSelect));
		// event handler for the form submit
		searchForm.addEventListener('submit', this.onSearchSubmitted.bind(this, searchInput));
		// add the reset button to browsers that need it
		if (!/MSIE/i.test(navigator.userAgent)) { searchInput.addEventListener('click', this.onSearchReset.bind(this, searchInput)); }
		else { searchInput.style.backgroundImage = 'none'; }
	};

	this.update = function() {
		var id, markers, menuHtml = '', titleHtml = '';
		var menuTemplate = this.config.menuTemplate.innerHTML;
		var titleTemplate = this.config.titleTemplate.innerHTML;
		// search, filter, and sort the guides
		var guideIds = Object.keys(GuideData);
		var searchedIds = this.searchGuide(guideIds, this.searchFor);
		var filteredIds = this.filterGuide(searchedIds, this.filterBy);
		var sortedIds = this.sortGuide(filteredIds, this.sortBy);
// TODO: show/hide markers based on filter results
		// for every available guide
		for (var a = 0, b = sortedIds.length; a < b; a += 1) {
			// retrieve the markers that go with this id
			id = sortedIds[a];
			markers = GuideData[id].markers;
			// construct a menu item
			titleHtml = titleTemplate
				.replace(/{startTransport}/g, markers[0].type)
				.replace(/{startLocation}/g, markers[0].location)
				.replace(/{walkLocation}/g, GuideData[id].location)
				.replace(/{walkDuration}/g, GuideData[id].duration)
				.replace(/{walkDistance}/g, GuideData[id].distance)
				.replace(/{endTransport}/g, markers[markers.length - 1].type)
				.replace(/{endLocation}/g, markers[markers.length - 1].location);
			// add the menu item
			menuHtml += menuTemplate
				.replace(/{id}/g, id)
				.replace(/{title}/g, titleHtml);
		}
		// fill the menu with options
		this.config.menu.innerHTML = (menuHtml === '')
			? '<li class="no-results">No results...</li>'
			: menuHtml;
	};

	this.searchGuide = function(guideIds, keyword) {
		var id, locations = '', searched = [], search = new RegExp(keyword, 'i');
		// create an array of guides
		guideIds.map(function(id){
			// retrieve the guide
			var guide = GuideData[id];
			// only for valid guide id's
			if (guide.location && guide.markers) {
				// fetch the locations to search for
				locations = guide.location + ' ' + guide.markers[0].location + ' ' + guide.markers[guide.markers.length - 1].location;
				// add the guide if it includes the keyword
				if (search.test(locations)) { searched.push(id); }
			}
		});
		// return the searched guides
		return searched;
	};

	this.sortGuide = function(guideIds, option) {
		var id, unsorted = guideIds, sorted = [];
		// sort the array by the prefered method
		switch (option) {
			case 'start':
				sorted = unsorted.sort(function(a, b) {
					a = GuideData[a].markers[0].location;
					b = GuideData[b].markers[0].location;
					return (a < b) ? -1 : 1;
				});
				break;
			case 'finish':
				sorted = unsorted.sort(function(a, b) {
					a = GuideData[a].markers[markers.length - 1].location;
					b = GuideData[b].markers[markers.length - 1].location;
					return (a < b) ? -1 : 1;
				});
				break;
			case 'region':
				sorted = unsorted.sort(function(a, b) {
					a = GuideData[a].location;
					b = GuideData[b].location;
					return (a < b) ? -1 : 1;
				});
				break;
			case 'duration':
				sorted = unsorted.sort(function(a, b) {
					a = GuideData[a].duration;
					b = GuideData[b].duration;
					return a - b;
				});
				break;
			case 'length':
				sorted = unsorted.sort(function(a, b) {
					a = GuideData[a].distance;
					b = GuideData[b].distance;
					return a - b;
				});
				break;
			case 'revised':
				sorted = unsorted.sort(function(a, b) {
					a = new Date(GuideData[a].updated);
					b = new Date(GuideData[b].updated);
					return b - a;
				});
				break;
			default:
				sorted = unsorted;
		}
		// return the ordered guides
		return sorted;
	};

	this.filterGuide = function(guideIds, option) {
		var id, unfiltered = guideIds, filtered = [];
		// filter the array by the prefered method
		switch (option) {
			case 'public':
				unfiltered.map(function(a) {
					var markers = GuideData[a].markers;
					var first = markers[0];
					var last = markers[markers.length - 1];
					if (first.type !== 'car' && last.type !== 'car') filtered.push(a);
				});
				break;
			case 'car':
				unfiltered.map(function(a) {
					var markers = GuideData[a].markers;
					var first = markers[0];
					var last = markers[markers.length - 1];
					if (first.type === 'car' || last.type === 'car') filtered.push(a);
				});
				break;
			case 'looped':
				unfiltered.map(function(a) {
					var markers = GuideData[a].markers;
					var first = markers[0];
					var last = markers[markers.length - 1];
					if (first.location === last.location) filtered.push(a);
				});
				break;
			case 'rain':
				unfiltered.map(function(a) {
					if (GuideData[a].rain) filtered.push(a);
				});
				break;
			case 'fireban':
				unfiltered.map(function(a) {
					if (GuideData[a].fireban) filtered.push(a);
				});
				break;
			default:
				filtered = unfiltered;
		}
		// return the ordered guides
		return filtered;
	};

	// EVENTS

	this.onFieldFocus = function(evt) {
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

	this.onSortSelected = function(select, evt) {
		// perform the sort
		this.sortBy = select.value;
		this.update();
	};

	this.onFilterSelected = function(select, evt) {
		// perform the sort
		this.filterBy = select.value;
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
