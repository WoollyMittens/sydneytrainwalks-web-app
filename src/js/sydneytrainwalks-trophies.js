// extend the class
SydneyTrainWalks.prototype.Trophies = function(parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.config.extend({
		'trophies': document.querySelector('.trophies'),
		'trophy': document.querySelector('.trophy')
	});

	// TODO: add geolocation trigger to localmap.js, like markers but with a promise

	// METHODS

	this.init = function() {};

	// EVENTS

	if(parent) this.init();

};
