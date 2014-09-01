//
// Computes the radius of the largest circle that can be drawn inside the
// polygon created by the azimuths
//
exports.computeRadius = function(edges) {
  var area, semiperimeter = 0;

  area = google.maps.geometry.spherical.computeArea(edges);
  for (var i = 0, curr, cp, next, np; i < edges.length; i++) {
    curr = edges[i];
    next = edges[((i+1)%edges.length)];
    semiperimeter += google.maps.geometry.spherical.computeDistanceBetween(curr,next);
  }


  return (2*area) / semiperimeter;
}

//
// Given an array of coordinates, returns the coordinates of the center.
// This algorithm assumes that the points are given in order, either 
// clockwise or counterclockwise.
// 
exports.computeCenter = function(map, edges) {
  var area = x = y = 0, out;

  for (var i = 0, curr, next; i < edges.length; i++) {
    curr = map.getProjection().fromLatLngToPoint(edges[i]);
    next = map.getProjection().fromLatLngToPoint(edges[((i+1)%edges.length)]);

    // sum coords
    x += (curr.x + next.x) * ((curr.x * next.y) - (next.x * curr.y));
    y += (curr.y + next.y) * ((curr.x * next.y) - (next.x * curr.y));

    // sum area
    area += ((curr.x * next.y) - (next.x * curr.y));
  }

  // compute final area
  area *= 0.5;

  // compute final coords
  x *= (1 / (6 * area));
  y *= (1 / (6 * area));

  out = new google.maps.Point(x,y);
  return map.getProjection().fromPointToLatLng(out);
}

//
// Computes the point at which two Polylines intersect by taking both 
// heading LatLng objects, projecting them to Points, then computing
// intersetion by using determinants. 
//
// Returns the corresponding LatLng object of the intersection point.
//
//
// TODO: Should update to sort lines in order clockwise or counter.
//
exports.intersects = function(map, lat1,lat2, lat3,lat4) {
  var bottom, x,y, p1,p2,p3,p4, out;

  // convert LatLng to points
  p1 = map.getProjection().fromLatLngToPoint(lat1);
  p2 = map.getProjection().fromLatLngToPoint(lat2);
  p3 = map.getProjection().fromLatLngToPoint(lat3);
  p4 = map.getProjection().fromLatLngToPoint(lat4);

  bottom = (((p1.x-p2.x)*(p3.y-p4.y)) - ((p1.y-p2.y)*(p3.x-p4.x)));
  x = ((((p1.x*p2.y) - (p1.y*p2.x))*(p3.x - p4.x)) - ((p1.x-p2.x)*((p3.x*p4.y) - (p3.y*p4.x))));
  y = ((((p1.x*p2.y) - (p1.y*p2.x))*(p3.y - p4.y)) - ((p1.y-p2.y)*((p3.x*p4.y) - (p3.y*p4.x))));

  x = x / bottom;
  y = y / bottom;

  out = new google.maps.Point(x,y);
  return map.getProjection().fromPointToLatLng(out);
  
}

//
// Given an origin LatLng object, a heading, and a distance, returns
// an array of two calculated points along the direction of the azimuth
//
exports.computeHeadings = function(origin, azimuth, dist) {
  var positive, negative, dir;
  azimuth = (azimuth >= 360) ? azimuth - 360 : azimuth;

  dir = 180 + azimuth;
  dir = (dir >= 360) ? dir - 360 : dir;

  positive = google.maps.geometry.spherical.computeOffset(origin, dist, azimuth);
  negative = google.maps.geometry.spherical.computeOffset(origin, dist, dir);

  return [positive, negative];
}

//
// param:
//  - coords.latitude
//  - coords.longitude
//
// returns:
//  - string in Degrees, Minutes, Seconds with direction
//
exports.convertToDMS = function(coords) {

  var out = '',
      lat = coords.latitude,
      lng = coords.longitude,
      degLat, degLng, minLat, minLng, secLat, secLng, dirLat, dirLng;

  //latitude - N/S (pos/neg)
  degLat = (lat | 0);
  minLat = (Math.abs(degLat-lat) * 60) | 0;
  secLat = Math.round((Math.abs(degLat-lat) * 3600) - (minLat * 60));
  dirLat = (lat > 0) ? "N" : "S";
  
  degLat = Math.abs(degLat);
  out += degLat + "&deg; " + minLat + "' " + secLat + "\" " + dirLat;

  out += " - ";

  //longitude E/W (pos/neg)
  degLng = (lng | 0);
  minLng = (Math.abs(degLng-lng) * 60) | 0;
  secLng = Math.round((Math.abs(degLng-lng) * 3600) - (minLng * 60));
  dirLng = (lng > 0) ? "E" : "W";

  degLng = Math.abs(degLng);
  out += degLng + "&deg; " + minLng + "' " + secLng + "\" " + dirLng;

  return out;

}

//
// Handles removing a saved marker
//
exports.removeMark = function(marker) {
  "use strick";

  var locals = JSON.parse(localStorage.getItem('points'));
  locals.forEach(function(local, i) {
    console.log('searching', local, marker.__markerID);
    if (local.markerID === marker.__markerID) {
      console.log('found!');
      locals.splice(i, 1);
    }
  });

  localStorage.setItem('points', JSON.stringify(locals));
};

//
// Appends the parameters id, coords, heading, computedOffsets
// to the localStorage item 'points'.
//
// 'points' should only contain the points for locating the current bird
// and should be cleared every time a new bird is being tracked.
//
// 'points' will most likely be deleted when the user saves the computed
// data for the current bird.
//
exports.saveMark = function(markerid, hawkid, coords, heading, proj) {
  "use strict";
  var local = localStorage.getItem('points'),
      points = (local) ? JSON.parse(local) : [],
      out = {};

  out.coords  = coords;
  out.heading = heading;
  out.date = +new Date;
  out.hawkID = hawkid;
  out.markerID = markerid;
  out.computedOffsets = [
    {
      latitude : proj[0].lat(),
      longitude: proj[0].lng()
    },
    {
      latitude : proj[1].lat(),
      longitude: proj[1].lng()
    }
  ];
  points.push(out);
  localStorage.setItem('points', JSON.stringify(points));
};

//
// Saves a properly encoded array. Used when erasing the most recent mark.
//
exports.saveChangedMarks = function(marks) {
  localStorage.setItem('points', JSON.stringify(marks));
}

//
// Loads all of the currently saved 'points' data and returns as
// an array of objects with latitude and longitude properties.
//
// If there isn't a 'points' item then an empty array is returned.
//
exports.loadMarks = function() {
  "use strict";
  var out = localStorage.getItem('points');
  return (out) ? JSON.parse(out) : [];
};

//
// Tells the app to save the currently computer triangulation data for the
// current bird and start tracking a new bird.
//
// Information saved here is a collection of all birds tracked by this user,
// and should be exported as a CSV file for analysis.
//
// param: data -
//  - data.date   : the JS Date time this triangulation was recorded
//  - data.points : an array containing data for each individual mark
//  - data.hawkID : the name of the hawk to save
//  - data.tri    : the triangulated data for this hawk  
//
exports.saveComputedData = function(data) {
  "use strict";
  //localStorage.setItem('computed', JSON.stringify(data));
}

//
// Returns, as an array of objects, all of the saved bird information this
// user has recorded.
//
exports.loadComputedData = function() {
  "use strict";
  return JSON.parse(localStorage.getItem('computed')) || [];
}