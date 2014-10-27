//var Firebase = require('firebase'),
//    db = new Firebase("https://tri-hawk-ulate.firebaseio.com/");

//
// Computes the radius of the largest circle that can be drawn inside the
// polygon created by the azimuths
//
exports.computeRadius = function(edges) {
  var area, semiperimeter = 0;

  area = google.maps.geometry.spherical.computeArea(edges);
  for (var i = 0, curr, next; i < edges.length; i++) {
    curr = edges[i];
    next = edges[((i+1)%edges.length)];
    semiperimeter += google.maps.geometry.spherical.computeDistanceBetween(curr,next);
  }


  return (2 * area) / semiperimeter;
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
// an array of two calculated LatLng objects along the direction of the azimuth
//
exports.computeHeadings = function(origin, azimuth, dist) {
  var positive, negative, dir;
  azimuth = (azimuth >= 360) ? azimuth - 360 : azimuth;

  dir = 180 + azimuth;
  dir = (dir >= 360) ? dir - 360 : dir;

  positive = google.maps.geometry.spherical.computeOffset(origin, dist, azimuth);
  negative = google.maps.geometry.spherical.computeOffset(origin, dist, dir);

  return [negative, positive];
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
      lat = coords.lat(),
      lng = coords.lng(),
      degLat, degLng, minLat, minLng, secLat, secLng, dirLat, dirLng;

  //latitude - N/S (pos/neg)
  degLat = (lat | 0);
  minLat = (Math.abs(degLat-lat) * 60) | 0;
  secLat = Math.round((Math.abs(degLat-lat) * 3600) - (minLat * 60));
  dirLat = (lat > 0) ? "N" : "S";
  
  degLat = Math.abs(degLat);
  out += degLat + "&deg; " + minLat + "' " + secLat + "\" " + dirLat;

  out += " </br> ";

  //longitude E/W (pos/neg)
  degLng = (lng | 0);
  minLng = (Math.abs(degLng-lng) * 60) | 0;
  secLng = Math.round((Math.abs(degLng-lng) * 3600) - (minLng * 60));
  dirLng = (lng > 0) ? "E" : "W";

  degLng = Math.abs(degLng);
  out += degLng + "&deg; " + minLng + "' " + secLng + "\" " + dirLng;

  return out;

}