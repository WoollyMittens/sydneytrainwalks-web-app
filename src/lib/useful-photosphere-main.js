/*
	Source:
	van Creij, Maurice (2016). "useful.photosphere.js: Projected Photoshere Image", version 20161013, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Photosphere = useful.Photosphere || function() {};

// extend the constructor
useful.Photosphere.prototype.Main = function(config, context) {

  "use strict";

  // PROPERTIES

  this.context = context;
  this.element = config.element;
  this.config = {
    'idle': 0.002,
    'container': document.body,
    'slicer': '{src}'
  };

  for (name in config) {
    this.config[name] = config[name];
  }

  // METHODS

  this.init = function() {
    // set the event handler on the target element
    this.element.addEventListener('click', this.onElementClicked.bind(this));
  };

  this.viewer = function() {
    // create the components
    this.stage = new this.context.Stage(this);
    this.controls = new this.context.Controls(this);
    this.loader = new this.context.Loader(this);
    // create the url for the image sizing webservice
    var size = 'height=1080';
    var src = this.element.getAttribute('href') || this.element.getAttribute('data-src') || this.element.getAttribute('src');
    var url = this.config.slicer.replace('{src}', src).replace('{size}', size);
    // load the viewer
    this.loader.load(url, {
      'complete': this.onViewerComplete.bind(this),
      'update': this.onViewerLoading.bind(this),
      'error': this.onViewerError.bind(this)
    });
  };

  // EVENTS

  this.onElementClicked = function(evt) {
    // prevent the click
    evt.preventDefault();
    // show the busy indicator
    this.busy = new this.context.Busy(this.config.container);
    this.busy.show();
    // load the viewer into the popup
    this.viewer();
    // resolve the opened promise
    if (this.config.opened) { this.config.opened(this.config.element); }
  };

  this.onViewerComplete = function(photo) {
    // hide busy indicator
    this.busy.hide();
    // show the popup
    this.popup = new this.context.Popup(this);
    this.popup.show();
    // create the stage
    this.stage.create(photo);
    // implement the controls
    this.controls.implement();
  };

  this.onViewerLoading = function(progress) {
    // TODO: make busy component show update %
  };

  this.onViewerError = function(message) {
    // hide busy indicator
    this.busy.hide();
    // jump directly to the the locator promise if available
    if (this.config.located) { this.config.located(this.config.element); }
  };

};

// return as a require.js module
if (typeof module !== 'undefined') {
  exports = module.exports.Main = useful.Photosphere.Main;
}
