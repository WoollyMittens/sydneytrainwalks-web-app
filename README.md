## Sydney Train Walks

Version 1.9.2

Thank you for supporting Sydney Train Walks. You make it possible for me to expand this guide and motivate people to enjoy Sydney's varied landscapes.

Please add your [suggestions and bug reports on GitHub](https://github.com/WoollyMittens/sydneytrainwalks-web-app/issues), or send them to [info@sydneytrainwalks.com](mailto:info@sydneytrainwalks.com).

## Instructions

This project uses node.js from http://nodejs.org/

This project uses grunt.js from http://gruntjs.com/

This project uses Cordova from https://cordova.apache.org/

The following commands are available for development:
+ `npm install` - Install the prerequisites.
+ `node importjpg` - Convert images from "/src/large" into "/inc/small" and "/inc/medium/".
+ `node importexif` - Prepare a cache of lat and lon data of all the photos.
+ `node importgpx` - Prepare a cache of GPX data of all routes.
+ `node importtiles` - Coverts the PNG tile store to JPG.
+ `node importguides` - Prepare a cache of JSON data for all the guides.
+ `grunt dev` - Build the project for development purposes.
+ `grunt prod` - Build the project for deployment purposes.
+ `grunt php` - Preview the project on http://localhost:8080.
+ `grunt watch` - Continuously recompile updated files during development sessions.

To get a collection of offline map tiles create an "osmdroid zip" archive using http://mobac.sourceforge.net/.

## Credits

App, photography and GPS logs &copy; Maurice van Creij, [CC BY-SA](http://creativecommons.org/licenses/by-sa/2.0/).

Maps &copy; [4UMaps](http://www.4umaps.eu/). Data &copy; [OpenStreetMap and contributors](http://www.openstreetmap.org/copyright), [CC BY-SA<](http://creativecommons.org/licenses/by-sa/2.0/).

## Disclaimer

Please do not rely solely on this app for your navigation. There is no warranty on the accuracy or reliability of this app. Always carry a real paper map, which are readily available from park offices and tourist information centres.
