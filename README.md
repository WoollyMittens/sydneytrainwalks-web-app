## Sydney Hiking Trips

Version 1.9.2

Thank you for supporting Sydney Train Walks. You make it possible for me to expand this guide and motivate people to enjoy Sydney's varied landscapes.

Please add your [suggestions and bug reports on GitHub](https://github.com/WoollyMittens/sydneytrainwalks-web-app/issues), or send them to [maurice@woollymittens.nl](mailto:maurice@woollymittens.nl).

## Instructions

This project uses node.js from http://nodejs.org/

This project uses gulp.js from http://gulpjs.com/

This project uses Cordova from https://cordova.apache.org/

The following commands are available for development:
+ `npm install` - Install the prerequisites.
+ `gulp dev` - Build the project for development purposes.
+ `gulp prod` - Build the project for deployment purposes.
+ `gulp php` - Preview the project on http://localhost:8080.
+ `gulp watch` - Continuously recompile updated files during development sessions.
+ `cd node_scripts`
  + `node importexif` - Prepares a cache of GPS data of all the photos.
  + `node importgpx` - Prepares a cache of GPS data of all routes.
  + `node importguides` - Prepares a cache of JSON data for all the guides.
  + `node importphotos` - Process images from "/src/large" into "/inc/small" and "/inc/medium/".
  + `node importtiles` - Downloads the tiles needed to cover the guides.
  + `node converttiles` - Compresses the local PNG tile store to JPG.

## Credits

App, photography, and GPS logs &copy; Maurice van Creij. Licensed under [The MIT License](https://opensource.org/licenses/MIT).

Maps &copy; [4UMaps.com](https://4umaps.com/) and &copy; [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).

## Disclaimer

Please do not rely solely on this app for your navigation. There is no warranty on the accuracy or reliability of this app. Always carry a real paper map, which are readily available from park offices and tourist information centres.
