<!DOCTYPE html>
<html class="ios-false">
	<?php

		/* constants
			$title = 'Sydney Hiking Trips';
			$domain = 'www.sydneyhikingtrips.com';

			$title = 'Sydney Train Walks';
			$domain = 'www.sydneytrainwalks.com';
		*/
		$title = 'Sydney Train Walks';
		$domain = 'www.sydneytrainwalks.com';

		// load and process the json file
		$jsonText = file_get_contents('./inc/js/guide-data.js');
		$jsonText = preg_split('/ = /i', $jsonText);
		$jsonText = $jsonText[1];
		$jsonText = preg_split('/;/i', $jsonText);
		$jsonText = $jsonText[0];
		$json = json_decode($jsonText);

		$keys = array_keys(get_object_vars($json));
		$keysIndex = rand(0 , count($keys) - 1);
		$highlighted = $json->{$keys[$keysIndex]};
		if ($highlighted == '_index') $highlighted = 'mtkuringgai-kuringgaichase-berowra';

		$markers =  $highlighted->{'markers'};
		$firstMarker = $markers[0];
		$lastMarker = array_values(array_slice($markers, -1))[0];

		// summary
		$subtitle = "Easy bushwalks around Sydney using the train, bus and ferry.";
		$description = "Don't let organising a bushwalk intimidate you. These 40+ hikes are easy day trips from Sydney using public transport.";

	?>
	<head>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta http-equiv="imagetoolbar" content="no"/>
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<title><?php print $title ?> - <?php echo $subtitle?></title>
		<meta name="viewport" content="initial-scale=1, minimum-scale=1, maximum-scale=1, width=device-width, user-scalable=yes"/>
		<meta property="og:url" content="https://<?php print $domain ?>/" />
		<meta property="og:image" content="https://<?php print $domain ?>/inc/img/favicon.png" />
		<meta property="og:title" content="<?php print $title ?> - <?php echo $subtitle?>" />
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
		<script>
		  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
		  ga('create', 'UA-52552-7', 'sydneytrainwalks.com');
		  ga('send', 'pageview');
		</script>
	</head>
	<body class="screen-menu">
		<div class="ios-margins">
			<section id="appView">
				<header class="title">
					<h1><a href="./"><?php print $title ?><i> - <?php print $subtitle ?></i></a></h1>
				</header>
				<nav class="navigation">

					<p class="app-banners">
						<span>Take these guides for easy bushwalks around Sydney using public transport, with you as an app:</span>
						<a href="https://play.google.com/store/apps/details?id=com.sydneytrainwalks.ios"><img alt="Get it on Google Play" src="./inc/img/banner-android.png"/></a>
						<a href="https://itunes.apple.com/us/app/sydney-train-walks/id917041642?ls=1&mt=8"><img alt="Download on the App Store" src="./inc/img/banner-ios.png"/></a>
					</p>

					<article style="background-image:linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.7)), url(inc/social/<?php print $highlighted->{'key'}?>.png)">
						<h2>
							Suggested:
							<small>
								This <?php print $highlighted->{'distance'}?>km walk
								<?php
									if ($firstMarker->{'location'} == $lastMarker->{'location'}) {
										print " near " . $firstMarker->{'location'};
										print " in " . $highlighted->{'location'};
									} else {
										print " from " . $firstMarker->{'location'};
										print " to " . $lastMarker->{'location'};
										print " via " . $highlighted->{'location'};
									}
								?>
							</small>
						</h2>
						<p><?php print join(' ', $highlighted->{'description'}) ?></p>
						<a href="details.php?id=<?php print $highlighted->{'key'}?>" class="btn">More</a>
					</article>

					<form id="sorting" data-target=".navigation > menu > li">
						<label>
							<span>Search for:</span>
							<input placeholder="Location" name="searching-input" type="text"/>
						</label>
						<label>
							<span>Sort by:</span>
							<select class="sorting-selected" name="sorting-selected">
								<option value="start" data-source=".start">Sort by start</option>
								<option value="finish" data-source=".finish">Sort by end</option>
								<option value="region" data-source=".park">Sort by region</option>
								<option value="duration" data-source=".park i" data-type="number">Sort by duration</option>
								<option value="distance" data-source=".park i span" data-type="number">Sort by distance</option>
							</select>
						</label>
					</form>
					<menu>

						<?php
							// for each entry
							foreach ($json as $name => $value) {

								if ($value->{'key'} !== '_index') {

									echo '<li class="off-stage"><a href="details.php?id='. $name . '">';

									$markers = $value->{'markers'};
									$firstMarker = $markers[0];
									$lastMarker = array_values(array_slice($markers, -1))[0];
									?>
										<span class="sign from">From</span>
										<span class="sign start <?php print $firstMarker->{'type'}?>"><?php print $firstMarker->{'location'}?></span>
										<span class="sign to">to</span>
										<span class="sign finish <?php print $lastMarker->{'type'}?>"><?php print $lastMarker->{'location'}?></span>
										<span class="sign via">via</span>
										<span class="sign park"><?php print $value->{'location'}?> <em><?php print $value->{'duration'}?>h / <span><?php print $value->{'distance'}?>km</span></em></span>
									<?php

									echo '</a></li>';

								}
							}

						?>
					</menu>
				</nav>
				<figure class="overview localmap" id="leafletMap2"></figure>
				<footer class="toolbar">
					<nav>
						<a id="footer-to-menu" href="index.php">Menu</a>
						<a id="footer-to-overview" href="overview.php">Overview</a>
						<a id="footer-to-about" href="about.php">About</a>
					</nav>
				</footer>
			</section>
		</div>
		<script src="./inc/js/guide-data.js"></script>
		<script src="./inc/js/scripts.js"></script>
		<script id="credit-template" type="text/template">
			Maps &copy; <a href="http://www.4umaps.com/">4UMaps</a>. Data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> and contributors, CC BY-SA
		</script>
		<script>

			// after the page loads
			window.addEventListener('load', function () {
				// emulate the app's scope for the overview module
				var sydneyTrainWalks = new SydneyTrainWalks();
				var sydneyTrainWalksOverview = new sydneyTrainWalks.Overview({
					'config' : {
						'local': './inc',
						'remote': '//<?php print $domain ?>/inc',
						'onlineTiles' : '//4umaps.com/{z}/{x}/{y}.png',
						'offlineTiles' : './inc/tiles/{z}/{x}/{y}.jpg',
						'missing' : './inc/img/missing.png'
					},
					'update' : function (id) {
						document.location.href = './details.php?id=' + id;
					}
				});
			});

			// ordering the menu
			var _filters = new Filters({
				'element' : document.getElementById('sorting'),
				'promise' : function () {}
			});

			// after the page has rendered
			setTimeout(function() {
				// order by length initially
				document.querySelector('.sorting-selected').selectedIndex = 4;
				_filters.sortBy(4);
			}, 0);

			// register the service worker for offline content
			if('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');

		</script>
	</body>
</html>
