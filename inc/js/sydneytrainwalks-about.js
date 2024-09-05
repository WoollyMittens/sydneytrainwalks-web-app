export class About {
	constructor(config) {
		this.config = config;
		this.aboutElement = document.querySelector('.about')
		this.init();
	}

	updateMeta() {
		// format the guide data
		const title = `About this website - Sydney Hiking Trips`;
		const description = `Information about this website and the associated mobile apps.`;
		const url = `./?screen=about`;
		const canonical = `${this.config.rootDomain}?key=about`;
		// update the route without refreshing
		window.history.pushState({'key': 'about'}, title, url);
		// update the meta elements
		document.querySelector('title').innerHTML = title;
		document.querySelector('meta[name="description"]')?.setAttribute('content', description);
		document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonical);
		document.querySelector('meta[property="og:image"]')?.setAttribute('content', this.config.remoteUrl + `/img/splash.jpg`);
		document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
		document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
		document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical);
	}

	init() {}
}
