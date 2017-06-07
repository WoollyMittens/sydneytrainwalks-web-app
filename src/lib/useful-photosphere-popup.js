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
useful.Photosphere.prototype.Popup = function(parent) {

  "use strict";

  // PROPERTIES

  this.parent = parent;
  this.config = parent.config;

  // METHODS

  this.show = function() {
    // if the popup doesn't exist
    if (!this.config.figure) {
      // create a container for the popup
      this.config.figure = document.createElement('figure');
      this.config.figure.className = (this.config.container === document.body) ?
        'photosphere-popup photosphere-popup-fixed photosphere-popup-passive' :
        'photosphere-popup photosphere-popup-passive';
      // add a close gadget
      this.addCloser();
      // add a locator gadget
      this.addLocator();
      // add the popup to the document
      this.config.container.appendChild(this.config.figure);
      // reveal the popup when ready
      setTimeout(this.onShow.bind(this), 0);
    }
  };

  this.hide = function() {
    // if there is a popup
    if (this.config.figure) {
      // unreveal the popup
      this.config.figure.className = this.config.figure.className.replace(/-active/gi, '-passive');
      // and after a while
      var _this = this;
      setTimeout(function() {
        // remove it
        _this.config.container.removeChild(_this.config.figure);
        // remove its reference
        _this.config.figure = null;
      }, 500);
    }
  };

  this.addCloser = function() {
    // build a close gadget
    var closer = document.createElement('a');
    closer.className = 'photosphere-closer';
    closer.innerHTML = 'x';
    closer.href = '#close';
    // add the close event handler
    closer.addEventListener('click', this.onHide.bind(this));
    closer.addEventListener('touchstart', this.onHide.bind(this));
    // add the close gadget to the image
    this.config.figure.appendChild(closer);
  };

  this.addLocator = function(url) {
    // build the geo marker icon
    var locator = document.createElement('a');
    locator.className = 'photosphere-locator';
    locator.innerHTML = 'Show on a map';
    locator.href = '#map';
    // add the event handler
    locator.addEventListener('click', this.onLocate.bind(this));
    locator.addEventListener('touchstart', this.onLocate.bind(this));
    // add the location marker to the image
    this.config.figure.appendChild(locator);
  };

  // EVENTS

  this.onShow = function() {
    // show the popup
    this.config.figure.className = this.config.figure.className.replace(/-passive/gi, '-active');
    // trigger the closed event if available
    if (this.config.opened) {
      this.config.opened(this.config.element);
    }
  };

  this.onHide = function(evt) {
    // cancel the click
    evt.preventDefault();
    // close the popup
    this.hide();
    // trigger the closed event if available
    if (this.config.closed) {
      this.config.closed(this.config.element);
    }
  };

  this.onLocate = function(evt) {
    // cancel the click
    evt.preventDefault();
    // trigger the located event if available
    if (this.config.located) {
      this.config.located(this.config.element);
    }
  };

};

// return as a require.js module
if (typeof module !== 'undefined') {
  exports = module.exports = useful.Photosphere.Popup;
}
