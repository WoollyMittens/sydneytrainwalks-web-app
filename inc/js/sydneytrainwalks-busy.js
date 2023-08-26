// extend the class
SydneyTrainWalks.prototype.Busy = function(parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.config.extend({
		'appView': document.querySelector('#appView')
	});

	// METHODS

	this.init = function() {};

	this.show = function() {
		// remove the cover page
		this.config.appView.className = this.config.appView.className.replace(/-ready/g, '-busy');
	};

	this.hide = function() {
		// remove the cover page
		this.config.appView.className = this.config.appView.className.replace(/-busy/g, '-ready');
	};

  if(parent) this.init();

};
