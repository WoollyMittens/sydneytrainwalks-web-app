export class PhotoCylinderFallback {
	constructor(config) {
		this.config = config;
		this.popup = this.config.popup;
		this.image = this.config.image;
		this.imageAspect = null;
		this.wrapper = null;
		this.wrapperAspect = null;
		this.overlay = null;
		this.magnification = {};
		this.horizontal = {};
		this.vertical = {};
		this.tracked = null;
		this.increment = this.config.idle / 200;
		this.auto = true;
	}

	init() {
		// prepare the markup
		this.build();
		// render the display
		this.render();
		// add the controls
		this.controls();
		// rescale after resize
		this.resizeListener = this.resize.bind(this);
		window.addEventListener('resize', this.resizeListener, { capture: true, passive: true });
	}

	destroy() {
		// cancel all global event listeners
		window.removeEventListener('resize', this.resizeListener, { capture: true, passive: true });
		window.removeEventListener('deviceorientation', this.tiltListener, { capture: true, passive: true });
		// remove the container
		this.popup.removeChild(this.wrapper);
	}

	build() {
		// add the wrapper
		this.wrapper = document.createElement('div');
		this.wrapper.setAttribute('class', 'photocylinder photocylinder-fallback');
		this.wrapper.appendChild(this.image);
		// add the overlay
		this.overlay = document.createElement('div');
		this.overlay.setAttribute('class', 'photocylinder-overlay');
		this.wrapper.appendChild(this.overlay);
		// insert the object
		this.popup.appendChild(this.wrapper);
	}

	render() {
		// get the aspect ratio from the image
		this.imageAspect = this.image.offsetWidth / this.image.offsetHeight;
		// calculate the zoom limits
		this.magnification.min = 1; // TODO: make sure the image fills the width and height
		this.magnification.max = 4;
		// set the initial rotation
		this.recentre();
		// set the initial zoom
		this.resize();
		// if the image is wide enough, start the idle animation
		if (this.imageAspect - this.wrapperAspect >= 1) this.animate();
	}

	controls() {
		// add touch controls
		this.overlay.addEventListener('touchstart', this.touch.bind(this, 'start'), { capture: true, passive: true });
		this.overlay.addEventListener('touchmove', this.touch.bind(this, 'move'), { capture: true, passive: true });
		this.overlay.addEventListener('touchend', this.touch.bind(this, 'end'), { capture: true, passive: true });
		// add mouse controls
		this.overlay.addEventListener('mousedown', this.touch.bind(this, 'start'), { capture: true, passive: true });
		this.overlay.addEventListener('mousemove', this.touch.bind(this, 'move'), { capture: true, passive: true });
		this.overlay.addEventListener('mouseup', this.touch.bind(this, 'end'), { capture: true, passive: true });
		this.overlay.addEventListener('mousewheel', this.wheel.bind(this), { capture: true, passive: true });
	    this.overlay.addEventListener('DOMMouseScroll', this.wheel.bind(this), { capture: true, passive: true });
		// add tilt contols
		this.tiltListener = this.tilt.bind(this);
		window.addEventListener("deviceorientation", this.tiltListener, { capture: true, passive: true });
	}

	coords(evt) {
		return {
			x: evt.screenX || evt.touches[0].screenX,
			y: evt.screenY || evt.touches[0].screenY,
			z: (evt.touches && evt.touches.length > 1) ? Math.abs(evt.touches[0].screenX - evt.touches[1].screenX + evt.touches[0].screenY - evt.touches[1].screenY) : 0
		}
	}

	recentre() {
		// reset the initial position
		this.magnification.current = this.magnification.min * 1.25;
		this.horizontal.current = 0.5;
		this.vertical.current = 0.5;
	}

	magnify(factor) {
		// limit the zoom
		this.magnification.current = Math.max(Math.min(factor, this.magnification.max), this.magnification.min);
		// (re)calculate the movement limits
		this.horizontal.min = Math.min(0.5 - (this.magnification.current -  this.wrapperAspect / this.imageAspect) / 2, 0.5);
		this.horizontal.max = Math.max(1 - this.horizontal.min, 0.5);
		this.horizontal.current = Math.max(Math.min(this.horizontal.current, this.horizontal.max), this.horizontal.min);
		this.vertical.min = Math.min(0.5 - (this.magnification.current - 1) / 2, 0.5);
		this.vertical.max = Math.max(1 - this.vertical.min, 0.5);
		this.vertical.current = Math.max(Math.min(this.vertical.current, this.vertical.max), this.vertical.min);
		// implement the zoom
		this.redraw();
	}

	move(horizontal, vertical) {
		// implement the movement
		this.horizontal.current = Math.max(Math.min(horizontal, this.horizontal.max), this.horizontal.min);
		this.vertical.current = Math.max(Math.min(vertical, this.vertical.max), this.vertical.min);
		// implement the zoom
		this.redraw();
	}

	momentum() {
		// on requestAnimationFrame count down the delta vectors to ~0
		if (this.magnification.delta || this.horizontal.delta || this.vertical.delta) {
			// reduce the increment
			this.magnification.delta = (Math.abs(this.magnification.delta) > 0.0001) ? this.magnification.delta / 1.05 : 0;
			this.horizontal.delta = (Math.abs(this.horizontal.delta) > 0.001) ? this.horizontal.delta / 1.05 : 0;
			this.vertical.delta = (Math.abs(this.vertical.delta) > 0.001) ? this.vertical.delta / 1.05 : 0;
			// advance rotation incrementally
			this.move(this.horizontal.current + this.horizontal.delta, this.vertical.current + this.vertical.delta);
			this.magnify(this.magnification.current + this.magnification.delta);
			// wait for the next render
			window.requestAnimationFrame(this.momentum.bind(this));
		}
	}

	redraw() {
		// apply all transformations in one go
		this.image.style.transform = 'translate(' + (this.horizontal.current * -100) + '%, ' + (this.vertical.current * -100) + '%) scale(' + this.magnification.current + ', ' + this.magnification.current + ')';
	}

	animate(allow) {
		// accept overrides
		if (typeof allow === 'boolean') {
			this.auto = allow;
		}
		// if animation is allowed
		if (this.auto) {
			// in 180 degree pictures adjust increment and reverse, otherwise loop forever
			if (this.horizontal.current + this.increment * 2 > this.horizontal.max) this.increment = -this.config.idle / 200;
			if (this.horizontal.current + this.increment * 2 < this.horizontal.min) this.increment = this.config.idle / 200;
			var step = this.horizontal.current + this.increment;
			// advance rotation incrementally, until interrupted
			this.move(step, this.vertical.current);
			window.requestAnimationFrame(this.animate.bind(this));
		}
	}

	tilt(evt) {
		// stop animating
		this.auto = false;
		// if there was tilt before and the jump is not extreme
		if (this.horizontal.tilted && this.vertical.tilted && Math.abs(evt.alpha - this.horizontal.tilted) < 45 && Math.abs(evt.beta - this.vertical.tilted) < 45) {
			// update the rotation
			this.move(
				this.horizontal.current - (evt.alpha - this.horizontal.tilted) / 180,
				this.vertical.current - (evt.beta - this.vertical.tilted) / 180
			);
		}
		// store the tilt
		this.horizontal.tilted = evt.alpha;
		this.vertical.tilted = evt.beta;
	}

	wheel(evt) {
		// stop animating
		this.auto = false;
		// reset the deltas
		this.magnification.delta = 0;
		// get the feedback
		var coords = this.coords(evt);
		var distance = evt.deltaY || evt.wheelDeltaY || evt.wheelDelta;
		this.magnification.delta = distance / this.wrapper.offsetHeight;
		this.magnify(this.magnification.current + this.magnification.delta);
		// continue based on inertia
		this.momentum();
	}

	touch(phase, evt) {
		// pick the phase of interaction
		var coords, scale = this.magnification.current / this.magnification.min;
		switch(phase) {
			case 'start':
				// stop animating
				this.auto = false;
				// reset the deltas
				this.magnification.delta = 0;
				this.horizontal.delta = 0;
				this.vertical.delta = 0;
				// start tracking
				this.tracked = this.coords(evt);
				break;
			case 'move':
				if (this.tracked) {
					coords = this.coords(evt);
					// store the momentum
					this.magnification.delta = (this.tracked.z - coords.z) / this.wrapper.offsetWidth * scale * 2;
					this.horizontal.delta = (this.tracked.x - coords.x) / this.wrapper.offsetWidth * scale / this.imageAspect;
					this.vertical.delta = (this.tracked.y - coords.y) / this.wrapper.offsetHeight * scale;
					// calculate the position
					this.move(this.horizontal.current + this.horizontal.delta, this.vertical.current + this.vertical.delta);
					// calculate the zoom
					this.magnify(this.magnification.current - this.magnification.delta);
					// update the step
					this.tracked.x = coords.x;
					this.tracked.y = coords.y;
					this.tracked.z = coords.z;
				}
				break;
			case 'end':
				// stop tracking
				this.tracked = null;
				// continue based on inertia
				this.momentum();
				break;
		}
	}

	resize() {
		// update the aspect ratio
		this.wrapperAspect = this.wrapper.offsetWidth / this.wrapper.offsetHeight;
		// restore current values
		var factor = this.magnification.current || 1;
		var horizontal = this.horizontal.current || 0.5;
		var vertical = this.vertical.current || 0.5;
		// reset to zoom
		this.magnify(factor);
		// reset the rotation
		this.move(horizontal, vertical);
	}
}
