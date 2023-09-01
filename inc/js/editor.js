export class Editor {
  constructor() {
    this.landmarks = document.querySelectorAll('.guide-landmark');
    this.output = [];
    this.init();
  }

  init() {
    var image, label, textarea;
    // for all landmarks
    for (var a = 0, b = this.landmarks.length; a < b; a += 1) {
      // get the image
      image = this.landmarks[a].querySelector('img');
      // get the label
      label = this.landmarks[a].querySelector('.guide-text');
      label.style.flex = '1 1 auto';
      // replace the label with an input field
      textarea = document.createElement('textarea');
      textarea.style.width = '90%';
      textarea.style.height = '96px';
      textarea.style.verticalAlign = 'middle';
      textarea.value = label.innerHTML.split('<button')[0].trim();
      textarea.addEventListener('change', this.update.bind(this, textarea, image, a));
      label.replaceChild(textarea, label.firstChild);
      // store the data
      this.output[a] = {
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

  update(input, image, index, evt) {
    // update the field
    this.output[index].description = input.value;
  }
}
