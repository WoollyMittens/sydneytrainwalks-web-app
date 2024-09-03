// dependencies
import fsp from 'fs/promises';
const indexJson = '../inc/guides/index.json';
const sitemapXml = '../sitemap.xml';

// processes a script from the queue the master json object
async function parseGuides() {
	let contents = await fsp.readFile(indexJson);
	console.log('loaded index:', indexJson);
	let indexData = JSON.parse(contents);

	const date = new Date();
	const year = date.getFullYear();
	const month = ("0" + date.getMonth()).slice (-2);
	const day = ("0" + date.getDate()).slice (-2);
	let entries = ``;

	for (let marker of indexData.markers) {
		entries += `
		<url>
			<loc>https://www.sydneyhikingtrips.com/?key=${marker.key}</loc>
			<lastmod>${marker.revised}</lastmod>
			<changefreq>Monthly</changefreq>
		</url>`;
	}

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
		<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
			<url>
				<loc>https://www.sydneyhikingtrips.com/</loc>
				<lastmod>${year}-${month}-${day}</lastmod>
				<changefreq>Monthly</changefreq>
			</url>
			<url>
				<loc>https://www.sydneyhikingtrips.com/?screen=trophies</loc>
				<lastmod>${year}-${month}-${day}</lastmod>
				<changefreq>Monthly</changefreq>
			</url>
			<url>
				<loc>https://www.sydneyhikingtrips.com/?screen=about</loc>
				<lastmod>${year}-${month}-${day}</lastmod>
				<changefreq>Monthly</changefreq>
			</url>
			${entries}
		</urlset>`;

	console.log('generated sitemap:', sitemap);

	// save the sitemap
	let saved = await fsp.writeFile(sitemapXml, sitemap);

	console.log('saved sitemap:', sitemapXml, saved);
}

// start processing the queue
parseGuides();