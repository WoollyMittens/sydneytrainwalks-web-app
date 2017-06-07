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
    // get all the links in the about page
    var allLinks = this.config.about.getElementsByTagName('a');
    for (var a = 0, b = allLinks.length; a < b; a += 1) {
      // add a click event handler
      allLinks[a].addEventListener('click', this.onLinkClicked.bind(this, allLinks[a]));
    }
    // return the object
    return this;
  };

  // EVENTS

  this.onLinkClicked = function(link, evt) {
    // if the link goes to _blank or _system
    if (link.getAttribute('target') && link.getAttribute('target').match(/_blank|_system/i)) {
      // cancel the click
      evt.preventDefault();
      // open it using javascript
      window.open(link.getAttribute('href'), '_system', 'location=yes');
    }
  };

};

// return as a require.js module
if (typeof module !== 'undefined') {
  exports = module.exports = SydneyTrainWalks.About;
}
