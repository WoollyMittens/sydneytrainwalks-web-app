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
	this.searchInput = null;
	this.sortSelect = null;
	this.filterSelect = null;
	this.delay = null;

	// METHODS

	this.init = function (config) {
		// store the configuration
		this.element = config.element;
		this.promise = config.promise || function () {};
		// get the search element
		this.searchInput = this.element.getElementsByTagName('input')[0];
		this.searchInput.addEventListener('blur', this.onSearchChanged.bind(this));
		this.searchInput.addEventListener('keyup', this.onSearchChanged.bind(this));
		this.searchInput.addEventListener('change', this.onSearchChanged.bind(this));
		// get the sorter elements
		this.sortSelect = this.element.getElementsByTagName('select')[0];
		this.sorters = this.sortSelect.getElementsByTagName('option');
		this.sortSelect.addEventListener('change', this.onSorterSelected.bind(this));
		// get the filter elements
		this.filterSelect = this.element.getElementsByTagName('select')[1];
		this.filters = this.filterSelect.getElementsByTagName('option');
		this.filterSelect.addEventListener('change', this.onFilterSelected.bind(this));
		// add the event listener for the form
		this.element.addEventListener('submit', this.onSearchSubmit.bind(this));
		// add the reset button to browsers that need it
		if (!/MSIE/i.test(navigator.userAgent)) { this.searchInput.addEventListener('click', this.onSearchReset.bind(this)); }
		else { this.searchInput.style.backgroundImage = 'none'; }
		// return the object
		return this;
	};

	this.redraw = function (index) {
		// update the drop down
		this.sortSelect.selectedIndex = index;
	};

	this.searchFor = function (keyword) {
		var a, b, contents, className,
			sortees = document.querySelectorAll( this.element.getAttribute('data-target') ),
			findTags = new RegExp('<[^>]*>', 'g'),
			findKeyword = new RegExp(keyword, 'i');
		// for all elements
		for (a = 0, b = sortees.length; a < b; a += 1) {
			// clear the contents of the sortee
			contents = sortees[a].innerHTML.replace(findTags, ' ');
			// show or hide the elements based on the keyword
			className = sortees[a].className.replace(/ no-match/g, '');
			sortees[a].className = (findKeyword.test(contents)) ? className : className + ' no-match';
		}
		// trigger the promise
		this.promise();
	};

	this.sortBy = function (index) {
		var a, b, unsorted = [],
			sorted = [],
			source = this.sorters[index].getAttribute('data-source'),
			method = this.sorters[index].getAttribute('data-type'),
			sortees = document.querySelectorAll(this.element.getAttribute('data-target')),
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

	this.filterBy = function (index) {
		var a, b, element, className,
			source = this.filters[index].getAttribute('data-source'),
			condition = new RegExp(this.filters[index].getAttribute('data-filter'), 'i'),
			filtrates = document.querySelectorAll(this.element.getAttribute('data-target'));
		// test all sortees
		for (a = 0, b = filtrates.length; a < b; a += 1) {
			element = filtrates[a].querySelector(source);
			className = filtrates[a].className.replace(/ filtered-out/g, '');
			filtrates[a].className = (element && condition.test(element.innerHTML)) ? className : className + ' filtered-out';
		}
	};

	// EVENTS

	this.onSearchSubmit = function (evt) {
		// cancel the submit
		evt.preventDefault();
		// search manually instead
		this.searchFor(this.searchInput.value.trim());
		// deselect the field
		this.searchInput.blur();
	};

	this.onSearchReset = function (evt) {
		// if the  right side of the element is clicked
		if (this.searchInput.offsetWidth - evt.layerX < 32) {
			// cancel the click
			evt.preventDefault();
			// reset the search
			this.searchInput.blur();
			this.searchInput.value = '';
			this.searchFor('');
		}
	};

	this.onSearchChanged = function (evt) {
		var _this = this;
		// wait for the typing to pause
		clearTimeout(this.delay);
		this.delay = setTimeout(function () {
			// perform the search
			_this.searchFor(_this.searchInput.value.trim());
		}, 700);
	};

	this.onSorterSelected = function (evt) {
		// cancel the click
		evt.preventDefault();
		// sort the sortees by the selected sorter
		this.sortBy(this.sortSelect.selectedIndex);
	};

	this.onFilterSelected = function (evt) {
		// cancel the click
		evt.preventDefault();
		// sort the sortees by the selected sorter
		this.filterBy(this.filterSelect.selectedIndex);
	};

	this.init(config);

};

// return as a require.js module
if (typeof define != 'undefined') define([], function () { return Filters });
if (typeof module != 'undefined') module.exports = Filters;
