var GuideData = GuideData || {};
GuideData["adamstown-fernleightrack-belmont"] = {
	"location" : "Fernleigh Track",
	"description" : ["The <a href=\"http://www.railtrails.org.au/trail?view=trail&id=80\" target=\"_system\">Fernleigh track</a> is an old railway line from Newcastle to Lake Macquarie that has been turned into a bike path. The platforms of the stations are still visible along the way and food and drinks conveniently available nearby every stop."],
	"duration" : 4,
	"length" : 16,
	"zoom" : 13,
	"markers" : {
		"start" : {
			"location" : "Adamstown",
			"method" : "train",
			"icon" : "./inc/img/marker-train.png",
			"description" : "Get the train to Adamstown using <a href=\"https://transportnsw.info/trip#/?to=Adamstown\" target=\"_system\">transportnsw.info</a>."
		},
		"end" : {
			"location" : "Belmont",
			"method" : "bus",
			"icon" : "./inc/img/marker-bus.png",
			"description" : "Plan your return trip from Belmont at <a href=\"https://transportnsw.info/trip#/?from=Belmont\" target=\"_system\">transportnsw.info</a>."
		},
		"kioska" : {
			"icon" : "./inc/img/marker-kiosk.png",
			"lat" : -32.978277000000006,
			"lon" : 151.708188,
			"description" : "Whitebridge shops"
		}
	},
	"indicator" : {
		"icon" : "./inc/img/marker-photo.png",
		"description" : "Photo taken at this location."
	},
	"assets" : {
		"prefix" : "adamstown-lakemacquarie-teralba",
		"start" : 0,
		"end" : 55
	}
};
