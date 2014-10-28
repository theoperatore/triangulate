///////////////////////////////////////////////////////////////////////////////
//
// Sets up firebase event listeners even though this class doesn't
// instantiate it's own firebase object--one is passed from the main file:
// interface.js
//
///////////////////////////////////////////////////////////////////////////////
var utils = require('./utilities');


module.exports = function(app, db, map, opts) {

  /****************************************************************************
  *
  *  Function to triangulate based on saved marks.
  *
  ****************************************************************************/
  function triangulate() {
    console.log('triangulating...');
    
    // find intersects--sort marks?

    // find center of computed intersects

    // find radius of largest circle inside intersect points

    // if this is the first time triangulating, create new objects

    // else, set existing objects with new data

    // save important triangulated data to the database
  }

  /****************************************************************************
  *
  *  Firebase event on user saving new mark location. Adds a new Marker, 
  *  InfoWindow, and Polyline to the map.
  *
  *  If there are 3 or more marks saved, triangulate the hawk and save result.
  *
  ****************************************************************************/
  db.child(app.sessionID).child("marks").on('child_added', function(markSnap) {
    var m = markSnap.val(),
        btnDel = document.createElement('button'),
        mark = new google.maps.Marker(),
        info = new google.maps.InfoWindow(),
        line,
        pos,
        headings;

    console.log("adding mark from database:", m);

    // compute az headings from m.lat, m.lng, m.az, and opts.azDist
    pos = new google.maps.LatLng(m.lat, m.lng);
    headings = utils.computeHeadings(pos, m.az, opts.azDist);

    // use headings to display polyline
    line = new google.maps.Polyline({
      path : headings,
      strokeColor: "#00aeff",
      strokeOpacity: 0.8,
      strokeWeight: 4,
      map : map
    });

    // display new marker
    mark.setPosition(pos);
    mark.setMap(map);

    // save for 'new hawk' button
    app.apiMarks.push(mark);
    app.apiLines.push(line);
    app.apiInfos.push(info);

    // set up infoWindow
    btnDel.classList.add("sBtn", "iBtn" , "bad")
    btnDel.innerHTML = "Delete";
    info.setContent(btnDel);

    // set up event listener for infoWindow display on marker click
    google.maps.event.addListener(mark, "click", function() {
      info.open(map, mark);
    });

    /**************************************************************************
    *
    *  Funciton to handle deleting the newly created mark and polyline. This
    *  function also deletes and triangulation data if the number of marks
    *  after being deleted is less than 3. Saves marks to database.
    *
    **************************************************************************/
    function deleteMark() {

      // find mark to delete in the list of saved marks
      for (var i = 0, curr; i < app.marks.length; i++) {
        curr = app.marks[i];

        if (curr.lat === m.lat && curr.lng === m.lng && curr.az === m.az) {
          app.marks.splice(i,1);
          line.setMap(null);
          mark.setMap(null);
          mark = null;
          line = null;

          // if we go bellow 2 marks, remove triangulated data
          if (app.marks.length <= 2) {

            // remove circle, intersects, center mark
            app.intersects.length = 0;
            app.apiPolygon.setMap(null);
            app.apiCircle.setMap(null);
            app.apiCMark.setMap(null);
            delete app.triCenter;
            delete app.triDiameter;
            delete app.apiPolygon;
            delete app.apiCircle;
            delete app.apiCMark;

          }

          // otherwise, re-calculate based on existing marks
          else {
            triangulate();
          }

          // save new state
          db.child(app.sessionID).set(
            { 
              "marks" : app.marks,
              "hawkID": app.hawkID,
              "triCenter" : (app.triCenter || {}),
              "triDiameter" : (app.triDiameter || 0)
            }
          );

          break;
        }
      }

      // find mark to delete in list of apiMarkers
      for (var i = 0, curr; i < app.apiMarks.length; i++) {
        curr = app.apiMarks[i];

        if (curr.getPosition().lat() === m.lat && curr.getPosition().lng() === m.lng) {
          app.apiMarks.splice(i,1);
          app.apiLines.splice(i,1);
          app.apiInfos.splice(i,1);
          break;
        }
      }
    }
    btnDel.addEventListener('click', deleteMark, false);

    // if app.marks.length >=3 call triangulate function
    if (app.marks.length >= 3) {
      triangulate();
    }

  });

  /****************************************************************************
  *
  *  Firebase event to read initial state of the database once to look for
  *  saved data for the current sessionID. 
  *  
  *  If there isn't any saved data, the user must be starting a new session,
  *  so the sessionID is saved to localStorage. 
  *
  ****************************************************************************/
  db.once('value', function(snap) {

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
            console.log("found match, using:", curr);

            // merge app and snap.val()
            if (curr.marks)  app.marks = app.marks.concat(curr.marks);
            if (curr.hawkID) app.hawkID = curr.hawkID;
            if (curr.triCenter) app.triCenter = curr.triCenter;
            if (curr.triDiameter) app.triDiameter = curr.triDiameter;

            document.getElementById('hawkID').innerHTML = app.hawkID;

            // save app obj
            db.child(app.sessionID).update(
              { 
                "marks" : app.marks,
                "hawkID": app.hawkID,
                "triCenter" : (app.triCenter || {}),
                "triDiameter" : (app.triDiameter || 0)
              }
            );

            break;
          }
        }
      }

      // if we don't have a saved session, create a new session
      else {
        console.log('saving new sessionID', app.sessionID);
        localStorage.setItem("tri-hawk-ulate__sessionID", app.sessionID);
      }
    },

    // error with data read from firebase
    function(err) {
      alert("Blabba-doo! Error reading initial state! Hit the 'Track New Hawk' button on the bottom right to start tracking a new hawky and hopefully fix this error...");
      console.error("Error reading initial state",err.code);
    }
  );

}