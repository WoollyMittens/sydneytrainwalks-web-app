<!DOCTYPE html>
<html class="ios-false">
	<?php

		// constants
		include 'constants.php';

		// variable
		$id = (@$_REQUEST['id']) ? @$_REQUEST['id'] : 'cowan-taffyslookout-brooklyn';
		$screen = (@$_REQUEST['screen']) ? @$_REQUEST['screen'] : 'map';
		$jsonText = file_get_contents('./inc/json/guides.json');
		$json = json_decode($jsonText)->$id;

		// extract the important markers
		$markers =  $json->{'markers'};
		$firstMarker = $markers[0];
		$lastMarker = array_values(array_slice($markers, -1))[0];

		// determine the path of the assets
		$assets = $id;
		if (property_exists($json, 'alias')) { $assets = $json->{'alias'}->{'key'}; }

		// summary
		$subtitle = "A hiking trip from " . $firstMarker->{'location'} . " to " . $lastMarker->{'location'} . " via " . $json->{'location'};
		$description = join(' ', $json->{'description'});
		$description = strip_tags($description);
		$displayDate = date("d M Y", strtotime($json->{'updated'}));

	?>
	<head>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta http-equiv="imagetoolbar" content="no"/>
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<title><?php echo $subtitle?> - <?php print $title ?></title>
		<meta name="viewport" content="initial-scale=1, minimum-scale=1, maximum-scale=1, width=device-width, user-scalable=yes"/>
		<meta property="og:url" content="https://<?php print $domain ?>/details.php?id=<?php echo $id ?>" />
		<meta property="og:image" content="https://<?php print $domain ?>/inc/social/<?php echo $id ?>.png" />
		<meta property="og:title" content="<?php echo $subtitle ?> - <?php print $title ?>" />
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
		<link rel="stylesheet" href="./inc/css/styles.css?t=20200122"/>
		<script async src="https://www.googletagmanager.com/gtag/js?id=<?php print $analytics ?>"></script>
		<script>
		  window.dataLayer = window.dataLayer || [];
		  function gtag(){dataLayer.push(arguments);}
		  gtag('js', new Date());
		  gtag('config', '<?php print $analytics ?>');
		</script>
	</head>
	<body class="screen-<?php print $screen ?>">
		<div class="ios-margins">
			<section id="appView">
				<header class="title">
					<a href="./"><?php print $title ?></a>
				</header>
				<header class="subtitle">
					<h1 onclick="document.location.replace('./')">
						<span class="sign from">A hiking trip from</span>
						<span class="sign start <?php print $firstMarker->{'type'}?>"><?php print $firstMarker->{'location'}?></span>
						<span class="sign to">to</span>
						<span class="sign finish <?php print $lastMarker->{'type'}?>"><?php print $lastMarker->{'location'}?></span>
						<span class="sign via">via</span>
						<span class="sign park"><?php print $json->{'location'}?> <em><?php print $json->{'duration'}?>h / <?php print $json->{'distance'}?>km</em></span>
					</h1>
				</header>
				<article class="guide guide-closed">
					<div class="guide-scroller">
						<h2>About this walk</h2>
						<time datetime="<?php print $json->{'updated'}?>">Updated: <?php print $displayDate?></time>
						<p>
							<?php print join(' ', $json->{'description'}) ?>
						</p>
						<h2>The route to follow</h2>
						<p>
							Download the <a href="./inc/gpx/<?php print $id ?>.gpx">GPS route
							<?php
								if ($firstMarker->{'location'} == $lastMarker->{'location'}) {
									print " at " . $json->{'location'};
									print " near " . $firstMarker->{'location'};
								} else {
									print " from " . $firstMarker->{'location'};
									print " to " . $lastMarker->{'location'};
									print " via " . $json->{'location'};
								}
							?>
							</a> as a GPX file to your navigation software and GPS devices.
							It takes about <?php print $json->{'duration'}?> hours to complete the full <?php print $json->{'distance'}?> kilometre walk,
							but plan extra for plenty of breaks and photography stops.
						</p>
						<h2>Getting there and back</h2>
						<p>
							<?php print $firstMarker->{'description'}?>
							<?php print $lastMarker->{'description'}?>
						</p>
						<h2>Along the way</h2>
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
						<h2>What to bring</h2>
						<ul>
							<li>Check the <a href="http://www.nationalparks.nsw.gov.au/alert/state-alerts">national parks website</a> for possible detours, closures and restrictions.</li>
							<li>Install an OpenStreetMap app for <a href="http://wiki.openstreetmap.org/wiki/Android">Android</a> or <a href="http://wiki.openstreetmap.org/wiki/Apple_iOS">iOS</a> and preload the area.</li>
							<li>Download the <a href="./inc/gpx/<?php print $id ?>.gpx">GPS data</a> if your device can import it.</li>
							<li>Print out this map and get a better one from a visitor information centre if possible.</li>
							<li>Be sure to leave enough charge in your phone's battery for emergency calls.</li>
							<li>Bring plenty of water, comfortable shoes, a hat and SPF 50 sunscreen.</li>
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
								$small = glob("./inc/small/" . $assets . "/*.jpg");
								$medium = glob("./inc/medium/" . $assets . "/*.jpg");
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
							'key': '<?php echo $id?>',
							'container': document.querySelector('.directions.localmap'),
							'legend': null,
							// assets
							'thumbsUrl': './inc/small/{key}/',
							'photosUrl': './inc/medium/{key}/',
							'markersUrl': './inc/img/marker-{type}.svg',
							'exifUrl': 'imageexif.php?src={src}',
							'guideUrl': './inc/guides/{key}.json',
							'routeUrl': './inc/gpx/{key}.gpx',
							'mapUrl': './inc/maps/{key}.jpg',
				      'tilesUrl': './inc/tiles/{z}/{x}/{y}.jpg',
				      'tilesZoom': 15,
							// cache
							'guideData': {"<?php echo $id?>": <?php print json_encode($json) ?>},
							'routeData': null,
							'exifData': ExifData,
							// attribution
							'creditsTemplate': 'Maps &copy; <a href="http://www.4umaps.com/mountain-bike-hiking-bicycle-outdoor-topographic-map.htm" target="_blank">4UMaps</a>, Data &copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> and contributors, CC BY-SA',
							// events
							'checkHotspot': function() { return false; }
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
