<?php
/*
	name: 			imageExif
	by: 			Maurice van Creij
	description:	A simple PHP webservice to return the EXIF information of an image.
*/

	class imageExif{

		function getExif($src, $callBack)
		{
			$exif = exif_read_data($src, 0, true);
			if(isset($callBack)) echo $callBack . '(';

			// NOTE: doesn't seem to work anymore
			//echo json_encode($exif);

			echo '{"foo":"bar"';
			foreach ($exif as $key => $section) {
				echo ',"' . $key . '":{"foo":"bar"';
				foreach ($section as $name => $val) {
					if (json_encode($val)) {
						echo ',"' . $name . '":' . json_encode($val);
					}
				}
				echo '}';
			}
			echo '}';

			if(isset($callBack)) echo ');';
		}

	}

	$image = new imageExif;
	$image->getExif(@$_REQUEST['src'], @$_REQUEST['callback']);

	// imageexif.php?src=../img/photo_0a.jpg&callback=alert

?>
