<?php

		header('Content-Type: application/xml; charset=utf-8');

		// constants
		include 'constants.php';

		// load and process the json file
		$jsonText = file_get_contents("./inc/js/guide-data.js");
		$jsonText = preg_split('/ = /i', $jsonText);
		$jsonText = $jsonText[1];
		$jsonText = preg_split('/;/i', $jsonText);
		$jsonText = $jsonText[0];
		$json = json_decode($jsonText);

		echo '<?xml version="1.0" encoding="UTF-8"?>';

?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url>
		<loc><?php echo 'https://' . $domain . '/'; ?></loc>
		<lastmod><?php echo date('Y-m-d'); ?></lastmod>
		<changefreq>Daily</changefreq>
	</url>
	<?php
		// for each entry
		foreach ($json as $name => $value) {
			if ($value->{'key'} !== '_index') {
				echo '<url><loc>https://' . $domain . '/details.php?id='. $value->{'key'} . '</loc><lastmod>' . $value->{'updated'} . '</lastmod><changefreq>Monthly</changefreq></url>';
			}
		}
	?>
	<url>
		<loc><?php echo 'https://' . $domain . '/about.php'; ?></loc>
		<lastmod><?php echo $revision; ?></lastmod>
		<changefreq>Yearly</changefreq>
	</url>
</urlset>
