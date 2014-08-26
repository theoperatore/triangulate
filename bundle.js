(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var cvs = document.createElement('div'),
    map,
    opts = {};

cvs.style.width = window.innerWidth + "px";
cvs.style.height = window.innerHeight - 25 + "px";
document.body.appendChild(cvs);
document.addEventListener('resize', function() {
  cvs.style.width = window.innerWidth + "px";
  cvs.style.height = window.innerHeight - 25 + "px";
}, false);

cvs.innerHTML = "fetching location...";

if (navigator && navigator.geolocation) {
  var pos = navigator.geolocation.getCurrentPosition(
    // success
    function(loc) {
      console.log(loc.coords.latitude, loc.coords.longitude, loc.coords.accuracy, loc);
      opts.mapTypeId = google.maps.MapTypeId.HYBRID;
      opts.zoom = 18;
      opts.center = new google.maps.LatLng(loc.coords.latitude, loc.coords.longitude);
      map = new google.maps.Map(cvs, opts);

      var locOut = document.createElement('p');
      locOut.innerHTML = convertToDMS(loc.coords);
      document.body.appendChild(locOut);

    },
    function(error) {
      console.log(error);
      cvs.innerHTML = "Error obtaining GPS location from network: " + error.message;
    }, {enableHighAccuracy: true});
}
else {
  cvs.innerHTML = "GAH! Geolocation is not supported on this browser. :(";
}


function convertToDMS(coords) {
  var out = '',
      lat = coords.latitude,
      lng = coords.longitude,
      degLat = 0,
      degLng = 0,
      minLat = 0,
      minLng = 0,
      secLat = 0,
      secLng = 0,
      dirLat,
      dirLng;

  //latitude - N/S (pos/neg)
  degLat = (lat | 0);
  minLat = (Math.abs(degLat-lat) * 60) | 0;
  secLat = Math.round((Math.abs(degLat-lat) * 3600) - (minLat * 60));
  dirLat = (lat > 0) ? "N" : "S";
  
  degLat = Math.abs(degLat);
  out += degLat + "&deg; " + minLat + "' " + secLat + "\" " + dirLat;

  out += " -- ";

  //longitude E/W (pos/neg)
  degLng = (lng | 0);
  minLng = (Math.abs(degLng-lng) * 60) | 0;
  secLng = Math.round((Math.abs(degLng-lng) * 3600) - (minLng * 60));
  dirLng = (lng > 0) ? "E" : "W";

  degLng = Math.abs(degLng);
  out += degLng + "&deg; " + minLng + "' " + secLng + "\" " + dirLng;

  return out;
}
},{}]},{},[1]);
