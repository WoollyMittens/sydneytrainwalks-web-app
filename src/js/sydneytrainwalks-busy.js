/*
	Sydney Train Walks - Footer Navigation
*/

// create the constructor if needed
var SydneyTrainWalks = SydneyTrainWalks || function() {};

// extend the constructor
SydneyTrainWalks.prototype.Busy = function(parent) {

  // PROPERTIES

  this.parent = parent;
  this.config = parent.config;
  this.config.extend({
    'appView': document.querySelector('#appView')
  });

  // METHODS

  this.init = function() {
    // return the object
    return this;
  };

  this.show = function() {
    // remove the cover page
    this.config.appView.className = this.config.appView.className.replace(/-ready/g, '-busy');
  };

  this.hide = function() {
    // remove the cover page
    this.config.appView.className = this.config.appView.className.replace(/-busy/g, '-ready');
  };

};

// return as a require.js module
if (typeof module !== 'undefined') {
  exports = module.exports = SydneyTrainWalks.Busy;
}
