// extend the class
SydneyTrainWalks.prototype.Header = function(parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.config.extend({
		'header': document.querySelector('.title a')
	});

	// METHODS

	this.init = function() {
		// add the onclick handler
		this.config.header.onclick = function(evt) {
			evt.preventDefault();
			document.body.className = document.body.className.replace(/screen-photos|screen-guide|screen-map/, 'screen-menu');
		};
	};

  if(parent) this.init();

};
