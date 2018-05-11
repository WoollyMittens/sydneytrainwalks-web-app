/*
	Sydney Train Walks - About View
*/

// create the constructor if needed
var SydneyTrainWalks = SydneyTrainWalks || function() {};

// extend the constructor
SydneyTrainWalks.prototype.About = function(parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.config.extend({
		'about': document.querySelector('.about')
	});

	// METHODS

	this.init = function() {
		
		// return the object
		return this;
	};

	// EVENTS


};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = SydneyTrainWalks.About;
}
