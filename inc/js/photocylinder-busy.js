export class Busy {
	constructor(container) {
		this.container = container;
	}

	show () {
		// construct the spinner
		this.spinner = document.createElement('div');
		this.spinner.className = 'photocylinder-busy';
		this.spinner.setAttribute('data-fixed', (this.container === document.body));
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
