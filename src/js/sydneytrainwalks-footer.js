/*
	Sydney Train Walks - Footer Navigation
*/

// create the constructor if needed
var SydneyTrainWalks = SydneyTrainWalks || function() {};

// extend the constructor
SydneyTrainWalks.prototype.Footer = function(parent) {

  // PROPERTIES

  this.parent = parent;
  this.config = parent.config;
  this.config.extend({
    'footer': document.querySelector('.toolbar'),
    'footerTemplate': document.getElementById('footer-template')
  });

  // METHODS

  this.init = function() {
    // build the footer with a blank id
    this.update(null);
    // add a global click handler to the footer
    this.config.footer.addEventListener('click', this.onFooterClicked.bind(this));
    // return the object
    return this;
  };

  this.update = function() {
    // fill the menu with options
    this.config.footer.innerHTML = this.config.footerTemplate.innerHTML;
  };

  // EVENTS

  this.onFooterClicked = function(evt) {
    // cancel any clicks
    evt.preventDefault();
    // get the target of the click
    var target = evt.target || evt.srcElement,
      id = target.getAttribute('id');
    // if a button was clicked
    if (id && id.match(/footer-to-/)) {
      // reset the local storage when returning to the menu
      if (id.match(/-menu|-about/)) {
        window.localStorage.removeItem('id');
        window.localStorage.removeItem('mode');
      }
      // apply the mode to the body
      document.body.className = 'screen-' + id.substr(10);
    }
  };
};

// return as a require.js module
if (typeof module !== 'undefined') {
  exports = module.exports = SydneyTrainWalks.Footer;
}
