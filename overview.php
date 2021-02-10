<!DOCTYPE html>
<html class="ios-false">
	<?php

		// constants
		include 'constants.php';

		// summary
		$subtitle = "An overview of the documented walks";
		$description = "Don't let organising a bushwalk intimidate you. These 40+ hikes are easy day trips from Sydney using public transport.";

	?>
	<head>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta http-equiv="imagetoolbar" content="no"/>
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<title><?php print $title ?> - Overview</title>
		<meta name="viewport" content="initial-scale=1, minimum-scale=1, maximum-scale=1, width=device-width, user-scalable=yes"/>
		<meta property="og:url" content="https://<?php print $domain ?>/overview.php" />
		<meta property="og:image" content="https://<?php print $domain ?>/inc/img/favicon.png" />
		<meta property="og:title" content="<?php print $title ?> - <?php print $subtitle ?>" />
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
	<body class="screen-overview">
		<div class="ios-margins">
			<section id="appView">
				<header class="title">
					<h1><a href="./"><?php print $title ?><i> - <?php print $subtitle ?></i></a></h1>
				</header>
				<figure class="overview localmap"></figure>
				<footer class="toolbar">
					<nav>
						<a id="footer-to-menu" href="index.php">Menu</a>
						<a id="footer-to-overview" href="overview.php">Overview</a>
						<a id="footer-to-about" href="about.php">About</a>
					</nav>
				</footer>
			</section>
		</div>
		<script src="./inc/js/gpx-data.js"></script>
		<script src="./inc/js/guide-data.js"></script>
		<script src="./inc/js/scripts.js"></script>
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
			if('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
		</script>
	</body>
</html>
