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
// 
exports.computeCenter = function(map, edges) {
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < edges.length; i++) {
    bounds.extend(edges[i]);
  }

  return bounds.getCenter();
}

//
// Tries to compute the intersection point of two line segments by solving
// a linear combination.
//
// Returns the corresponding LatLng object of the intersection point,
// or false if there is no intersection either by parallel, coincidental, or by
// the intersection not occurring within the line segments.
//
exports.intersectsByLinearAlgebra = function(map, lat1,lat2, lat3,lat4) {
  var bottom, x,y, p1,p2,p3,p4, ua, ub, out;

  // convert LatLng to points
  p1 = map.getProjection().fromLatLngToPoint(lat1);
  p2 = map.getProjection().fromLatLngToPoint(lat2);
  p3 = map.getProjection().fromLatLngToPoint(lat3);
  p4 = map.getProjection().fromLatLngToPoint(lat4);

  bottom = ((p4.y - p3.y) * (p2.x - p1.x)) - ((p4.x - p3.x) * (p2.y - p1.y));

  // parallel lines if bottom is 0
  if (bottom === 0) return false;

  ua = ((p4.x - p3.x) * (p1.y - p3.y)) - ((p4.y - p3.y) * (p1.x - p3.x));
  ub = ((p2.x - p1.x) * (p1.y - p3.y)) - ((p2.y - p1.y) * (p1.x - p3.x));

  ua = ua / bottom;
  ub = ub / bottom;

  if ((0 <= ua && ua <= 1) &&
      (0 <= ub && ub <=1)) 
  {

    x = p1.x + ua * (p2.x - p1.x);
    y = p1.y + ua * (p2.y - p1.y);

    // return the intersection point
    out = new google.maps.Point(x,y);
    return map.getProjection().fromPointToLatLng(out);
  }

  // otherwise, there are no intersections
  return false;  
  
}

//
// Given an origin LatLng object, a heading, and a distance, returns
// a LatLng point projected along the azimuth line a given distance away from
// the origin
//
exports.computePositiveHeading = function(origin, azimuth, dist) {
  var positive, negative, dir;
  azimuth = (azimuth >= 360) ? azimuth - 360 : azimuth;

  dir = 180 + azimuth;
  dir = (dir >= 360) ? dir - 360 : dir;

  positive = google.maps.geometry.spherical.computeOffset(origin, dist, azimuth);

  return positive;
}

//
// param:
//  - coords.latitude
//  - coords.longitude
//
// returns:
//  - html string in Degrees, Minutes, Seconds with direction
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
  out += "</br>";

  return out;

}

//
// changes a google maps LatLng object into Degrees, Minutes, Seconds object
// with properties lat, lng, each returning a string.
//
exports.convertToDMSObject = function(coords) {

  var out = {},
      lat = coords.lat(),
      lng = coords.lng(),
      degLat, degLng, minLat, minLng, secLat, secLng, dirLat, dirLng;

  //latitude - N/S (pos/neg)
  degLat = (lat | 0);
  minLat = (Math.abs(degLat-lat) * 60) | 0;
  secLat = Math.round((Math.abs(degLat-lat) * 3600) - (minLat * 60));
  dirLat = (lat > 0) ? "N" : "S";
  
  degLat = Math.abs(degLat);
  out.lat = degLat + String.fromCharCode(176) + " " + minLat + "' " + secLat + "\" " + dirLat;

  //longitude E/W (pos/neg)
  degLng = (lng | 0);
  minLng = (Math.abs(degLng-lng) * 60) | 0;
  secLng = Math.round((Math.abs(degLng-lng) * 3600) - (minLng * 60));
  dirLng = (lng > 0) ? "E" : "W";

  degLng = Math.abs(degLng);
  out.lng = degLng + String.fromCharCode(176) + " " + minLng + "' " + secLng + "\" " + dirLng;

  return out;

}

// same as convertToDMSObject but accepts latLng literal
exports.convertToDMSFromLiteral = function(lat, lng) {

  var out = {},
      degLat, degLng, minLat, minLng, secLat, secLng, dirLat, dirLng;

  //latitude - N/S (pos/neg)
  degLat = (lat | 0);
  minLat = (Math.abs(degLat-lat) * 60) | 0;
  secLat = Math.round((Math.abs(degLat-lat) * 3600) - (minLat * 60));
  dirLat = (lat > 0) ? "N" : "S";
  
  degLat = Math.abs(degLat);
  out.lat = degLat + String.fromCharCode(176) + " " + minLat + "' " + secLat + "\" " + dirLat;

  //longitude E/W (pos/neg)
  degLng = (lng | 0);
  minLng = (Math.abs(degLng-lng) * 60) | 0;
  secLng = Math.round((Math.abs(degLng-lng) * 3600) - (minLng * 60));
  dirLng = (lng > 0) ? "E" : "W";

  degLng = Math.abs(degLng);
  out.lng = degLng + String.fromCharCode(176) + " " + minLng + "' " + secLng + "\" " + dirLng;

  return out;

}