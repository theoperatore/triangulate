///////////////////////////////////////////////////////////////////////////////
//
// Sets up firebase event listeners via the instance passed from the
// main file: interface.js
//
///////////////////////////////////////////////////////////////////////////////
var utils = require('./utilities'),
    app, db, map, opts;


/****************************************************************************
*
*  Function to sort marks counter-clockwise for triangulating. Computes the
*  slope between app.marks[0] and the two points to compare. 
*
*  If the slope between the first point and app.marks[0] is positive and the
*  slope of the second point and app.marks[0] is negative, the first point
*  comes first, and vice verse for the second point.
*
*  If the slopes between both points and the origin are equal, then the point
*  that is closest to app.marks[0] will come first.
*
*  If the slopes are either both positive or both negative, the point with
*  the smallest slope comes first, as that point is more counter-clockwise
*  than the larger slope.
*
****************************************************************************/
function sorting(m1, m2) {
  var p1, p2, origin, s1, s2;

  // if either of the points is the origin mark, don't sort
  if (m1 === app.marks[0]) return -1;
  if (m2 === app.marks[0]) return  1;

  // get Google Maps Point from LatLng objects
  origin = map.getProjection().fromLatLngToPoint(
    new google.maps.LatLng(app.marks[0].lat, app.marks[0].lng)
  );
  p1 = map.getProjection().fromLatLngToPoint(new google.maps.LatLng(m1.lat, m1.lng));
  p2 = map.getProjection().fromLatLngToPoint(new google.maps.LatLng(m2.lat, m2.lng));

  // find the slopes
  s1 = (p1.y - origin.y) / (p1.x - origin.x);
  s2 = (p2.y - origin.y) / (p2.x - origin.x);

  // the closest point gets priority if the points are on the same line
  if (s1 === s2) {
    var d1, d2;

    d1 = Math.sqrt(Math.pow(p1.x - origin.x) + Math.pow(p1.y - origin.y));
    d2 = Math.sqrt(Math.pow(p2.x - origin.x) + Math.pow(p2.y - origin.y));

    return ((d1 < d2) ? -1 : 1);
  }

  // if either slope is positive, it gets priority
  if (s1  > 0 && s2 >= 0) return -1;
  if (s1 <= 0 && s2  > 0) return  1;

  // both slopes have the same sign, the smaller one gets priority.
  return ((s1 > s2) ? 1 : -1);
}


/****************************************************************************
*
*  Function to triangulate based on saved marks.
*
****************************************************************************/
function triangulate() {
  var center, radius,
      triInfo = new google.maps.InfoWindow();

  console.log('triangulating...');

  // find intersects
  console.log("sorting", app.marks);
  app.marks.sort(sorting);
  console.log("finished sorting", app.marks);

  app.intersects.length = 0;
  for (var i = 0, pos1, pos2, headings1, headings2, c, n; i < app.marks.length; i++) {
    c = app.marks[i];
    n = app.marks[((i + 1) % app.marks.length)];

    pos1 = new google.maps.LatLng(c.lat, c.lng);
    pos2 = new google.maps.LatLng(n.lat, n.lng);
    headings1 = utils.computeHeadings(pos1, c.az, opts.azDist);
    headings2 = utils.computeHeadings(pos2, n.az, opts.azDist);

    app.intersects.push(utils.intersects(
      map,
      headings1[0], headings1[1],
      headings2[0], headings2[1] 
    ));
  }

  // find center of computed intersects
  center = utils.computeCenter(map, app.intersects);

  // find radius of largest circle inside intersect points
  radius = utils.computeRadius(app.intersects);

  // if this is the first time triangulating, create new objects
  if (!app.apiPolygon) {

    // intersects bounding area
    app.apiPolygon = new google.maps.Polygon({
      paths: app.intersects,
      strokeColor: "#ff0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#70d2ff",
      fillOpacity: 0.6,
      map : map
    });

    // largest inscribed circle in boundig area
    app.apiCircle = new google.maps.Circle({
      center : center,
      radius : radius,
      strokeColor: "#3600b3",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#6929FF",
      fillOpactiy: 0.6,
      map : map,
      draggable : true
    });

    // center of circle mark
    app.apiCMark = new google.maps.Marker({
      position : center,
      map : map
    });
  }

  // else, set existing objects with new data
  else {
    app.apiPolygon.setPaths(app.intersects);
    app.apiCircle.setRadius(radius);
    app.apiCircle.setCenter(center);
    app.apiCMark.setPosition(center);
  }

  // allow dragging of the circle for visual measuring
  google.maps.event.clearListeners(app.apiCircle, "drag");
  google.maps.event.addListener(app.apiCircle, "drag", function(ev) {
    app.apiCircle.setCenter(ev.latLng);
    app.apiCMark.setPosition(ev.latLng);
    triInfo.close();
    triInfo.setContent(utils.convertToDMS(ev.latLng) + "</br>" + (2*radius) + " meters");
  });

  // set up infowindow
  triInfo.setContent(utils.convertToDMS(center) + "</br>" + (2*radius) + " meters");

  // add click event to CMark to show diameter and coords?
  google.maps.event.clearListeners(app.apiCMark, "click");
  google.maps.event.addListener(app.apiCMark, "click", function() {
    triInfo.open(map, app.apiCMark);
  });
  
  // save important triangulated data to the database
  db.child(app.sessionID).update({
    "triDiameter" : 2*radius,
    "triCenter" : {
      lat : center.lat(),
      lng : center.lng()
    }
  });
}


/****************************************************************************
*
*  Firebase event function on user saving new mark location. Adds a new 
*  Marker, InfoWindow, and Polyline to the map.
*
*  If there are 3 or more marks saved, triangulate the hawk and save result.
*
****************************************************************************/
function update(markSnap) {
  var m = markSnap.val(),
      btnDel = document.createElement('button'),
      mark = new google.maps.Marker(),
      info = new google.maps.InfoWindow(),
      added = false,
      line,
      pos,
      headings;

  console.log("adding new mark from database:", m, app.marks);

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

  // if app.marks doesn't have this mark, add it
  console.log("checking for duplicates...");
  for (var i = 0, c; i < app.marks.length; i++) {
    c = app.marks[i];
    if (c.date == m.date) {
      added = true;
    }
  }
  console.log("duplicates found?", added);
  if (!added) app.marks.push(m);

  // set up infoWindow
  btnDel.classList.add("sBtn", "iBtn" , "bad")
  btnDel.innerHTML = "Delete";
  info.setContent(btnDel);

  // set up event listener for infoWindow display on marker click
  google.maps.event.addListener(mark, "click", function() {
    info.open(map, mark);
  });

  // if app.marks.length >=3 call triangulate function
  if (app.marks.length >= 3 && app.apiMarks.length >= 3) {
    triangulate();
  }

  /**************************************************************************
  *
  *  Function to handle deleting the newly created mark and polyline. This
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
          if (app.apiPolygon) app.apiPolygon.setMap(null);
          if (app.apiCircle) app.apiCircle.setMap(null);
          if (app.apiCMark) app.apiCMark.setMap(null);
          delete app.triCenter;
          delete app.triDiameter;
          delete app.apiPolygon;
          delete app.apiCircle;
          delete app.apiCMark;

        }

        // otherwise, re-calculate based on existing marks
        else {
          console.log("re-triangulating...");
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
}

/****************************************************************************
*
*  Function to set the hawkID when it changes from the database
*
****************************************************************************/
function updateHawkID(snap) {
  if (snap.val()) {
    app.hawkID = snap.val();
    document.getElementById('hawkID').innerHTML = app.hawkID;
  }
}

/****************************************************************************
*
*  Collaboration function to be called when a collaborator deletes a mark.
*
*  This will delete the mark remotely. Delete closure function will delete
*  the mark locally.
*
****************************************************************************/
function collabDelete(snap) {
  console.log("running collab delete");
  var m = snap.val();

  // find mark to delete in the list of saved marks
  for (var i = 0, curr; i < app.marks.length; i++) {
    curr = app.marks[i];

    if (curr.lat === m.lat && curr.lng === m.lng && curr.az === m.az) {
      app.marks.splice(i,1);

      // if we go bellow 2 marks, remove triangulated data
      if (app.marks.length <= 2) {

        // remove circle, intersects, center mark
        app.intersects.length = 0;
        if (app.apiPolygon) app.apiPolygon.setMap(null);
        if (app.apiCircle) app.apiCircle.setMap(null);
        if (app.apiCMark) app.apiCMark.setMap(null);
        delete app.triCenter;
        delete app.triDiameter;
        delete app.apiPolygon;
        delete app.apiCircle;
        delete app.apiCMark;

      }

      // otherwise, re-calculate based on existing marks
      else {
        console.log("re-triangulating...");
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
      var mark, line, info;

      console.log("found mark to delete", app.apiMarks[i]);

      mark = app.apiMarks[i];
      line = app.apiLines[i];
      info = app.apiInfos[i];

      app.apiMarks.splice(i,1);
      app.apiLines.splice(i,1);
      app.apiInfos.splice(i,1);

      mark.setMap(null);
      line.setMap(null);
      mark = null;
      line = null;
      info = null;
      break;
    }
  }
}

/****************************************************************************
*
*  Clears, then sets the "child_added" read function again. Primarily used
*  after the main menu button "Track New Hawk" is clicked.
*
****************************************************************************/
exports.setRead = function(old, a) {
  app = a;
  db.child(old).child('marks').off("child_added", update);
  db.child(old).child("marks").off("child_removed", collabDelete);
  db.child(app.sessionID).child('marks').on("child_added", update);
};

/****************************************************************************
*
*  Clears, then sets the "child_added" read function again. Primarily used
*  for collaboration mode
*
****************************************************************************/
exports.setCollaboration = function(old, a) {
  app = a;

  db.child(app.sessionID).child("hawkID").once("value", updateHawkID);
  db.child(old).child('marks').off("child_added", update);
  db.child(old).child("marks").off("child_removed", collabDelete);
  db.child(app.sessionID).child("marks").on("child_added", update);
  db.child(app.sessionID).child("marks").on("child_removed", collabDelete);

}

/****************************************************************************
*
*  Initializes the database listeners
*
****************************************************************************/
exports.init = function(a, d, m, o) {
  app = a;
  db = d;
  map = m;
  opts = o;

  /****************************************************************************
  *
  *  Firebase event on user saving new mark location. Adds a new Marker, 
  *  InfoWindow, and Polyline to the map.
  *
  *  If there are 3 or more marks saved, triangulate the hawk and save result.
  *  
  *  Also reads the hawkID from the database once too.
  ****************************************************************************/
  db.child(app.sessionID).child("marks").on('child_added', update);
  db.child(app.sessionID).child("hawkID").once("value", updateHawkID);
}