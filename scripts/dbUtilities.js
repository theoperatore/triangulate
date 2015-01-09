var mapUtils = require('./mapUtilities');
var triUtils = require('./triUtilities');

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
function sorting(map, m1, m2) {
  var tmp = this.state.app;
  var p1, p2, origin, s1, s2;

  // if either of the points is the origin mark, don't sort
  if (m1 === tmp.marks[0]) return -1;
  if (m2 === tmp.marks[0]) return  1;

  // get point locations from LatLng objs
  origin = map.getProjection().fromLatLngToPoint(tmp.marks[0].mark.getPosition());
  p1 = map.getProjection().fromLatLngToPoint(m1.mark.getPosition());
  p2 = map.getProjection().fromLatLngToPoint(m2.mark.getPosition());

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
  if (s1  > 0 && s2 <= 0) return -1;
  if (s1 <= 0 && s2  > 0) return  1;

  // both slopes have the same sign, the smaller one gets priority.
  return ((s1 > s2) ? 1 : -1);
}

/****************************************************************************
*
*  Function to triangulate based on saved marks.
*
****************************************************************************/
function triangulate(db, map) {
  var tmp = this.state.app;
  var triInfo = new google.maps.InfoWindow();

  console.log("triangulation engaged");
  tmp.marks.sort(sorting.bind(this, map));

  // find azimuth intersects
  tmp.intersects.length = 0;
  for (var i = 0; i < tmp.marks.length; i++) {
    var curr = tmp.marks[i];
    var next = tmp.marks[((i + 1) % tmp.marks.length)];

    var pos1 = curr.mark.getPosition();
    var pos2 = next.mark.getPosition();
    var heading1 = triUtils.computePositiveHeading(pos1, curr.az, this.state.settings.azDist);
    var heading2 = triUtils.computePositiveHeading(pos2, next.az, this.state.settings.azDist);

    var intersect = triUtils.intersectsByLinearAlgebra(
      map,
      pos1, heading1,
      pos2, heading2
    );

    // only add if valid intersect
    if (intersect === false) continue;
    tmp.intersects.push(intersect);
  }

  // stop triangulating if we don't have a polygon
  if (tmp.intersects.length < 3) return;

  var center = triUtils.computeCenter(map, tmp.intersects);
  var radius = triUtils.computeRadius(tmp.intersects);

  // show results on map
  if (tmp.apiPolygon) tmp.apiPolygon.setMap(null);
  if (tmp.apiCircle) tmp.apiCircle.setMap(null);

  tmp.apiPolygon = mapUtils.createPolygon(tmp.intersects);
  tmp.apiCircle = mapUtils.createCircle(center, radius);
  tmp.apiCMark.setPosition(center);
  tmp.apiPolygon.setMap(map);
  tmp.apiCircle.setMap(map);
  tmp.apiCMark.setMap(map);
  tmp.triCenter = {};
  tmp.triCenter.lat = center.lat();
  tmp.triCenter.lng = center.lng();
  tmp.triDiameter = 2*radius;

  // set up event handlers
  google.maps.event.clearListeners(tmp.apiCircle, "drag");
  google.maps.event.addListener(tmp.apiCircle, "drag", function(ev) {
    tmp.apiCircle.setCenter(ev.latLng);
    tmp.apiCMark.setPosition(ev.latLng);
    triInfo.close();
    triInfo.setContent(triUtils.convertToDMS(center) + "</br>" + (2*radius) + " meters");
  });

  triInfo.setContent(triUtils.convertToDMS(center) + "</br>" + (2*radius) + " meters");
  google.maps.event.clearListeners(tmp.apiCMark, "click");
  google.maps.event.addListener(tmp.apiCMark, "click", function() {
    triInfo.open(map, tmp.apiCMark);
  });

  // save triangulated stuff to db
  this.setState({ saveState : null });
  db.child(tmp.sessionid).update({
    "triDiameter" : 2*radius,
    "triCenter" : {
      lat : center.lat(),
      lng : center.lng()
    }
  }, function(err) {
    if (err) {
      this.setState({ saveState : "error", message : err });
    }
    else {
      this.setState({ saveState : "ok" });
    }
  }.bind(this));

  this.setState({ app : tmp });
}

// called when firebase adds a new mark
exports.add = function(db, map, snap) {
  var tmp = this.state.app;
  var m = snap.val();
  var mark = mapUtils.createMarker(m.lat, m.lng);
  var line = mapUtils.createPolyline(mark.getPosition(), m.az, this.state.settings.azDist);
  var info = mapUtils.createInfoWindow.call(this, mark, m.az, map, snap.key());

  // set map so they display
  mark.setMap(map);
  line.setMap(map);

  // remember markers
  tmp.marks.push({
    mark : mark,
    line : line,
    info : info,
    id : snap.key(),
    az : m.az,
    sig : m.sig,
    date : m.date
  });

  // triangulate if there are enough points
  if (tmp.marks.length >= 3) {
    triangulate.call(this, db, map);
  }

  this.setState({ app : tmp });
}

// called when firebase removes a mark
exports.remove = function(db, map, snap) {
  var tmp = this.state.app;

  // look for match id's which are firebase push keys
  for (var i = 0; i < tmp.marks.length; i++) {
    var curr = tmp.marks[i];

    if (curr.id === snap.key()) {
      curr.mark.setMap(null);
      curr.line.setMap(null);
      curr.info = null;

      tmp.marks.splice(i, 1);

      if (tmp.marks.length >= 3) {
        // triangulate
        triangulate.call(this, db, map);
      }
      else {

        // remove triangulation info because we don't have enough marks anymore
        tmp.intersects.length = 0;
        if (tmp.apiPolygon) tmp.apiPolygon.setMap(null);
        if (tmp.apiCircle) tmp.apiCircle.setMap(null);
        if (tmp.apiCMark) tmp.apiCMark.setMap(null);
        tmp.triCenter = {};
        tmp.triDiameter = -1;
      }

      this.setState({ saveState : null });
      db.child(tmp.sessionid).update(
        { 
          "triCenter" : tmp.triCenter,
          "triDiameter" : tmp.triDiameter || -1
        }, function(err) {
          if (err) {
            this.setState({ saveState : "error", message : err });
          }
          else {
            this.setState({ saveState : "ok" });
          }
        }.bind(this)
      );

      this.setState({ app : tmp });
      break;
    }
  }
}

// called when firebase updates the hawkID
exports.changeHawkid = function(snap) {
  var id = snap.val();
  var tmp = this.state.app;
  tmp.hawkid = id;
  this.setState({ app : tmp });
}

// pans the map to the area of triangulation
// assumes a React context
exports.panToLastMark = function(map, db) {
  var tmp = this.state.app;

  db.child(tmp.sessionid).once("value", function(snapshot) {
    var val = snapshot.val();
    var bounds = new google.maps.LatLngBounds();
    var keys;

    if (val) {
      keys = Object.keys(val.marks);
      keys.forEach(function(key) {
        bounds.extend(new google.maps.LatLng(val.marks[key].lat, val.marks[key].lng));
      });
      
      if (val.triCenter) {
        bounds.extend(new google.maps.LatLng(val.triCenter.lat, val.triCenter.lng));
      }

      map.fitBounds(bounds);
    }
  });
}