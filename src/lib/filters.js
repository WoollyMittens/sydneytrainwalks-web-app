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
