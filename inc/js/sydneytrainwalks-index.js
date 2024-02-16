export class Index {
	constructor(config, guideCache, updateView) {
		this.config = config;
		this.searchFor = '';
		this.searchDelay = null;
		this.sortBy = 'shortest';
		this.updateView = updateView;
		this.guidesLookup = this.generateLookup(guideCache['_index']);
		this.searchForm = document.getElementById('sorting');
		this.searchInput = document.querySelector('.searching-label input');
		this.sortSelect = document.querySelector('.sorting-label select');
		this.filterSelect = document.querySelector('.filtering-label select');
		this.menuElement = document.querySelector('.navigation > menu');
		this.titleTemplate = document.getElementById('title-template');
		this.menuTemplate = document.getElementById('menu-template');
		this.init();
	}

	generateLookup(guideData) {
		let lookupData = {};
		// add every marker to a lookup index
		for (let marker of guideData.markers) { lookupData[marker.key] = marker; }
		// return a lookup index
		return lookupData;
	}

	update() {
		var id, guide, menuHtml = '', titleHtml = '';
		var menuTemplate = this.menuTemplate.innerHTML;
		var titleTemplate = this.titleTemplate.innerHTML;
		// search, filter, and sort the guides
		var guideIds = Object.keys(this.guidesLookup);
		var searchedIds = this.searchGuide(guideIds, this.searchFor);
		var filteredIds = this.filterGuide(searchedIds, this.filterBy);
		var sortedIds = this.sortGuide(filteredIds, this.sortBy);
		// show or hide incidentally related elements
		this.mirrorResults(guideIds, sortedIds);
		// for every available guide
		for (let id of sortedIds) {
			// retrieve the guide that go with this id
			guide = this.guidesLookup[id];
			// construct a menu item
			titleHtml = titleTemplate
				.replace(/{startTransport}/g, guide.locations[0].type)
				.replace(/{startLocation}/g, guide.locations[0].location)
				.replace(/{walkLocation}/g, guide.region)
				.replace(/{walkDistance}/g, guide.distance.join(' / '))
				.replace(/{endTransport}/g,guide.locations.slice(-1)[0].type)
				.replace(/{endLocation}/g, guide.locations.slice(-1)[0].location);
			// add the menu item
			menuHtml += menuTemplate
				.replace(/{id}/g, id)
				.replace(/{title}/g, titleHtml);
		}
		// fill the menu with options
		this.menuElement.innerHTML = (menuHtml === '')
			? '<li class="no-results">No results...</li>'
			: menuHtml;
	}

	searchGuide(guideIds, keyword) {
		var locations = '', searched = [], search = new RegExp(keyword, 'i');
		// create an array of guides
		for (let id of guideIds) {
			// retrieve the guide
			var guide = this.guidesLookup[id];
			// only for valid guide id's
			if (guide.region) {
				// fetch the locations to search for
				locations = guide.region + ' ' + guide.locations.map(entry => entry.location).join(' ');
				// add the guide if it includes the keyword
				if (search.test(locations)) { searched.push(id); }
			}
		}
		// return the searched guides
		return searched;
	}

	sortGuide(guideIds, option) {
		var unsorted = guideIds, sorted = [];
		// sort the array by the prefered method
		switch (option) {
			case 'start':
				sorted = unsorted.sort((a, b) => (this.guidesLookup[a].locations[0].location < this.guidesLookup[b].locations[0].location) ? -1 : 1);
				break;
			case 'finish':
				sorted = unsorted.sort((a, b) => (this.guidesLookup[a].locations.slice(-1)[0].location < this.guidesLookup[b].locations.slice(-1)[0].location) ? -1 : 1);
				break;
			case 'region':
				sorted = unsorted.sort((a, b) => (this.guidesLookup[a].region < this.guidesLookup[b].region) ? -1 : 1);
				break;
			case 'shortest':
				console.log('sorting by shortest');
				sorted = unsorted.sort((a, b) => (Math.min(...this.guidesLookup[a].distance) < Math.min(...this.guidesLookup[b].distance)) ? -1 : 1);
				break;
			case 'longest':
				sorted = unsorted.sort((a, b) => (Math.max(...this.guidesLookup[a].distance) > Math.max(...this.guidesLookup[b].distance)) ? -1 : 1);
				break;
			case 'revised':
				sorted = unsorted.sort((a, b) => (this.guidesLookup[a].revised < this.guidesLookup[b].revised) ? -1 : 1);
				break;
			default:
				sorted = unsorted;
		}
		// return the ordered guides
		return sorted;
	}

	filterGuide(guideIds, option) {
		var unfiltered = guideIds, filtered = [];
		// filter the array by the prefered method
		switch (option) {
			case 'public':
				filtered = unfiltered.filter(id => this.guidesLookup[id].transit);
				break;
			case 'car':
				filtered = unfiltered.filter(id => this.guidesLookup[id].car);
				break;
			case 'toilets':
				filtered = unfiltered.filter(id => this.guidesLookup[id].toilets > 0);
				break;
			case 'kiosks':
				filtered = unfiltered.filter(id => this.guidesLookup[id].kiosks > 0);
				break;
			case 'looped':
				filtered = unfiltered.filter(id => this.guidesLookup[id].looped);
				break;
			case 'rain':
				filtered = unfiltered.filter(id => this.guidesLookup[id].rain);
				break;
			case 'fireban':
				filtered = unfiltered.filter(id => this.guidesLookup[id].fireban);
				break;
			default:
				filtered = unfiltered;
		}
		// return the ordered guides
		return filtered;
	}

	mirrorResults(guideIds, sortedIds) {
		// show or hide page elements associated with a key, according to the filtered keys
		const elements = document.querySelectorAll('.overview.localmap [data-key]');
		let keywords = [];
		for (let id of sortedIds) {
			let guide = this.guidesLookup[id];
			keywords.push(guide.key);
			guide.locations.map(entry => { keywords.push(entry.location) });
		}
		for (let element of elements) {
			element.style.visibility = keywords.includes(element.getAttribute('data-key')) ? 'visible' : 'hidden';
		}
	}

	onFieldFocus(evt) {
		// reset the previous state
		window.localStorage.setItem('id', null);
		window.localStorage.setItem('mode', null);
	}

	onSearchReset(input, evt) {
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
	}

	onSearchSubmitted(input, evt) {
		// cancel the submit
		if(evt) evt.preventDefault();
		// perform the search
		this.searchFor = input.value.trim();
		this.update();
		// deselect the input field
		input.blur();
	}

	onSearchChanged(input, evt) {
		var _this = this;
		// wait for the typing to pause
		clearTimeout(_this.searchDelay);
		this.searchDelay = setTimeout(function() {
			// perform the search
			_this.searchFor = input.value.trim();
			_this.update();
		}, 700);
	}

	onSortSelected(select, evt) {
		// perform the sort
		this.sortBy = select.value;
		this.update();
	}

	onFilterSelected(select, evt) {
		// perform the sort
		this.filterBy = select.value;
		this.update();
	}

	onMenuClicked(evt) {
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
		this.updateView(id, 'guide');
	}

	init() {
		var searchForm = this.searchForm;
		var searchInput = this.searchInput;
		var sortSelect = this.sortSelect;
		var filterSelect = this.filterSelect;
		// build the menu
		this.update();
		// add the global click handler to the menu
		this.menuElement.addEventListener('click', this.onMenuClicked.bind(this));
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
	}
}
