# TrainWalks

A visual guide to 40+ hiking day trips from Sydney using public transport.

An implementation may be found on http://www.sydneytrainwalks.com/

## Introduction

Don't let organising a bushwalk intimidate you. These 40+ hikes are easy day trips from Sydney using public transport.

All hikes come with a map, route, public transport stops, and photo guide to help you find your way. If your device supports GPS, your location will be updated on the map.

Map data and photos of the walk are stored on the device, so an internet connection is not necessary out in the bush.

"bushwalk,hiking,hikes,maps,guides,public transport,sydney,blue mountains,australia"

## How to install

This project uses node.js from http://nodejs.org/

This project uses grunt.js from http://gruntjs.com/

The following commands are available for development:
+ `npm install` - Install the prerequisites.
+ `node importjpg` - Convert images from "/src/large" into "/inc/small" and "/inc/medium/".
+ `node importexif` - Prepare a cache of lat and lon data of all the photos.
+ `node importgpx` - Prepare a cache of GPX data of all routes.
+ `node importtiles` - Coverts the PNG tile store to JPG.
+ `node importguides` - Prepare a cache of JSON data for all the guides.
+ `grunt dev` - Build the project for development purposes.
+ `grunt prod` - Build the project for deployment purposes.
+ `grunt watch` - Continuously recompile updated files during development sessions.

To get a collection of offline map tiles create an "osmdroid zip" archive using http://mobac.sourceforge.net/.

## How to use

The site should now work from any relative path on an Apache/PHP server like `http://localhost/TrainWalks/`.

The offline.html page eliminates the reliance on PHP and an online tile server.

## License

This work is licensed under a Creative Commons Attribution 3.0 Unported License. The latest version of this and other scripts by the same author can be found at http://www.woollymittens.nl/

App, photography and GPS logs &copy; Maurice van Creij, CC BY-SA (http://creativecommons.org/licenses/by-sa/2.0/).

Maps &copy; 4UMaps (http://www.4umaps.eu/mountain-bike-hiking-bicycle-outdoor-topographic-map.htm), &copy; Thunderforest (http://www.thunderforest.com/).

Data &copy; OpenStreetMap (http://www.openstreetmap.org/copyright) and contributors, CC BY-SA (http://creativecommons.org/licenses/by-sa/2.0/).
