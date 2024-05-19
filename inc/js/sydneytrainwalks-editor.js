export class Editor {
  constructor(config, loadGuide) {
		this.config = config;
		this.loadGuide = loadGuide;
    this.guide = null;
    this.start = this.start.bind(this);
    this.save = this.save.bind(this);
  }

  htmlEncode(value) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  async update(id) {
		// load the guide that goes with the id
		this.guide = await this.loadGuide(id);
  }

  start() {
    // give up if there is no guide yet
    if (!this.guide) return;
    // for all landmark photos in the guide
    for (let marker of this.guide.markers) {
      if (marker.photo) {
        // find the corresponding legend
        let image = document.querySelector(`.local-area-map-legend-photo[src*="${marker.photo}"]`);
        let legend = image.parentNode.nextSibling;
        let label = legend.querySelector('p');
        // add the input field
        if (label) {
          let textarea = document.createElement('textarea');
          textarea.style.width = '90%';
          textarea.style.height = '96px';
          textarea.style.verticalAlign = 'middle';
          textarea.value = label.innerHTML;
          legend.style.flex = '1 1 auto';
          legend.innerHTML = "";
          legend.appendChild(textarea);
          // handle the changes
          textarea.addEventListener('change', this.edit.bind(this, marker, textarea));
        }
      }
    }
  }

  save() {
    // export the output
    const guideJson = JSON.stringify(this.guide, null, '\t');
    console.log(guideJson);
    localStorage.setItem(this.guide.key, guideJson);
  }

  edit(waypoint, textarea) {
    // update the field
    waypoint.description = textarea.value;
  }
}
