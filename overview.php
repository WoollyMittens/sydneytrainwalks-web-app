<!DOCTYPE html>
<html class="ios-false" lang="en">
	<?php

		// constants
		include 'constants.php';

		// load and process the json file
		$jsonText = file_get_contents('./inc/js/guide-data.js');
		$jsonText = preg_split('/ = /i', $jsonText);
		$jsonText = $jsonText[1];
		$jsonText = preg_split('/;/i', $jsonText);
		$jsonText = $jsonText[0];
		$json = json_decode($jsonText);

		// summary
		$subtitle = "An overview of the documented walks";
		$description = "Don't let organising a bushwalk intimidate you. These 40+ hikes are easy day trips from Sydney using public transport.";

	?>
	<head>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta http-equiv="imagetoolbar" content="no"/>
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<title><?php echo $subtitle?> - <?php print $title ?></title>
		<meta name="viewport" content="initial-scale=1, minimum-scale=1, maximum-scale=1, width=device-width, user-scalable=yes" />
		<meta name="description" content="<?php echo $description ?>"/>
		<meta property="og:url" content="https://<?php print $domain ?>/overview.php" />
		<meta property="og:image" content="https://<?php print $domain ?>/inc/img/favicon.png" />
		<meta property="og:title" content="<?php print $title ?> - <?php print $subtitle ?>" />
		<meta property="og:description" content="<?php echo $description ?>" />
		<meta property="og:type" content="website" />
		<meta property="og:locale" content="en_AU" />
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
		<link rel="canonical" href="https://<?php print $domain ?>/overview.php">
		<link rel="manifest" href="./manifest.json" />
		<link rel="stylesheet" href="./inc/css/styles.css?t=<?php print $revision ?>"/>
		<script async src="https://www.googletagmanager.com/gtag/js?id=<?php print $analytics ?>"></script>
		<script>
		  window.dataLayer = window.dataLayer || [];
		  function gtag(){dataLayer.push(arguments);}
		  gtag('js', new Date());
		  gtag('config', '<?php print $analytics ?>');
		</script>
	</head>
	<body class="screen-overview">
		<div class="web-margins">
			<section id="appView">
				<header class="title">
					<h1><a href="/"><?php print $title ?><i> - <?php print $subtitle ?></i></a></h1>
				</header>
				<div class="summary">
					<?php
						// for each entry
						foreach ($json as $name => $value) {

							if ($value->{'key'} !== '_index') {

								$markers = $value->{'markers'};
								$firstMarker = $markers[0];
								$lastMarker = array_values(array_slice($markers, -1))[0];

								?>
								<h2>
										A <?php print $value->{'distance'}?>km walk
										<?php
											if ($firstMarker->{'location'} == $lastMarker->{'location'}) {
												print " near " . $firstMarker->{'location'};
												print " at " . $value->{'location'};
											} else {
												print " from " . $firstMarker->{'location'};
												print " to " . $lastMarker->{'location'};
												print " via " . $value->{'location'};
											}
										?>
								</h2>
								<p><?php print join(' ', $value->{'description'}) ?></p>
								<a href="details.php?id=<?php print $value->{'key'}?>" class="btn">More</a>
								<hr/>
								<?php
							}
						}
					?>
				</div>
				<figure class="overview localmap"></figure>
				<footer class="toolbar">
					<nav>
						<a id="footer-to-menu" href="/">Menu</a>
						<a id="footer-to-overview" href="overview.php">Overview</a>
						<a id="footer-to-about" href="about.php">About</a>
					</nav>
				</footer>
			</section>
		</div>
		<script src="./inc/js/gpx-data.js?t=<?php print $revision ?>"></script>
		<script src="./inc/js/guide-data.js?t=<?php print $revision ?>"></script>
		<script src="./inc/js/scripts.js?t=<?php print $revision ?>"></script>
		<script id="credit-template" type="text/template">
			Maps &copy; <a href="https://4umaps.com/" target="_blank">4UMaps.com</a> and &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>.
		</script>
		<script>
			window.addEventListener('load', function () {
				// emulate the app's scope for the overview module
				var sydneyTrainWalks = new SydneyTrainWalks();
				var sydneyTrainWalksOverview = new sydneyTrainWalks.Overview({
					'config' : {
						'local': './inc',
						'remote': '//<?php print $domain ?>/inc'
					},
					'update' : function (id) {
						document.location.href = './details.php?id=' + id;
					}
				});
			});
		</script>
		<script>
			// register the service worker for offline content
			if('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js?t=<?php print $revision ?>');
		</script>
	</body>
</html>
