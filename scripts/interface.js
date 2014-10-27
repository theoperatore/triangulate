var cvs = document.getElementById('map-canvas'),
    btnMenu = document.getElementById('settings-toggle'),
    btnFind = document.getElementById('findMe'),
    btnSave = document.getElementById('saveMe'),
    btnDown = document.getElementById('downloadMe'),
    btnClear= document.getElementById('clearMe'),
    opts = {
      zoom   : 17,
      azDist : 4828.03, // 3 miles in either direction
      unlocked : true
    },
    map = new google.maps.Map(
      cvs, 
      { 
        zoom : opts.zoom,
        center : new google.maps.LatLng(43.042825,-89.292592) 
      }
    ),
    app = {},
    Firebase = require('firebase'),
    db = new Firebase("https://tri-hawk-ulate.firebaseio.com/hawks"),
    version = "0.2.00";

// do a little viewport styling for our map/app
cvs.style.width = window.innerWidth + "px";
cvs.style.height = window.innerHeight - 98 + "px";

// set up settings menu
btnMenu.addEventListener('click', function() {
  document.getElementById('settings-menu').classList.toggle('hide');
}, false);

// app obj
app.hawkID = "";
app.sessionID = parseInt(localStorage.getItem('tri-hawk-ulate__sessionID'),10);
app.marks = [];
app.triCenter = {};
app.triDiameter = 0;  

if (app.sessionID === void(0) || isNaN(app.sessionID)) {
  app.sessionID = +new Date;
  console.log("new session", app.sessionID);
  document.getElementById('modal-hawkid').classList.remove('hide');
}

// set up Firebase listeners

// read initial state of db
db.once('value',
  function(snap) {
    
    // first try to get any saved sessions    
    var savedSession = parseInt(localStorage.getItem("tri-hawk-ulate__sessionID"), 10),
        keys;

    // if we have a saved session AND a response from Firebase
    // merge the app obj with snap.val()
    if (savedSession && !isNaN(savedSession) && snap.val()) {
      keys = Object.keys(snap.val());

      for (var i = keys.length-1, curr; i >= 0; i--) {
        if (parseInt(keys[i],10) === savedSession) {
          
          curr = snap.val()[keys[i]];

          // merge app and snap.val()
          app.hawkID = curr.hawkID;
          app.marks = app.marks.concat(curr.marks);

          document.getElementById('hawkID').innerHTML = app.hawkID;
          console.log('found match');

          // save app obj
          db.child(app.sessionID).update(
            { 
              "marks" : app.marks,
              "hawkID": app.hawkID
            }
          );

          break;
        }
      }
    }

    // if we don't have a saved session, create a new session
    else {
      localStorage.setItem("tri-hawk-ulate__sessionID", app.sessionID);
    }

    console.log("db init result:", savedSession, app);
  }, 
  function(err) {
    alert("Oh Snap! Error reading initial state! Hit the 'Track New Hawk' button on the bottom right to start tracking a new hawky and hopefully fix this error...");
    console.error("Error reading initial state",err.code);
  }
);

// hawk ID prompt
function onHawkIdOk() {
  
  // get hawkid input
  id = document.getElementById('modal-hawkid-input').value.trim();

  if (id === (void(0)) || id === "") {
    alert('Please enter a valid hawk ID');
    return false;
  }

  // set tracking name at top
  app.hawkID = id;
  document.getElementById('hawkID').innerHTML = id;

  // close modal
  document.getElementById('modal-hawkid-input').value = "";
  document.getElementById('modal-hawkid').classList.add('hide');
}

// modal hawk id event listener
document.getElementById('modal-hawkid-ok').addEventListener('click', onHawkIdOk, false);

// set up button event listeners
require('./find')(btnFind, map, app, opts.unlocked);
require('./save')(btnSave);
require('./down')(btnDown);
require('./clear')(btnClear);

// set up sessionID and version
document.getElementById('app_version').innerHTML = version;
document.getElementById('session_id').innerHTML = app.sessionID;