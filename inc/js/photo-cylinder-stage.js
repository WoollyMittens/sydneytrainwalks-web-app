export class PhotoCylinderStage {
	constructor(config) {
		this.config = config;
		this.popup = this.config.popup;
		this.image = this.config.image;
		this.imageAspect = null;
		this.wrapper = null;
		this.wrapperAspect = null;
		this.baseAngle = 60;
		this.baseSize = 500;
		this.obj = null;
		this.objRow = null;
		this.objCols = [];
		this.magnification = {};
		this.rotation = {};
		this.offset = {};
		this.tracked = null;
		this.increment = this.config.idle;
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
		this.wrapper.setAttribute('class', 'photocylinder');
		// add the overlay
		this.overlay = document.createElement('div');
		this.overlay.setAttribute('class', 'photocylinder-overlay');
		this.wrapper.appendChild(this.overlay);
		// add the row object
		this.objRow = document.createElement('div');
		this.objRow.setAttribute('class', 'photocylinder-obj-row');
		this.wrapper.appendChild(this.objRow);
		// add the column oblects
		for (var a = 0, b = 8; a < b; a += 1) {
			this.objCols[a] = document.createElement('span');
			this.objCols[a].setAttribute('class', 'photocylinder-obj-col photocylinder-obj-col-' + a);
			this.objRow.appendChild(this.objCols[a]);
		}
		// add the image
		this.wrapper.appendChild(this.image);
		// insert the object
		this.popup.appendChild(this.wrapper);
	}

	render() {
		// get the aspect ratio from the image
		this.imageAspect = this.image.offsetWidth / this.image.offsetHeight;
		// get the field of view property or guess one
		this.wrapper.className += (this.config.fov < 360) ? ' photocylinder-180' : ' photocylinder-360';
		// calculate the zoom limits - scale = aspect * (360 / fov) * 0.3
		this.magnification.min = Math.max(this.imageAspect * (360 / this.config.fov) * 0.3, 1);
		this.magnification.max = 4;
		this.magnification.current = this.magnification.min * 1.25;
		// the offset limits are 0 at zoom level 1 be definition, because there is no overscan
		this.offset.min = 0;
		this.offset.max = 0;
		// set the image source as the background image for the polygons
		var url = this.image.getAttribute('src');
		for (var a = 0, b = this.objCols.length; a < b; a += 1) {
			this.objCols[a].style.backgroundImage = `url("${url}")`;
		}
		// set the initial zoom
		this.resize();
		// set the initial rotation
		this.recentre();
		// start the idle animation
		this.animate();
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
		// reset the initial rotation
		this.rotate(this.config.fov/2);
	}

	magnify(factor, offset) {
		// limit the zoom
		this.magnification.current = Math.max(Math.min(factor, this.magnification.max), this.magnification.min);
		// calculate the view angle
		this.baseAngle = 60 * this.wrapperAspect * (this.magnification.min / this.magnification.current);
		// centre the zoom
		this.offset.max = (this.magnification.current - this.magnification.min) / 8;
		this.offset.min = -1 * this.offset.max;
		this.offset.current = Math.max(Math.min(offset, this.offset.max), this.offset.min);
		// calculate the rotation limits
		var overscanAngle = (this.baseAngle - 360 / this.objCols.length) / 2;
		this.rotation.min = (this.config.fov < 360) ? overscanAngle : 0;
		this.rotation.max = (this.config.fov < 360) ? this.config.fov - this.baseAngle + overscanAngle : this.config.fov;
		// redraw the object
		this.redraw();
	}

	rotate(angle) {
		// limit or loop the rotation
		this.rotation.current = (this.config.fov < 360) ? Math.max(Math.min(angle, this.rotation.max), this.rotation.min) : angle%360 ;
		// redraw the object
		this.redraw();
	}

	momentum() {
		// on requestAnimationFrame count down the delta vectors to ~0
		if (this.rotation.delta || this.magnification.delta || this.offset.delta) {
			// reduce the increment
			this.rotation.delta = (Math.abs(this.rotation.delta) > 0.1) ? this.rotation.delta / 1.05 : 0;
			this.magnification.delta = (Math.abs(this.magnification.delta) > 0.0001) ? this.magnification.delta / 1.05 : 0;
			this.offset.delta = (Math.abs(this.offset.delta) > 0.001) ? this.offset.delta / 1.05 : 0;
			// advance rotation incrementally
			this.rotate(this.rotation.current + this.rotation.delta);
			this.magnify(this.magnification.current + this.magnification.delta, this.offset.current + this.offset.delta);
			// wait for the next render
			window.requestAnimationFrame(this.momentum.bind(this));
		}
	}

	redraw() {
		// update the relative scale
		var scale = this.wrapper.offsetHeight / this.baseSize;
		// apply all transformations in one go
		this.objRow.style.transform = 'translate(-50%, ' + ((0.5 + this.offset.current * scale) * -100) + '%) scale(' + (this.magnification.current * scale) + ') rotateY(' + this.rotation.current + 'deg)';
	}

	animate(allow) {
		// accept overrides
		if (typeof allow === 'boolean') {
			this.auto = allow;
		}
		// if animation is allowed
		if (this.auto) {
			// in 180 degree pictures adjust increment and reverse, otherwise loop forever
			if (this.rotation.current + this.increment * 2 > this.rotation.max) this.increment = -this.config.idle;
			if (this.rotation.current + this.increment * 2 < this.rotation.min) this.increment = this.config.idle;
			var step = (this.config.fov < 360) ? this.rotation.current + this.increment : (this.rotation.current + this.increment) % 360;
			// advance rotation incrementally, until interrupted
			this.rotate(step);
			window.requestAnimationFrame(this.animate.bind(this));
		}
	}

	tilt(evt) {
		// stop animating
		this.auto = false;
		// if there was tilt before and the jump is not extreme
		if (this.rotation.tilted && Math.abs(evt.alpha - this.rotation.tilted) < 45) {
			// update the rotation
			this.rotate(this.rotation.current - evt.alpha + this.rotation.tilted);
		}
		// store the tilt
		this.rotation.tilted = evt.alpha;
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
		this.magnify(this.magnification.current + this.magnification.delta, this.offset.current);
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
				this.rotation.delta = 0;
				this.magnification.delta = 0;
				this.offset.delta = 0;
				// start tracking
				this.tracked = this.coords(evt);
				break;
			case 'move':
				if (this.tracked) {
					coords = this.coords(evt);
					// store the momentum
					this.rotation.delta = this.baseAngle * (this.tracked.x - coords.x) / this.wrapper.offsetWidth * scale;
					this.magnification.delta = (this.tracked.z - coords.z) / this.wrapper.offsetWidth * scale * 2;
					this.offset.delta = (this.tracked.y - coords.y) / this.wrapper.offsetHeight;
					// calculate the rotation
					this.rotate(this.rotation.current + this.rotation.delta);
					// calculate the zoom
					this.magnify(this.magnification.current - this.magnification.delta, this.offset.current + this.offset.delta);
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
		// update the wrapper aspect ratio
		this.wrapperAspect = (this.wrapper.offsetWidth / this.wrapper.offsetHeight);
		// restore current values
		var factor = this.magnification.current || 1;
		var offset = this.offset.current || 0;
		var angle = this.rotation.current || this.config.fov/2;
		// reset to zoom
		this.magnify(factor, offset);
		// reset the rotation
		this.rotate(angle);
	}
}
