<!DOCTYPE html>
<html class="ios-false">
	<?php

		// variables
		$id = (@$_REQUEST['id']) ? @$_REQUEST['id'] : 'cowan-taffyslookout-brooklyn';
		$inc = './inc/';

		$jsonText = file_get_contents($inc . 'js/guide-data.js');
		$jsonText = preg_split('/ = /i', $jsonText);
		$jsonText = $jsonText[1];
		$jsonText = preg_split('/;/i', $jsonText);
		$jsonText = $jsonText[0];
		$json = json_decode($jsonText)->$id;

		// formal title
		$title = "From " . $json->{'markers'}->{'start'}->{'location'} . " via " . $json->{'location'} . " to " . $json->{'markers'}->{'end'}->{'location'};
		$description = join(' ', $json->{'description'});
		$description = strip_tags($description);

		// determine the path of the assets
		$assets = $id;
		if (property_exists($json, 'assets')) { $assets = $json->{'assets'}->{'prefix'}; }

	?>
	<head>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta http-equiv="imagetoolbar" content="no"/>
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<title>Sydney Train Walks - <?php echo $title?></title>
		<meta name="viewport" content="initial-scale=1, minimum-scale=1, maximum-scale=1, width=device-width, user-scalable=yes"/>
		<meta property="og:url" content="http://www.sydneytrainwalks.com/details.php?id=<?php echo $id ?>" />
		<meta property="og:image" content="http://www.sydneytrainwalks.com/inc/social/<?php echo $id ?>.png" />
		<meta property="og:title" content="Sydney Train Walks - <?php echo $title ?>" />
		<meta property="og:description" content="<?php echo $description ?>" />
		<link rel="apple-touch-icon" href="./inc/img/favicon.png"/>
		<link rel="icon" href="./inc/img/favicon.png"/>
		<!--[if IE]>
			<link rel="shortcut icon" href="./inc/img/favicon.ico">
			<script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
		<![endif]-->
		<meta name="msapplication-TileColor" content="#0D47A1"/>
		<meta name="msapplication-TileImage" content="./inc/img/favicon.png"/>
		<link rel="stylesheet" href="./inc/css/styles.css"/>
		<script type="text/javascript">
			var _gaq = _gaq || [];
			_gaq.push(['_setAccount', 'UA-52552-7']);
			_gaq.push(['_trackPageview']);
			(function() {
				var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
				ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
				var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
			})();
		</script>
	</head>
	<body class="screen-map">
		<div class="ios-margins">
			<section id="appView">
				<header class="title">
					<h1><a href="./">Sydney Train Walks</a></h1>
				</header>
				<header class="subtitle">
					<h2 onclick="document.location.replace('./')">
						<span class="sign from">From</span>
						<span class="sign <?php print $json->{'markers'}->{'start'}->{'type'}?>"><?php print $json->{'markers'}->{'start'}->{'location'}?></span>
						<span class="sign to">via</span>
						<span class="sign park"><?php print $json->{'location'}?> <i><?php print $json->{'duration'}?>h / <?php print $json->{'length'}?>km</i></span>
						<span class="sign to">to</span>
						<span class="sign <?php print $json->{'markers'}->{'end'}->{'type'}?>"><?php print $json->{'markers'}->{'end'}->{'location'}?></span>
					</h2>
				</header>
				<article class="guide guide-closed">
					<div class="guide-scroller">
						<h2>About this walk</h2>
						<p><?php print join('</p><p>', $json->{'description'}) ?></p>
						<p>
							It takes about <?php print $json->{'duration'}?> hours to complete the full <?php print $json->{'length'}?> kilometre walk, with plenty of breaks and photography stops.
							A brisk walker can do this much faster, but consider that there's a lot to see along the way.
						</p>
						<h3>Getting there and back</h3>
						<?php print $json->{'markers'}->{'start'}->{'description'}?>
						<?php print $json->{'markers'}->{'end'}->{'description'}?>
						<h3>Along the way</h3>
						<?php
							if (property_exists($json, 'landmarks')) {
								foreach ($json->{'landmarks'} as $name => $value) {
									$isOptional = '/optional: |detour: |attention: /i';
									if (preg_match($isOptional, $value)) {
										$highlightClass = explode(':', $value);
										$value = preg_replace($isOptional, '', $value);
										?><div class="guide-<?php echo strtolower($highlightClass[0]) ?>"><p><a href="./inc/medium/<?php echo $assets ?>/<?php echo strtolower($name) ?>.jpg" class="cylinder-image" style="background-image:linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8)), url(./inc/small/<?php echo $assets ?>/<?php echo strtolower($name) ?>.jpg);" data-desc="<?php echo $value ?>"><img alt="" src="./inc/small/<?php echo $assets ?>/<?php echo strtolower($name) ?>.jpg"></a> <?php echo $value ?></p></div><?php
									} else {
										?><p><a href="./inc/medium/<?php echo $assets ?>/<?php echo strtolower($name) ?>.jpg" class="cylinder-image" style="background-image:linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8)), url(./inc/small/<?php echo $assets ?>/<?php echo strtolower($name) ?>.jpg);" data-desc="<?php echo $value ?>"><img alt="" src="./inc/small/<?php echo $assets ?>/<?php echo strtolower($name) ?>.jpg"></a> <?php echo $value ?></p><?php
									}
								}
							} else {
								?><p>Detailed guides like <a href="http://errantventure.local/~woolly/Trainwalks/details.php?id=adamstown-awabakal-newcastle">this</a> will be rolled out in increments as they are completed.</p><?php
							}
						?>
						<h3>What to bring</h3>
						<ul>
							<li>Check the <a href="http://www.nationalparks.nsw.gov.au/alert/state-alerts">national parks website</a> for possible detours, closures and restrictions.</li>
							<li>Install an OpenStreetMap app for <a href="http://wiki.openstreetmap.org/wiki/Android">Android</a> or <a href="http://wiki.openstreetmap.org/wiki/Apple_iOS">iOS</a> and preload the area.</li>
							<li>Download the <a href="<?php print $inc ?>gpx/<?php print $id ?>.gpx">GPS data</a> if your device can import it.</li>
							<li>Print out this map and get a better one from a visitor information centre if possible.</li>
							<li>Be sure to leave enough charge in your phone's battery for emergency calls.</li>
							<li>Bring plenty of water, comfortable shoes, a hat and SPF 30 sunscreen.</li>
							<li>Also bring a light windbreaker/raincoat in case you get caught out in the rain.</li>
						</ul>
					</div>
				</article>
				<aside>
					<figure class="photomap">
						<a class="photomap-return" href="#" onclick="document.body.className='screen-' + returnTo;">Back</a>
						<div class="photomap-leaflet" id="leaflet"></div>
					</figure>
					<figure class="photowall">
						<ul>
							<?php
								// find the files
								$small = glob($inc . "small/" . $assets . "/*.jpg");
								$medium = glob($inc . "medium/" . $assets . "/*.jpg");
								$min = 0;
								$max = count($small);
								// apply the optional limit
								if (property_exists($json, 'assets')) { $min = $json->{'assets'}->{'start'}; $max = $json->{'assets'}->{'end'} + 1; }
								// write the thumbnails
								for ($a = $min; $a < $max; $a++) {
									?><li><a class="cylinder-image" style="background-image:url('<?php echo $small[$a]?>');" href="<?php echo $medium[$a]?>"><img alt="" src="<?php echo $small[$a]?>"/></a></li><?php
								}
							?>
						</ul>
					</figure>
					<script src="./inc/js/exif-data.js"></script>
					<script src="./inc/js/gpx-data.js"></script>
					<script src="./inc/js/scripts.js"></script>
					<script>
					//<!--

						/*
							map back button
						*/

						var returnTo = 'guide';

						/*
							photo wall configuration
						*/

						var photowall = new useful.Photowall().init({
							'element' : document.querySelector('.photowall')
						});

						/*
							photo cylinder configuration
						*/

						var photocylinder_guide = new useful.Photocylinder().init({
							'elements' : document.querySelectorAll('.guide .cylinder-image'),
							'container' : document.querySelector('.guide'),
							'spherical': /fov360|\d{3}_r\d{7}/i,
					        'cylindrical': /fov180/i,
							'slicer' : 'imageslice.php?src={src}&{size}',
					        'idle': 0.1,
							'opened' : function (referer) { photomap.indicate(referer); return true; },
							'located' : function () { returnTo = 'guide'; document.body.className = document.body.className.replace(/screen-photos|screen-guide/, 'screen-map'); },
							'closed' : function () { photomap.unindicate(); }
						});

						var photocylinder_wall = new useful.Photocylinder().init({
							'elements' : document.querySelectorAll('.photowall .cylinder-image'),
							'container' : document.querySelector('.photowall'),
							'spherical': /fov360|\d{3}_r\d{7}/i,
					        'cylindrical': /fov180/i,
							'slicer' : 'imageslice.php?src={src}&{size}',
					        'idle': 0.1,
							'opened' : function (referer) { photomap.indicate(referer); return true; },
							'located' : function () { returnTo = 'photos'; document.body.className = document.body.className.replace(/screen-photos|screen-guide/, 'screen-map'); },
							'closed' : function () { photomap.unindicate(); }
						});

						/*
							photo map configuration
						*/

						var guideSettings = {
							"location" : "Awabakal",
							"description" : [""],
						};

						var photomapSettings = <?php print json_encode($json) ?>;

						//photomapSettings.onlineTiles = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
						//photomapSettings.onlineTiles = 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png';
						//photomapSettings.onlineTiles = 'http://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png';
						photomapSettings.tiles = 'http://4umaps.eu/{z}/{x}/{y}.png';
						photomapSettings.local = './inc/tiles/{z}/{x}/{y}.jpg';
						photomapSettings.exif = 'imageexif.php?src={src}';
						photomapSettings.exifData = ExifData['<?php echo $assets?>'];
						photomapSettings.gpx = '<?php echo $inc . "gpx/" . $id?>.gpx';
						photomapSettings.gpxData = GpxData['<?php echo $id?>'];
						photomapSettings.pointer = './inc/img/marker-location.png';
						photomapSettings.missing = './inc/img/missing.png';
						photomapSettings.minZoom = 10;
						photomapSettings.maxZoom = 15;
						photomapSettings.credit = 'Maps &copy; <a href="http://www.4umaps.eu/mountain-bike-hiking-bicycle-outdoor-topographic-map.htm">4UMaps</a>, Data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> and contributors, CC BY-SA';
						photomapSettings.indicator = { 'icon' : './inc/img/marker-photo.png', 'description' : 'Photo taken at this location.' };
						photomapSettings.element = document.querySelector('.photomap-leaflet');
						photomapSettings.indicator.clicked = function () { document.body.className = document.body.className.replace('screen-map', 'screen-photos'); };

						var photomap = new useful.Photomap().init(photomapSettings);

					//-->
					</script>
				</aside>
				<footer class="toolbar">
					<nav>
						<a id="footer-to-menu" href="index.php">Menu</a>
						<a id="footer-to-overview" href="overview.php">Overview</a>
						<a id="footer-to-map" onclick="document.body.className='screen-map'" href="#">Map</a>
						<a id="footer-to-guide" onclick="document.body.className='screen-guide'" href="#">Guide</a>
						<a id="footer-to-photos" onclick="document.body.className='screen-photos'" href="#">Photos</a>
					</nav>
				</footer>
			</section>
		</div>
	</body>
</html>
