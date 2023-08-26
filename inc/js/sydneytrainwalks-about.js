// extend the class
SydneyTrainWalks.prototype.About = function(parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.config.extend({
		'about': document.querySelector('.about')
	});

	// METHODS

	this.init = function() {};

	// EVENTS

	if(parent) this.init();

};
