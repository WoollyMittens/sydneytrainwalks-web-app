<!DOCTYPE html>
<html class="ios-true">
	<?php

		// constants
		include 'constants.php';

		// summary
		$subtitle = "Easy bushwalks around Sydney using the train, bus and ferry.";
		$description = "Don't let organising a bushwalk intimidate you. These 40+ hikes are easy day trips from Sydney using public transport.";

	?>
	<head>
		<meta charset="UTF-8" />
		<title><?php print $title ?></title>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta http-equiv="imagetoolbar" content="no" />
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<title><?php print $title ?> - Easily accessible bushwalks using public transport</title>
		<meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, viewport-fit=cover">
		<meta property="og:url" content="https://<?php print $domain ?>/offline.html" />
		<meta property="og:image" content="https://<?php print $domain ?>/inc/img/favicon.png" />
		<meta property="og:title" content="<?php print $title ?> - <?php echo $subtitle ?>" />
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

	<body class="screen-menu">

		<!-- markup -->
		<div class="ios-margins">

			<section id="appView" class="status-busy">

				<header class="title">
					<h1><a href="./"><?php print $title ?><i><?php print " - " . $subtitle ?></i></a></h1>
				</header>

				<header class="subtitle">
					<h2></h2>
				</header>

				<nav class="navigation">
					<p class="app-banners">
						<span>Take these guides for easy bushwalks around Sydney using public transport, with you as an app:</span>
						<a href="https://play.google.com/store/apps/details?id=com.sydneytrainwalks.ios"><img alt="Get it on Google Play" src="./inc/img/banner-android.png"/></a>
						<a href="https://itunes.apple.com/us/app/sydney-train-walks/id917041642?ls=1&mt=8"><img alt="Download on the App Store" src="./inc/img/banner-ios.png"/></a>
					</p>
					<form id="sorting">
						<label class="searching-label">
							<span>Search by location:</span>
							<input placeholder="Search..." name="searching-input" type="text"/>
						</label>
						<label class="sorting-label">
							<span>Sort by:</span>
							<select name="sorting-select">
								<option value="start">By start</option>
								<option value="finish">By end</option>
								<option value="region">By region</option>
								<option value="duration">By duration</option>
								<option value="distance" selected>By distance</option>
								<option value="revised">By revision date</option>
							</select>
						</label>
						<label class="filtering-label">
							<span>Filter by:</span>
							<select name="filtering-select">
								<option value="all" selected>All transport</option>
								<option value="public">Public transport</option>
								<option value="car">Just by car</option>
								<option value="looped">Just loops</option>
								<option value="rain">For rainy days</option>
								<option value="fireban">Bushfire season</option>
							</select>
						</label>
					</form>
					<menu></menu>
				</nav>

				<figure class="overview localmap"></figure>

				<article class="guide"></article>

				<aside>
					<figure class="directions localmap">
						<button class="localmap-return">Back</button>
					</figure>
					<figure class="photowall">
						<ul></ul>
					</figure>
				</aside>

				<section class="about">
					<div class="about-scroller">
						<h2>About This App</h2>
						<figure>
							<img src="./inc/img/icon.png" />
							<figcaption><strong><?php print $title ?></strong> Version 2.4.7</figcaption>
						</figure>
						<p>Thank you for supporting <?php print $title ?>. You make it possible for me to expand this guide and motivate people to enjoy Sydney's varied landscapes.</p>
						<p>Please add your <a href="https://github.com/WoollyMittens/sydneytrainwalks-web-app/issues">suggestions and bug reports on GitHub</a>, or send them to <a href="mailto:maurice@woollymittens.nl">maurice@woollymittens.nl</a>.</p>
						<h2>Credits</h2>
						<p>App, photography and GPS logs &copy; Maurice van Creij, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC BY-SA</a>.</p>
						<p>Maps &copy; <a href="http://www.4umaps.com/">4UMaps</a>. Data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> and contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC BY-SA</a>.</p>
						<h2>Disclaimer</h2>
						<p>Please do not rely solely on this app for your navigation. There is no warranty on the accuracy or reliability of this app. Always carry a real paper map, which are readily available from park offices and tourist information centres.</p>
					</div>
				</section>

				<section class="trophies">
					<div class="trophies-scroller">
						<h2>Trophies</h2>
						<p>
							Uncover these trophies by visiting special locations marked
							(<img alt="Example trophy marker" src="./inc/img/marker-hotspot.svg" width="24px" height="24px" valign="middle" />)
							on the map.</p>
						<ul></ul>
					</div>
				</section>

				<article class="trophy"></article>

				<footer class="toolbar"></footer>

			</section>

		</div>

		<!-- templates -->

		<script id="title-template" type="text/template">
			<span class="sign from">A hiking trip from</span>
			<span class="sign start sign-short {startTransport}">{startLocation}</span>
			<span class="sign to">to</span>
			<span class="sign finish sign-short {endTransport}">{endLocation}</span>
			<span class="sign via">via</span>
			<span class="sign park sign-short">{walkLocation} <em>{walkDuration}h / <span>{walkDistance}</span>km</em></span>
		</script>

		<script id="menu-template" type="text/template">
			<li data-id="{id}">
				<a href="?key={id}">{title}</a>
			</li>
		</script>

		<script id="guide-template" type="text/template">
			<div class="guide-scroller">
				<h2>About this walk</h2>
				<time datetime="{updated}">Updated: {date}</time>
				{description}
				<p>
					It takes about {duration} hours to complete the full {distance} kilometre walk,
					but plan extra for plenty of breaks and photography stops.
					Consider that there's a lot to see along the way.
				</p>
				<h3>Getting there and back</h3>
				<p>{there} {back}</p>
				<h3>Along the way</h3> {landmarks}
				<h3>What to bring</h3>
				<ul>
					<li>Check the <a href="http://www.nationalparks.nsw.gov.au/alert/state-alerts">national parks website</a> for possible closures and restriction.</li>
					<li>Install an OpenStreetMap app for <a href="http://wiki.openstreetmap.org/wiki/Android">Android</a> or <a href="http://wiki.openstreetmap.org/wiki/Apple_iOS">iOS</a> and preload the area.</li>
					<li>Download the <a href="{gpx}">GPS data</a> if your device can import it.</li>
					<li>Print out this map and get a better one from a visitor information centre if possible.</li>
					<li>Be sure to leave enough charge in your phone's battery for emergency calls.</li>
					<li>Bring plenty of water, comfortable shoes, a hat and SPF 50 sunscreen.</li>
					<li>Also bring a light windbreaker/raincoat in case you get caught out in the rain.</li>
				</ul>
			</div>
		</script>

		<script id="thumbnail-template" type="text/template">
			<p class="guide-landmark">
				<a class="cylinder-image" href="./inc/medium/{id}/{src}" style="background-image:linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8)), url(./inc/small/{id}/{src});" data-title="{description}">
					<img alt="" src="./inc/small/{id}/{src}"/>
				</a>
				<span class="guide-text">{description} <button class="guide-locate" data-url="./inc/medium/{id}/{src}" data-title="{description}">Show location</button></span>
			</p>
		</script>

		<script id="wall-template" type="text/template">
			<li><a class="cylinder-image" style="background-image:url('./inc/small/{id}/{src}');" href="./inc/medium/{id}/{src}"><img alt="" src="./inc/small/{id}/{src}"/></a></li>
		</script>

		<script id="footer-template" type="text/template">
			<nav>
				<a id="footer-to-menu" href="?screen=menu">Menu</a>
				<a id="footer-to-overview" href="?screen=overview">Overview</a>
				<a id="footer-to-map" href="?id={id}&amp;screen=map">Map</a>
				<a id="footer-to-guide" href="?id={id}&amp;screen=guide">Guide</a>
				<a id="footer-to-photos" href="?id={id}&amp;screen=photos">Photos</a>
				<a id="footer-to-trophies" href="?screen=trophies">Trophies</a>
				<a id="footer-to-about" href="?screen=about">About</a>
			</nav>
		</script>

		<script id="credit-template" type="text/template">
			Maps &copy; <a href="http://www.4umaps.com/">4UMaps</a>. Data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> and contributors, CC BY-SA
		</script>

		<script id="trophies-template" type="text/template">
			<figure>
				<img alt="" src="./inc/img/{icon}.svg" />
				<figcaption>
					{title}
					<button class="guide-locate" data-type="{type}" data-lat="{lat}" data-lon="{lon}" data-title="{title}">Show location</button>
				</figcaption>
			</figure>
		</script>

		<script id="trophy-template" type="text/template">
			<header>
				<h2>Trophy awarded:</h2>
				<img alt="" src="./inc/img/{icon}.svg" />
				<h3>{title}</h3>
			</header>
			<figure style="background-image:url('./inc/{tile}.jpg');">
				<div style="background-image:url('./inc/{background}.jpg');"></div>
				<figcaption>{description}</figcaption>
			</figure>
			<footer>
				<button>Continue</button>
			</footer>
		</script>

		<!-- scripts -->

		<script src="./inc/js/exif-data.js"></script>
		<script src="./inc/js/guide-data.js"></script>
		<script src="./inc/js/gpx-data.js"></script>
		<script src="./inc/js/scripts.js"></script>
		<script>
			var sydneyTrainWalks = new SydneyTrainWalks({
				'local': './inc',
				'remote': 'https://<?php print $domain ?>/inc',
				//'exif': 'imageexif.php?src={src}',
				'exif': 'https://<?php print $domain ?>/imageexif.php?src={src}',
				//'slice': 'imageslice.php?src={src}&{size}',
				'slice' : 'https://<?php print $domain ?>/imageslice.php?src={src}&{size}',
				//'gpx': './inc/gpx/{id}.gpx',
				'gpx': 'https://<?php print $domain ?>/inc/gpx/{id}.gpx'
			});
		</script>
		<script>
			// register the service worker for offline content
			if('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
		</script>

	</body>

</html>
