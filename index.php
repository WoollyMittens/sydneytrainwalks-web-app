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
		<title><?php echo $subtitle?> - <?php print $title ?></title>
		<meta name="viewport" content="initial-scale=1, minimum-scale=1, maximum-scale=1, width=device-width, user-scalable=yes" />
		<meta name="description" content="<?php echo $description ?>"/>
		<meta property="og:url" content="https://<?php print $domain ?>/" />
		<meta property="og:image" content="https://<?php print $domain ?>/inc/img/favicon.png" />
		<meta property="og:title" content="<?php echo $subtitle?> - <?php print $title ?>" />
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
		<link rel="canonical" href="https://<?php print $domain ?>/">
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
	<body class="screen-menu">
		<div class="web-margins">
			<section id="appView">
				<header class="title">
					<h1><a href="/"><?php print $title ?><i> - <?php print $subtitle ?></i></a></h1>
				</header>
				<nav class="navigation">

					<p class="app-banners">
						<span>Take these guides for easy bushwalks around Sydney using public transport, with you as an app:</span>
						<a href="https://play.google.com/store/apps/details?id=com.sydneytrainwalks.ios"><img alt="Get it on Google Play" src="./inc/img/banner-android.png"/></a>
						<a href="https://itunes.apple.com/us/app/sydney-train-walks/id917041642?ls=1&mt=8"><img alt="Download on the App Store" src="./inc/img/banner-ios.png"/></a>
					</p>

					<article style="background-image: url(inc/social/<?php print $highlighted->{'key'}?>.png)">
						<h2>
							Suggested:
							<small>
								This <?php print $highlighted->{'distance'}?>km walk
								<?php
									if ($firstMarker->{'location'} == $lastMarker->{'location'}) {
										print " near " . $firstMarker->{'location'};
										print " at " . $highlighted->{'location'};
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
						<label class="searching-label">
							<span>Search for:</span>
							<input placeholder="Location" name="searching-input" type="text"/>
						</label>
						<label class="sorting-label">
							<span>Sort by:</span>
							<select name="sorting-select">
								<option value="start" data-source=".start">By start</option>
								<option value="finish" data-source=".finish">By end</option>
								<option value="region" data-source=".park">By region</option>
								<option value="duration" data-source=".park em" data-type="number">By duration</option>
								<option value="distance" data-source=".park em span" data-type="number">By distance</option>
							</select>
						</label>
						<label class="filtering-label">
							<span>Filter by:</span>
							<select name="filtering-select">
								<option value="all" data-source=".transport" data-filter="train|bus|ferry|tram|car">All transport</option>
								<option value="public" data-source=".transport" data-filter="train|bus|ferry|tram">Public transport</option>
								<option value="car" data-source=".transport" data-filter="car">Just by car</option>
								<option value="looped" data-source=".looped" data-filter="loop">Just loops</option>
								<option value="rain" data-source=".rain" data-filter="rain">For rainy days</option>
								<option value="fireban" data-source=".fireban" data-filter="bushfire">Bushfire season</option>
							</select>
						</label>
					</form>
					<menu>

						<?php
							// for each entry
							foreach ($json as $name => $value) {

								if ($value->{'key'} !== '_index') {

									echo '<li data-id="'. $name . '"><a href="details.php?id='. $name . '">';

									$markers = $value->{'markers'};
									$firstMarker = $markers[0];
									$lastMarker = array_values(array_slice($markers, -1))[0];
									?>
										<span class="sign from">A hiking trip from</span>
										<span class="sign start <?php print $firstMarker->{'type'}?>"><?php print $firstMarker->{'location'}?></span>
										<span class="sign to">to</span>
										<span class="sign finish <?php print $lastMarker->{'type'}?>"><?php print $lastMarker->{'location'}?></span>
										<span class="sign via">via</span>
										<span class="sign park"><?php print $value->{'location'}?> <em><?php print $value->{'duration'}?>h / <span><?php print $value->{'distance'}?>km</span></em></span>
										<span class="meta transport"><?php print $firstMarker->{'type'}?></span>
									<?php

									if ($firstMarker->{'location'} == $lastMarker->{'location'}) echo '<span class="meta looped">Forms a loop</span>';
									if (isset($value->{'rain'})) echo '<span class="meta rain">Suitable for rainy days</span>';
									if (isset($value->{'fireban'})) echo '<span class="meta fireban">Suitable during bushfire season</span>';

									echo '</a></li>';

								}
							}

						?>
					</menu>
				</nav>
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
						'remote': '//<?php print $domain ?>/inc'
					},
					'update' : function (id) {
						document.location.href = './details.php?id=' + id;
					}
				});
			});

			// ordering the menu
			var _filters = new Filters({
				'element' : document.getElementById('sorting'),
				'promise' : function (result) {
					if (/filter|search/.test(result)) {
						var items = document.querySelectorAll('.navigation > menu > li');
						for (var a = 0, b = items.length; a < b; a += 1) {
							var id = items[a].getAttribute('data-id');
							var marker = document.getElementById(id);
							if (marker) marker.style.visibility = (items[a].offsetHeight > 0) ? 'visible' : 'hidden';
						}
					}
				}
			});

			// after the page has rendered
			setTimeout(function() {
				// order by length initially
				document.querySelector('.filtering-label select').selectedIndex = 0;
				document.querySelector('.sorting-label select').selectedIndex = 4;
				_filters.sortBy(4);
			}, 0);

			// register the service worker for offline content
			if('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js?t=<?php print $revision ?>');

		</script>
	</body>
</html>
