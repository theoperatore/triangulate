(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//
// GPS stuff
//
var cvs = document.getElementById('map-canvas'),
    CoordHandler = require('./scripts/save'),
    opts = {},
    curr = {},
    markers = [],
    positions = [],
    map,
    center,
    poly,
    cMarker;

cvs.style.width = window.innerWidth + "px";
cvs.style.height = window.innerHeight * 2/3 + "px";

function convertToDMS(coords) {
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

var save  = document.getElementById('saveGPS'),
    find  = document.getElementById('startGPS'),
    clear = document.getElementById('clearPoints'),
    calc  = document.getElementById('calcCenter');

save.addEventListener('click', function(ev) {
  if (curr.latitude && curr.longitude) {
    var savedMarker = new google.maps.Marker({
      position: new google.maps.LatLng(curr.latitude, curr.longitude),
      icon : {
        url: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|80C54B",
        optimized: false
      },
      map : map
    });
    CoordHandler.save(curr.latitude, curr.longitude);
    markers.push(savedMarker);
    positions.push(new google.maps.LatLng(curr.latitude, curr.longitude));
  }
}, false);

find.addEventListener('click', function(ev) {
  cvs.innerHTML = "fetching location...";
  if (navigator && navigator.geolocation) {
    document.getElementById('coords').innerHTML = "updating...";
    if (cMarker) cMarker.setMap(null);
    navigator.geolocation.getCurrentPosition(
      
      // success
      function(loc) {
        console.log(loc.coords.latitude, loc.coords.longitude, loc.coords.accuracy, loc);
        curr.latitude = loc.coords.latitude;
        curr.longitude = loc.coords.longitude;

        opts.mapTypeId = google.maps.MapTypeId.HYBRID;
        opts.zoom = 18;
        opts.center = new google.maps.LatLng(loc.coords.latitude, loc.coords.longitude);
        map = new google.maps.Map(cvs, opts);

        document.getElementById('coords').innerHTML = convertToDMS(loc.coords);
        cMarker = new google.maps.Marker({position: opts.center, map : map});

        //loop through saved Points and show on map
        CoordHandler.load().forEach(function(marker) {
          markers.push(
            new google.maps.Marker({
              icon: {
                url: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|80C54B",
                optimized: false
              },
              position: new google.maps.LatLng(marker.latitude, marker.longitude),
              map: map
            })
          );
          positions.push(new google.maps.LatLng(marker.latitude, marker.longitude));
        });

        /***********************************************************
        /  
        / Event change center
        /
        /***********************************************************/
        
        google.maps.event.addListener(map, 'center_changed', function() {
          
          curr.latitude = map.getCenter().lat();
          curr.longitude = map.getCenter().lng();

          document.getElementById('coords').innerHTML = convertToDMS(curr);
          cMarker.setPosition(map.getCenter());
        });
        

      },

      // error
      function(error) {
        console.log(error);
        cvs.innerHTML = "Error obtaining GPS location from network: " + error.message;
      }, {enableHighAccuracy: true});
  }
  else {
    cvs.innerHTML = "GAH! Geolocation is not supported on this browser. :(";
  }

}, false);

clear.addEventListener('click', function(ev) {
  
  // loop through savedMarkers and remove them from the map
  markers.forEach(function(marker) {
    marker.setMap(null);
  });
  markers.length = 0;
  positions.length = 0;

  if (center) center.setMap(null);
  if (poly) {
    poly.setMap(null);
    poly = null;
  }
  document.getElementById('center').innerHTML = "";

  // erase storage
  localStorage.removeItem('points');
}, false);

calc.addEventListener('click', function() {

  if (markers.length < 2) {
    alert("Must have 2 or more points to find Hawky!");
    return;
  }

  var bounds = new google.maps.LatLngBounds();
  positions.forEach(function(pos) {
    bounds.extend(pos);
  });

  console.log('center exists check...');
  if (!center) {

    console.log('creating new center');
    center = new google.maps.Marker({
      position: bounds.getCenter(),
      icon: {
        url : "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|6929FF"
      },
      map : map
    });
  }
  else {
    console.log('moving existing center');
    center.setPosition(bounds.getCenter());
    center.setMap(map);
  }

  if (poly) {
    poly = null;
  }

  console.log('creating polygon...');
  poly = new google.maps.Polygon({
    paths: positions,
    strokeColor: "#00aeff",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#70d2ff",
    fillOpacity: 0.6
  });

  poly.setMap(map);

  var p = {
    latitude:  bounds.getCenter().lat(),
    longitude: bounds.getCenter().lng()
  };
  document.getElementById('center').innerHTML = convertToDMS(p);

}, false);

},{"./scripts/save":2}],2:[function(require,module,exports){
exports.save = function(lat, lng) {
  "use strict";
  var local = localStorage.getItem('points'),
      points = (local) ? JSON.parse(local) : [],
      out = {};

  out.latitude  = lat;
  out.longitude = lng;
  points.push(out);

  localStorage.setItem('points', JSON.stringify(points));
};

exports.load = function() {
  "use strict";
  var out = localStorage.getItem('points');
  return (out) ? JSON.parse(out) : [];
};
},{}]},{},[1]);
