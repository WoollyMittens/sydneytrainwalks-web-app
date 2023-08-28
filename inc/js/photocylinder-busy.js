export class Busy {
	constructor(container) {
		this.container = container;
	}

	show () {
		// construct the spinner
		this.spinner = document.createElement('div');
		this.spinner.className = (this.container === document.body) ?
			'photocylinder-busy photocylinder-busy-fixed photocylinder-busy-active':
			'photocylinder-busy photocylinder-busy-active';
		this.container.appendChild(this.spinner);
	}

	hide () {
		// deconstruct the spinner
		if (this.spinner && this.spinner.parentNode) {
			this.spinner.parentNode.removeChild(this.spinner);
			this.spinner = null;
		}
	}
}
