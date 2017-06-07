<!DOCTYPE html>
<html class="ios-false">
	<head>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta http-equiv="imagetoolbar" content="no"/>
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<title>Sydney Train Walks - About this Website</title>
		<meta name="viewport" content="initial-scale=1, minimum-scale=1, maximum-scale=1, width=device-width, user-scalable=yes"/>
		<meta property="og:url" content="http://www.sydneytrainwalks.com/about.php" />
		<meta property="og:image" content="http://www.sydneytrainwalks.com/inc/img/favicon.png" />
		<meta property="og:title" content="Sydney Train Walks - About this Website" />
		<meta property="og:description" content="Don't let organising a bushwalk intimidate you. These walks are easy day trips from Sydney using public transport." />
		<link rel="apple-touch-icon" href="./inc/img/favicon.png"/>
		<link rel="icon" href="./inc/img/favicon.png"/>
		<!--[if IE]>
			<link rel="shortcut icon" href="./inc/img/favicon.ico">
			<script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
		<![endif]-->
		<meta name="msapplication-TileColor" content="#000066"/>
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
	<body class="screen-overview">
		<section id="appView">
			<header class="title">
				<h1><a href="./">Sydney Train Walks</a></h1>
			</header>
			<figure class="overview" id="leafletMap2"></figure>
			<footer class="toolbar">
				<a id="footer-to-menu" href="index.php">Menu</a>
				<a id="footer-to-overview" href="overview.php">Overview</a>
				<a id="footer-to-about" href="about.php">About</a>
			</footer>
		</section>
		<script src="./inc/js/exif-data.js"></script>
		<script src="./inc/js/guide-data.js"></script>
		<script src="./inc/js/scripts.js"></script>
		<script id="credit-template" type="text/template">
			Maps &copy; <a href="http://www.thunderforest.com/" target="_blank">Thunderforest</a>, Data &copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> and contributors, CC BY-SA
		</script>
		<script>
			window.addEventListener('load', function () {
				// emulate the app's scope for the overview module
				var sydneyTrainWalks = new SydneyTrainWalks();
				var sydneyTrainWalksOverview = new sydneyTrainWalks.Overview({
					'config' : {
						'onlineTiles' : 'http://4umaps.eu/{z}/{x}/{y}.png',
						'offlineTiles' : './inc/tiles/{z}/{x}/{y}.jpg',
						'missing' : './inc/img/missing.png'
					},
					'update' : function (id) {
						document.location.href = './details.php?id=' + id;
					}
				});
				sydneyTrainWalksOverview.init();
			});
		</script>
	</body>
</html>
