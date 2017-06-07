/*
	Source:
	van Creij, Maurice (2014). "useful.photowall.js: Simple photo wall", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Photowall = useful.Photowall || function() {};

// extend the constructor
useful.Photowall.prototype.Main = function(config, context) {

  // PROPERTIES

  "use strict";
  this.config = config;
  this.context = context;
  this.element = config.element;

  // METHODS

  this.init = function() {
    var photoPopup, PhotoPopup;
    // find all the links
    var links = this.element.getElementsByTagName('a');
    // decide for each link what viewer to use
    for (var a = 0, b = links.length; a < b; a += 1) {
      PhotoPopup = (this.config.spherical.test(links[a])) ? useful.Photosphere : useful.Photozoom;
      photoPopup = new PhotoPopup().init({
        'element': links[a],
        'container': this.config.element,
        'zoom': 2,
        'sizer': null,
        'slicer': this.config.slice,
        'opened': this.config.opened,
        'located': this.config.located,
        'closed': this.config.closed
      });
    }
    // return the object
    return this;
  };

};

// return as a require.js module
if (typeof module !== 'undefined') {
  exports = module.exports = useful.Photowall.Main;
}
