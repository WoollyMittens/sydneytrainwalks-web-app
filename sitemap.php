<?php

		header('Content-Type: application/xml; charset=utf-8');

		// variables
		$inc = './inc/';

		// load and process the json file
		$jsonText = file_get_contents($inc . "js/guide-data.js");
		$jsonText = preg_split('/ = /i', $jsonText);
		$jsonText = $jsonText[1];
		$jsonText = preg_split('/;/i', $jsonText);
		$jsonText = $jsonText[0];
		$json = json_decode($jsonText);

		echo '<?xml version="1.0" encoding="UTF-8"?>';

?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<?php
		// for each entry
		foreach ($json as $name => $value) {
			if ($value->{'key'} !== '_index') {
				echo '<url><loc>https://www.sydneytrainwalks.com/details.php?id='. $name . '</loc><lastmod>2020-01-10</lastmod></url>';
			}
		}
	?>
</urlset>
