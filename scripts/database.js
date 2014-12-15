///////////////////////////////////////////////////////////////////////////////
//
// Sets up firebase event listeners via the instance passed from the
// main file: interface.js
//
///////////////////////////////////////////////////////////////////////////////
var utils = require('./utilities'),
    save  = require('./save'),
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

  // get point locations from LatLng objs
  origin = map.getProjection().fromLatLngToPoint(app.marks[0].m.getPosition());
  p1 = map.getProjection().fromLatLngToPoint(m1.m.getPosition());
  p2 = map.getProjection().fromLatLngToPoint(m2.m.getPosition());

  // find the slopes
  s1 = (p1.y - origin.y) / (p1.x - origin.x);
  s2 = (p2.y - origin.y) / (p2.x - origin.x);

  // the closest point gets priority if the points are on the same line
  if (s1 === s2) {
    var d1, d2;

    d1 = Math.sqrt(Math.pow((p1.x - origin.x), 2) + Math.pow((p1.y - origin.y), 2));
    d2 = Math.sqrt(Math.pow((p2.x - origin.x), 2) + Math.pow((p2.y - origin.y), 2));

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

  // find intersects
  console.log("sorting", app.marks);
  app.marks.sort(sorting);
  console.log("finished sorting", app.marks);

  app.intersects.length = 0;
  for (var i = 0,pos1,pos2,headings1,headings2,c,n,intersect; i < app.marks.length; i++) {
    c = app.marks[i];
    n = app.marks[((i + 1) % app.marks.length)];

    // marker positions
    pos1 = c.m.getPosition();
    pos2 = n.m.getPosition();
    
    // compute headings in both directions; create a line along azimuth
    //headings1 = utils.computeHeadings(pos1, c.az, opts.azDist);
    //headings2 = utils.computeHeadings(pos2, n.az, opts.azDist);

    //app.intersects.push(utils.intersectsByDeterminants(
    //  map,
    //  headings1[0], headings1[1],
    //  headings2[0], headings2[1] 
    //));
    
    // compute only the heading in the direction of the azimuth
    headings1 = utils.computePositiveHeading(pos1, c.az, opts.azDist);
    headings2 = utils.computePositiveHeading(pos2, n.az, opts.azDist);

    intersect = utils.intersectsByLinearAlgebra(
      map,
      pos1, headings1,
      pos2, headings2
    );

    // only add to list if valid intersect
    if (intersect === false) continue;
    app.intersects.push(intersect);
    
  }

  // stop trying to triangulate if there aren't enough intersects to use.
  if (app.intersects.length < 3) return;

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
  save.setState(null);
  db.child(app.sessionID).update({
    "triDiameter" : 2*radius,
    "triCenter" : {
      lat : center.lat(),
      lng : center.lng()
    }
  }, function(err) {
    if (err) {
      save.setState({ error : err });
    }
    else {
      save.setState({ ok : true });
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
function added(markSnap) {
  var m = markSnap.val(),
      btnDel = document.createElement('button'),
      mark = new google.maps.Marker(),
      info = new google.maps.InfoWindow(),
      div = document.createElement('div'),
      line,
      pos,
      headings;

  console.log("adding new mark from database:", m);

  // compute az headings from m.lat, m.lng, m.az, and opts.azDist
  pos = new google.maps.LatLng(m.lat, m.lng);
  //headings = utils.computeHeadings(pos, m.az, opts.azDist);
  headings = utils.computePositiveHeading(pos, m.az, opts.azDist);

  // use headings to display polyline
  line = new google.maps.Polyline({
    path : [pos, headings],
    strokeColor: "#00aeff",
    strokeOpacity: 0.8,
    strokeWeight: 4,
    map : map
  });

  // display new marker
  mark.setPosition(pos);
  mark.setMap(map);

  // store visuals
  app.marks.push({
    m : mark,
    l : line,
    i : info,
    id: markSnap.key(),
    az : m.az,
    sig : m.sig,
    date : m.date
  });
    

  // set up infoWindow
  btnDel.classList.add("sBtn", "iBtn" , "bad")
  btnDel.innerHTML = "Delete";
  
  div.innerHTML = utils.convertToDMS(mark.getPosition());
  div.appendChild(document.createTextNode("Azimuth: " + m.az));
  div.appendChild(btnDel);
  info.setContent(div);

  // set up event listener for infoWindow display on marker click
  google.maps.event.addListener(mark, "click", function() {
    info.open(map, mark);
  });

  // if app.marks.length >=3 call triangulate function
  if (app.marks.length >= 3) {
    triangulate();
  }

  /**************************************************************************
  *
  *  Function to handle deleting the newly created mark. 
  *  No deleting actually happens yet, but rather, the mark gets deleted 
  *  visually and internally in the 'removed' function.
  * 
  *
  **************************************************************************/
  function deleteMark() {
    // remove the mark that was deleted from the database
    save.setState(null);
    db.child(app.sessionID).child("marks").child(markSnap.name()).remove(
      function(err) {
        if (err) {
          save.setState({ error : err });
        }
        else {
          save.setState({ ok : true });
        }
      }
    );
  }

  // add event listener to delete mark
  btnDel.addEventListener('click', deleteMark, false);
}

/****************************************************************************
*
*  Firebase event function to handle the deletion of a marker. 
*
****************************************************************************/
function removed(delMark) {
  var ma = delMark.val();

  for (var i = 0, curr; i < app.marks.length; i++) {
    curr = app.marks[i];

    console.log("deleting", curr);
    // if we find the mark to delete
    if (curr.id === delMark.name()) {

      // remove visual components
      curr.m.setMap(null);
      curr.l.setMap(null);
      curr.i = null;

      // remove from collection
      app.marks.splice(i, 1);

      // re-triangulate if necessary
      if (app.marks.length >= 3) {
        triangulate();
      }

      // if not, delete triangulated parts
      else {

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

      // save new state
      save.setState(null);
      db.child(app.sessionID).update(
        { 
          "triCenter" : (app.triCenter || {}),
          "triDiameter" : (app.triDiameter || 0)
        }, function(err) {
          if (err) {
            save.setState({ error : err });
          }
          else {
            save.setState({ ok : true });
          }
        }
      );

      break;
    }
  }
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
*  Function to pan to the last mark for this session, if one exists
*
****************************************************************************/
function panToLastMark(snap) {
  if (snap.val()) {
    var val = snap.val(),
        keys, bounds;

    // assume that the last key property added is the newest mark
    keys = Object.keys(val.marks);
    if (keys.length === 1) {
      map.panTo({ lat : val.marks[keys[0]].lat, lng : val.marks[keys[0]].lng });
    }
    else if (keys.length >= 2) {
      bounds = new google.maps.LatLngBounds();

      keys.forEach(function(key) {
        bounds.extend(new google.maps.LatLng(val.marks[key].lat, val.marks[key].lng));
      });

      // show everything if there exists triangulated data
      if (val.triCenter) {
        bounds.extend(new google.maps.LatLng(val.triCenter.lat, val.triCenter.lng));
      }

      map.fitBounds(bounds);
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
  db.child(old).child('marks').off('child_added', added);
  db.child(old).child('marks').off('child_removed', removed);
  db.child(old).child('hawkID').off('child_changed', updateHawkID);
  db.child(app.sessionID).child('marks').on('child_added', added);
  db.child(app.sessionID).child('marks').on('child_removed', removed);
  db.child(app.sessionID).child('hawkID').on('child_changed', updateHawkID);
  db.child(app.sessionID).child('hawkID').once('value', updateHawkID);
  db.child(app.sessionID).once('value', panToLastMark);
};

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
  *  Firebase event on saving a new mark, deleting a saved mark, and reading 
  *  the hawkID from the database.
  * 
  ****************************************************************************/
  db.child(app.sessionID).child('marks').on('child_added', added);
  db.child(app.sessionID).child('marks').on('child_removed', removed);
  db.child(app.sessionID).child('hawkID').on('child_changed', updateHawkID);
  db.child(app.sessionID).child('hawkID').once('value', updateHawkID);
  db.child(app.sessionID).once('value', panToLastMark);

}