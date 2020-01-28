// extend the class
SydneyTrainWalks.prototype.Achievements = function(parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.config.extend({
		'achievements': document.querySelector('.achievements'),
		'achievement': document.querySelector('.achievement')
	});

	// TODO: add geolocation trigger to localmap.js, like markers but with a promise

	// METHODS

	this.init = function() {};

	// EVENTS

	if(parent) this.init();

};
