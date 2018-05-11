<!DOCTYPE html>
<html class="ios-false">
	<head>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta http-equiv="imagetoolbar" content="no"/>
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<title>Sydney Train Walks - Easy bushwalks around Sydney using the train, bus and ferry.</title>
		<meta name="viewport" content="initial-scale=1, minimum-scale=1, maximum-scale=1, width=device-width, user-scalable=yes"/>
		<meta property="og:url" content="http://www.sydneytrainwalks.com/" />
		<meta property="og:image" content="http://www.sydneytrainwalks.com/inc/img/favicon.png" />
		<meta property="og:title" content="Sydney Train Walks - Easy bushwalks around Sydney using the train, bus and ferry." />
		<meta property="og:description" content="Don't let organising a bushwalk intimidate you. These 40+ hikes are easy day trips from Sydney using public transport." />
		<link rel="apple-touch-icon" href="./inc/img/favicon.png"/>
		<link rel="icon" href="./inc/img/favicon.png"/>
		<!--[if IE]>
			<link rel="shortcut icon" href="./inc/img/favicon.ico">
			<script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
		<![endif]-->
		<meta name="msapplication-TileColor" content="#0D47A1"/>
		<meta name="msapplication-TileImage" content="./inc/img/favicon.png"/>
		<link rel="stylesheet" href="./inc/css/styles.css"/>
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
		<?php

			// variables
			$inc = './inc/';

		?>
		<section id="appView">
			<header class="title">
				<h1><a href="./">Sydney Train Walks</a></h1>
			</header>
			<nav class="navigation">
				<p>
					<img class="intro" alt="" src="./inc/img/favicon.png"/>
					Easy bushwalks around Sydney using the train, bus and ferry.
				</p>
				<p class="app-banners">
					<span>Take these guides with you as an app:</span>
					<a href="https://play.google.com/store/apps/details?id=com.sydneytrainwalks.ios"><img alt="Get it on Google Play" src="./inc/img/banner-android.png"/></a>
					<a href="https://itunes.apple.com/us/app/sydney-train-walks/id917041642?ls=1&mt=8"><img alt="Download on the App Store" src="./inc/img/banner-ios.png"/></a>
				</p>
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
							<option value="length" data-source=".park i span" data-type="number">Sort by length</option>
						</select>
					</label>
				</form>
				<menu>
					<?php

						// load and process the json file
						$jsonText = file_get_contents($inc . "js/guide-data.js");
						$jsonText = preg_split('/ = /i', $jsonText);
						$jsonText = $jsonText[1];
						$jsonText = preg_split('/;/i', $jsonText);
						$jsonText = $jsonText[0];
						$json = json_decode($jsonText);

						// for each entry
						foreach ($json as $name => $value) {

								echo '<li class="off-stage"><a href="details.php?id='. $name . '">';

								?>
									<span class="sign from">From</span>
									<span class="sign start <?php print $value->{'markers'}->{'start'}->{'method'}?>"><?php print $value->{'markers'}->{'start'}->{'location'}?></span>
									<span class="sign to">via</span>
									<span class="sign park"><?php print $value->{'location'}?> <i><?php print $value->{'duration'}?>h / <span><?php print $value->{'length'}?>km</span></i></span>
									<span class="sign to">to</span>
									<span class="sign finish <?php print $value->{'markers'}->{'end'}->{'method'}?>"><?php print $value->{'markers'}->{'end'}->{'location'}?></span>
								<?php

								echo '</a></li>';
						}

					?>
				</menu>
			</nav>
			<footer class="toolbar">
				<nav>
					<a id="footer-to-menu" href="index.php">Menu</a>
					<a id="footer-to-overview" href="overview.php">Overview</a>
					<a id="footer-to-about" href="about.php">About</a>
				</nav>
			</footer>
		</section>
		<script src="./inc/js/scripts.js"></script>
		<script>

			// ordering the menu
			var _staging;
			var _filters = new useful.Filters().init({
				'element' : document.getElementById('sorting'),
				'promise' : function () { if (_staging && _staging.update) _staging.update(); }
			});

			// after the page has rendered
			setTimeout(function() {

				// order by length initially
				document.querySelector('.sorting-selected').selectedIndex = 4;
				_filters.sortBy(4);

				// start the on/off stage rendering
				_staging = new useful.Staging().init({
					'stage' : document.querySelectorAll('nav')[0],
					'actors' : document.querySelectorAll('.off-stage'),
					'offset' : 32
				});

			}, 0);

		</script>
	</body>
</html>
