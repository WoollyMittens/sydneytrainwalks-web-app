export class Editor {
  constructor() {
    this.output = [];
    this.init = this.init.bind(this);
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

  init() {
    var image, label, textarea;
    // for all landmarks
    const photos = [...document.querySelectorAll('dt.localmap-legend-waypoint img')];
    const descriptions = [...document.querySelectorAll('dd.localmap-legend-waypoint p')];
    for (let index in photos) {
      // get the image
      image = photos[index];
      // get the label
      label = descriptions[index];
      label.style.flex = '1 1 auto';
      // replace the label with an input field
      textarea = document.createElement('textarea');
      textarea.style.width = '90%';
      textarea.style.height = '96px';
      textarea.style.verticalAlign = 'middle';
      textarea.value = label.innerHTML; //this.htmlEncode(label.innerHTML);
      textarea.addEventListener('change', this.update.bind(this, textarea, index));
      label.innerHTML = "";
      label.appendChild(textarea);
      // store the data
      this.output[index] = {
        "type": "waypoint",
  			"photo": image.src.split("/").pop(),
  			"description": textarea.value
      }
    }
  }

  save() {
    // export the output
    console.log(JSON.stringify(this.output, null, '\t'));
  }

  update(input, index, evt) {
    // update the field
    this.output[index].description = input.value;
  }
}
