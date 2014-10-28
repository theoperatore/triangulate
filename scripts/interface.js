///////////////////////////////////////////////////////////////////////////////
//
// Main module for app. Requires all other modules.
//
///////////////////////////////////////////////////////////////////////////////
var cvs = document.getElementById('map-canvas'),
    Firebase = require('firebase'),
    utils = require('./utilities'),
    db = new Firebase("https://tri-hawk-ulate.firebaseio.com/hawks-beta"),
    app = {},
    map,
    opts = {
      zoom   : 17,
      azDist : 4828.03, // 3 miles in either direction
      unlocked : true
    },
    version = "0.2.00";

// do a little viewport styling for our map/app
cvs.style.width = window.innerWidth + "px";
cvs.style.height = window.innerHeight - 98 + "px";

// initialize map
map = new google.maps.Map(
  cvs, 
  { 
    zoom : opts.zoom,

    // 4Lakes lat lng!
    center : new google.maps.LatLng(43.042825,-89.292592) 
  }
);

// initialize app obj
app.sessionID = parseInt(localStorage.getItem('tri-hawk-ulate__sessionID'),10);
app.hawkID = "";
app.marks = [];
app.curr = new google.maps.Marker();
app.apiMarks = [];
app.apiLines = [];
app.apiInfos = [];
app.intersects = [];
// app.apiPolygon  -- gets created when there are enough marks;
// app.apiCircle   -- gets created when there are enough marks;
// app.apiCMark    -- gets created at the circle's center;
// app.triCenter   -- gets saved to database from apiCircle.getPosition();
// app.triDiameter -- gets saved to database from intersect calculation;

// check for a valid sessionID, if not found create a new one.
if (app.sessionID === void(0) || isNaN(app.sessionID)) {
  app.sessionID = +new Date;
  console.log("new session", app.sessionID);
  document.getElementById('modal-hawkid').classList.remove('hide');
}

// set up other parts of the app
require('./database')(app, db, map, opts);
require('./modal')(app, db, map, opts);
require('./find')(app, map, opts.unlocked);
//require('./save')();
//require('./down')();
//require('./clear')();
