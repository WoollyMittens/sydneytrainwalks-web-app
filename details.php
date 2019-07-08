<!DOCTYPE html>
<html class="ios-false">
	<?php

		// variables
		$id = (@$_REQUEST['id']) ? @$_REQUEST['id'] : 'cowan-taffyslookout-brooklyn';
		$screen = (@$_REQUEST['screen']) ? @$_REQUEST['screen'] : 'map';
		$inc = './inc/';

		$jsonText = file_get_contents($inc . 'json/guides.json');
		$json = json_decode($jsonText)->$id;

		// extract the important markers
		$markers =  $json->{'markers'};
		$firstMarker = $markers[0];
		$lastMarker = array_values(array_slice($markers, -1))[0];

		// formal title
		$title = "From " . $firstMarker->{'location'} . " via " . $json->{'location'} . " to " . $lastMarker->{'location'};
		$description = join(' ', $json->{'description'});
		$description = strip_tags($description);

		// determine the path of the assets
		$assets = $id;
		if (property_exists($json, 'alias')) { $assets = $json->{'alias'}->{'prefix'}; }

	?>
	<head>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta http-equiv="imagetoolbar" content="no"/>
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<title>Sydney Train Walks - <?php echo $title?></title>
		<meta name="viewport" content="initial-scale=1, minimum-scale=1, maximum-scale=1, width=device-width, user-scalable=yes"/>
		<meta property="og:url" content="https://www.sydneytrainwalks.com/details.php?id=<?php echo $id ?>" />
		<meta property="og:image" content="https://www.sydneytrainwalks.com/inc/social/<?php echo $id ?>.png" />
		<meta property="og:title" content="Sydney Train Walks - <?php echo $title ?>" />
		<meta property="og:description" content="<?php echo $description ?>" />
		<meta name="msapplication-TileColor" content="#558b2f" />
		<meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
		<meta name="theme-color" content="#558b2f" />
		<link rel="mask-icon" href="./inc/ico/safari-pinned-tab.svg" color="#558b2f" />
		<link rel="shortcut icon" href="./inc/ico/favicon.ico" />
		<link rel="apple-touch-icon" sizes="57x57" href="./inc/ico/apple-icon-57x57.png" />
		<link rel="apple-touch-icon" sizes="60x60" href="./inc/ico/apple-icon-60x60.png" />
		<link rel="apple-touch-icon" sizes="72x72" href="./inc/ico/apple-icon-72x72.png" />
		<link rel="apple-touch-icon" sizes="76x76" href="./inc/ico/apple-icon-76x76.png" />
		<link rel="apple-touch-icon" sizes="114x114" href="./inc/ico/apple-icon-114x114.png" />
		<link rel="apple-touch-icon" sizes="120x120" href="./inc/ico/apple-icon-120x120.png" />
		<link rel="apple-touch-icon" sizes="144x144" href="./inc/ico/apple-icon-144x144.png" />
		<link rel="apple-touch-icon" sizes="152x152" href="./inc/ico/apple-icon-152x152.png" />
		<link rel="apple-touch-icon" sizes="180x180" href="./inc/ico/apple-icon-180x180.png" />
		<link rel="icon" type="image/png" sizes="192x192"  href="./inc/ico/android-icon-192x192.png" />
		<link rel="icon" type="image/png" sizes="32x32" href="./inc/ico/favicon-32x32.png" />
		<link rel="icon" type="image/png" sizes="96x96" href="./inc/ico/favicon-96x96.png" />
		<link rel="icon" type="image/png" sizes="16x16" href="./inc/ico/favicon-16x16.png" />
		<link rel="manifest" href="./manifest.json" />
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
	<body class="screen-<?php print $screen ?>">
		<div class="ios-margins">
			<section id="appView">
				<header class="title">
					<h1><a href="./">Sydney Train Walks</a></h1>
				</header>
				<header class="subtitle">
					<h2 onclick="document.location.replace('./')">
						<span class="sign from">From</span>
						<span class="sign <?php print $firstMarker->{'type'}?>"><?php print $firstMarker->{'location'}?></span>
						<span class="sign to">via</span>
						<span class="sign park"><?php print $json->{'location'}?> <i><?php print $json->{'duration'}?>h / <?php print $json->{'distance'}?>km</i></span>
						<span class="sign to">to</span>
						<span class="sign <?php print $lastMarker->{'type'}?>"><?php print $lastMarker->{'location'}?></span>
					</h2>
				</header>
				<article class="guide guide-closed">
					<div class="guide-scroller">
						<h2>About this walk</h2>
						<p><?php print join('</p><p>', $json->{'description'}) ?></p>
						<p>
							It takes about <?php print $json->{'duration'}?> hours to complete the full <?php print $json->{'distance'}?> kilometre walk,
							but plan extra for plenty of breaks and photography stops.
							Consider that there's a lot to see along the way.
						</p>
						<h3>Getting there and back</h3>
						<p>
							<?php print $firstMarker->{'description'}?>
							<?php print $lastMarker->{'description'}?>
						</p>
						<h3>Along the way</h3>
						<?php
							foreach ($json->{'markers'} as $marker) {
								if ($marker->{'photo'}) {

									$highlightClass = '';
									if ($marker->{'optional'}) { $highlightClass = 'optional'; }
									if ($marker->{'detour'}) { $highlightClass = 'detour'; }
									if ($marker->{'attention'}) { $highlightClass = 'attention'; }

									if ($highlightClass != '') {
										?>
											<div class="guide-<?php echo $highlightClass ?>">
												<p class="guide-landmark">
													<a href="./inc/medium/<?php echo $assets ?>/<?php echo strtolower($marker->{'photo'}) ?>" class="cylinder-image" style="background-image:linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8)), url(./inc/small/<?php echo $assets ?>/<?php echo strtolower($marker->{'photo'}) ?>);" data-title="<?php echo $marker->{'description'} ?>">
														<img alt="" src="./inc/small/<?php echo $assets ?>/<?php echo strtolower($marker->{'photo'}) ?>">
													</a>
													<span class="guide-text">
														<?php echo $marker->{'description'} ?>
														<button class="guide-locate" data-url="./inc/medium/<?php echo $assets ?>/<?php echo strtolower($marker->{'photo'}) ?>" data-title="<?php echo $marker->{'description'} ?>">Show location</button>
													</span>
												</p>
											</div>
										<?php
									} else {
										?>
											<p class="guide-landmark">
												<a href="./inc/medium/<?php echo $assets ?>/<?php echo strtolower($marker->{'photo'}) ?>" class="cylinder-image" style="background-image:linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8)), url(./inc/small/<?php echo $assets ?>/<?php echo strtolower($marker->{'photo'}) ?>);" data-title="<?php echo $marker->{'description'} ?>">
													<img alt="" src="./inc/small/<?php echo $assets ?>/<?php echo strtolower($marker->{'photo'}) ?>">
												</a>
												<span class="guide-text">
													<?php echo $marker->{'description'} ?>
													<button class="guide-locate" data-url="./inc/medium/<?php echo $assets ?>/<?php echo strtolower($marker->{'photo'}) ?>" data-title="<?php echo $marker->{'description'} ?>">Show location</button>
												</span>
											</p>
										<?php
									}
								}
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
					<figure class="directions localmap">
						<button class="localmap-return" onclick="document.body.className='screen-' + returnTo;">Back</button>
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
								if (property_exists($json, 'alias')) { $min = $json->{'alias'}->{'start'}; $max = $json->{'alias'}->{'end'} + 1; }

								// write the thumbnails
								for ($a = $min; $a < $max; $a++) {
									?><li><a class="cylinder-image" style="background-image:url('<?php echo $small[$a]?>');" href="<?php echo $medium[$a]?>"><img alt="" src="<?php echo $small[$a]?>"/></a></li><?php
								}

							?>
						</ul>
					</figure>
					<script src="./inc/js/gpx-data.js"></script>
					<script src="./inc/js/exif-data.js"></script>
					<script src="./inc/js/scripts.js"></script>
					<script>

						// map back button
						var returnTo = 'guide';

						// photo wall configuration
						var photowall = new Photowall({
							'element' : document.querySelector('.photowall')
						});

						// photo cylinder configuration
						var photocylinder_guide = new Photocylinder({
							'elements' : document.querySelectorAll('.guide .cylinder-image'),
							'container' : document.querySelector('.guide'),
							'spherical': /fov360|\d{3}_r\d{7}/i,
					    'cylindrical': /fov180/i,
							'slicer' : 'imageslice.php?src={src}&{size}',
					    'idle': 0.1,
							'opened' : function (referer) { localmap.indicate(referer); return true; },
							'located' : function () { returnTo = 'guide'; document.body.className = document.body.className.replace(/screen-photos|screen-guide/, 'screen-map'); },
							'closed' : function () { localmap.unindicate(); }
						});

						var photocylinder_wall = new Photocylinder({
							'elements' : document.querySelectorAll('.photowall .cylinder-image'),
							'container' : document.querySelector('.photowall'),
							'spherical': /fov360|\d{3}_r\d{7}/i,
					    'cylindrical': /fov180/i,
							'slicer' : 'imageslice.php?src={src}&{size}',
					    'idle': 0.1,
							'opened' : function (referer) { localmap.indicate(referer); return true; },
							'located' : function () { returnTo = 'photos'; document.body.className = document.body.className.replace(/screen-photos|screen-guide/, 'screen-map'); },
							'closed' : function () { localmap.unindicate(); }
						});

						// locator buttons
						var buttons = document.querySelectorAll('.guide .guide-locate');
						var locate = function (button, evt) {
							evt.preventDefault();
							localmap.indicate(button);
							document.body.className = document.body.className.replace(/screen-photos|screen-guide/, 'screen-map');
						};
						for (var a = 0, b = buttons.length; a < b; a += 1) {
							buttons[a].addEventListener('click', locate.bind(this, buttons[a]));
						}

						// local map configuration
						var localmap = new Localmap({
							'container': document.querySelector('.directions.localmap'),
							'legend': null,
							'thumbsUrl': './inc/small/<?php echo $assets?>/',
							'photosUrl': './inc/medium/<?php echo $assets?>/',
							'markersUrl': './inc/img/marker-{type}.svg',
							'guideUrl': './inc/guides/<?php echo $id?>.json',
							'routeUrl': '<?php echo $inc . "gpx/" . $id?>.gpx',
							'mapUrl': './inc/maps/<?php echo $assets?>.jpg',
							'exifUrl': 'imageexif.php?src={src}',
							'exifData': ExifData['<?php echo $assets?>'],
							'guideData': <?php print json_encode($json) ?>,
							'creditsTemplate': 'Maps &copy; <a href="http://www.4umaps.eu/mountain-bike-hiking-bicycle-outdoor-topographic-map.htm" target="_blank">4UMaps</a>, Data &copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> and contributors, CC BY-SA'
						});

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
		<script>
			// register the service worker for offline content
			if('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
		</script>
	</body>
</html>
