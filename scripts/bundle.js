(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//
// Variables for Hawk Triangulation!
//
var cvs   = document.getElementById('map-canvas'),
    //mark  = document.getElementById('saveGPS'),
    find  = document.getElementById('startGPS'),
    clear = document.getElementById('clearPoints'),
    calc  = document.getElementById('calcCenter'),
    save  = document.getElementById('saveCalc'),
    util  = require('./utilities'),
    app   = { currLoc : {} },
    opts  = {
      zoom   : 14,
      azDist : 1609.34
    },
    count = 0,
    version = "0.1.38";

//
// returns an ID for makers
//
function nextID() {
  return ++count;
}

//
// Adds an Info window and handles deleting a marker and azimuth line
//
function addMarkerTooltip(marker, azLine) {
  var infoWindow = new google.maps.InfoWindow({
    content : "<input type='button' id='mark" + marker.__markerID + "' class='superButton bad' value='Delete'>"
  });

  google.maps.event.addListener(marker, 'click', function(ev) {
    infoWindow.open(app.map, marker);
  });

  google.maps.event.addListener(infoWindow, 'domready', function() {
    console.log('dom ready');
    document.getElementById('mark' + marker.__markerID).addEventListener('click', function(ev) {
      
      app.markers.forEach(function(mark, i) {
        if (mark.__markerID === marker.__markerID) {
          mark.setMap(null);
          app.markers.splice(i, 1);
        }
      });

      app.azLines.forEach(function(line, i) {
        if (line.__azLineID === azLine.__azLineID) {
          line.setMap(null);
          app.azLines.splice(i, 1);
        }
      });

      util.removeMark(marker);
      infoWindow.close();

    });
  })
}

//
// 'Find Me' input button
//
find.addEventListener('click', function(ev) {
  if (!app.map) cvs.innerHTML = "fetching location...";
  if (navigator && navigator.geolocation) {
    
    document.getElementById('coords').innerHTML = "updating...";
    navigator.geolocation.getCurrentPosition(
      
      // success
      function(loc) {
        console.log(loc.coords.latitude, loc.coords.longitude, loc.coords.accuracy, loc);

        // keep track of the found high precision points and LatLng object
        app.currLoc.latitude  = loc.coords.latitude;
        app.currLoc.longitude = loc.coords.longitude;
        app.currLatLng = new google.maps.LatLng(loc.coords.latitude, loc.coords.longitude);

        // set up app object
        (app.markers)    ? app.markers.length = 0 : app.markers = [];
        (app.azLines)    ? app.azLines.length = 0 : app.azLines = [];
        (app.intersects) ? app.intersects.length = 0 : app.intersects = [];


        // create map if first time calling 'find me'
        if (!app.map) {

          app.map = new google.maps.Map(cvs, { zoom : opts.zoom, center : app.currLatLng });
          app.currMarker = new google.maps.Marker({position: app.currLatLng, map : app.map});

          //
          // If the user taps on the current Mark, save at that latLng and prompt for az.
          //
          google.maps.event.addListener(app.currMarker, 'click', function() {

            document.getElementById('modal-azimuth').classList.toggle('hide');

          });


          /***********************************************************
          /  
          / Dev event listener to help project points and azimuths
          /
          /***********************************************************/
          
          google.maps.event.addListener(app.map, 'center_changed', function() {
            
            app.currLoc.latitude = app.map.getCenter().lat();
            app.currLoc.longitude = app.map.getCenter().lng();
            app.currLatLng = new google.maps.LatLng(app.currLoc.latitude, app.currLoc.longitude);

            document.getElementById('coords').innerHTML = util.convertToDMS(app.currLoc);
            app.currMarker.setPosition(app.map.getCenter());
          });
          
          
        }

        // ... otherwise just set the new centers
        else {

          app.map.setCenter(app.currLatLng);
          app.currMarker.setPosition(app.currLatLng);

        }

        // set up app tracking by loading marks and ID
        var loadedMarks = util.loadMarks();
        if (loadedMarks.length != 0) {
          loadedMarks.forEach(function(mark) {
            
            var m = new google.maps.Marker({
              icon : {
                url: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|80C54B",
                optimized : false
              },
              position: new google.maps.LatLng(mark.coords.latitude, mark.coords.longitude),
              map : app.map
            });
            m.__hawkHeadings = [
              new google.maps.LatLng(mark.computedOffsets[0].latitude, mark.computedOffsets[0].longitude),
              new google.maps.LatLng(mark.computedOffsets[1].latitude, mark.computedOffsets[1].longitude)
            ];

            
            // draw azimuth projections
            var az = new google.maps.Polyline(
              {
                path : [
                  m.__hawkHeadings[0],
                  m.__hawkHeadings[1]
                ],
                strokeColor: "#00aeff",
                strokeOpacity: 0.8,
                strokeWeight: 4,
                map : app.map
              }
            );

            m.__markerID  = mark.markerID;
            az.__azLineID = mark.markerID;
            count = Math.max(count, mark.markerID);
            app.markers.push(m);
            app.azLines.push(az);
            addMarkerTooltip(m, az);

          });

          //set the id of the hawk
          app.hawkID = loadedMarks[0].hawkID;
        }
        else {

          if (!app.hawkID) {
            //show modal
            document.getElementById('modal-hawkID').classList.toggle('hide');
          }
            
        }

        // tell the user where they are and which hawk they are tracking
        document.getElementById('coords').innerHTML = util.convertToDMS(app.currLoc);
        document.getElementById('hawkID').innerHTML = app.hawkID;
      },

      // error
      function(error) {
        console.log(error);
        cvs.innerHTML = "Error obtaining GPS location from network: " + error.message;
      },
      {enableHighAccuracy: true}
    ); // end navigator
  }
  else {
    cvs.innerHTML = "GAH! Geolocation is not supported on this browser. :(";
  }

}, false);

/*
//
// 'Mark' input button to save the current location
// 
mark.addEventListener('click', function(ev) {
  if (!app.map) {
    alert("GAH! GPS yourself first!");
    return;
  }

  //show modal
  document.getElementById('modal-azimuth').classList.toggle('hide');
}, false);
*/


//
// Triangulate based off of given azimuths
//
calc.addEventListener('click', function() {

  if (app.markers.length < 3) {
    alert("Must have 3 or more points to find " + app.hawkID + "!");
    return;
  }

  
  // Erase all current triangulation data first


  for (var i = 0, curr, next; i < app.markers.length; i++) {
    curr = app.markers[i];
    next = app.markers[((i + 1) % app.markers.length)];

    var intersect = util.intersects(
      app.map,
      curr.__hawkHeadings[0], curr.__hawkHeadings[1],
      next.__hawkHeadings[0], next.__hawkHeadings[1]
    );

    app.intersects.push(intersect);
  }

  // mark intersects with a polygon
  if (!app.azPoly) {
    app.azPoly = new google.maps.Polygon({
      paths: app.intersects,
      strokeColor: "#ff0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#70d2ff",
      fillOpacity: 0.6,
      map : app.map
    });
  }
  else {
    app.azPoly.setPaths(app.intersects);
  }

  // find center of triangulated area
  app.azCenter = util.computeCenter(app.map, app.intersects);
  if (!app.azCenterMarker) {
    app.azCenterMarker = new google.maps.Marker({
      position : app.azCenter,
      map : app.map
    });
  }
  else {
    app.azCenterMarker.setPosition(app.azCenter);
  }

  // inscribe the largest circle inside the polygon
  app.azRadius = util.computeRadius(app.intersects);
  if (!app.azCircle) {
    app.azCircle = new google.maps.Circle({
      center : app.azCenter,
      radius : app.azRadius,
      strokeColor: "#3600b3",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#6929FF",
      fillOpactiy: 0.6,
      map : app.map,
      draggable : true
    });

    //
    // Since finding the center of an irregular polygon using lat/lng is hard,
    // allow user to drag the circle to make sure that the radius is correct
    //
    google.maps.event.addListener(app.azCircle, 'drag', function(ev) {
      app.azCircle.setCenter(ev.latLng);
      app.azCenter = ev.latLng;
      app.azCenterMarker.setPosition(app.azCenter);

      var p = {
        latitude: app.azCenter.lat(),
        longitude: app.azCenter.lng()
      };
      document.getElementById('triangulateResults').innerHTML = util.convertToDMS(p);

    });
  }
  else {
    app.azCircle.setCenter(app.azCenter);
  }

  var p = {
    latitude: app.azCenter.lat(),
    longitude: app.azCenter.lng()
  };
  document.getElementById('triangulateResults').innerHTML = util.convertToDMS(p);
  document.getElementById('circleDiameter').innerHTML = 2*app.azRadius + " Meters";

}, false);

  

//
// Saves computed data for exporting
//
save.addEventListener('click', function() {
  alert("I do nothing! Hurray!");
}, false);

//
// Removes all drawings from the map, and basically resets all hawk vars
//
clear.addEventListener('click', function(ev) {
  
  // remove markers and azimuth lines
  if (app.markers) app.markers.forEach(function(mark) { mark.setMap(null); });
  if (app.azLines) app.azLines.forEach(function(line) { line.setMap(null); });

  // remove triangulated shapes
  if (app.azCircle) app.azCircle.setMap(null);
  if (app.azCenterMarker) app.azCenterMarker.setMap(null);
  if (app.azPoly) app.azPoly.setMap(null);

  // remove hawkID
  app.hawkID = null;

  // reset text display
  document.getElementById('triangulateResults').innerHTML = "";
  document.getElementById('circleDiameter').innerHTML = "";
  document.getElementById('hawkID').innerHTML = "";

  // erase storage
  localStorage.removeItem('points');
}, false);

//
// Modal input event listener for hawkID
//
document.getElementById('modal-hawkID-ok').addEventListener('click', function(ev) {
  var id = document.getElementById('modal-hawkID-input').value;

  if (!id || id === '' || id === ' ') {
    alert('Please enter an ID!');
  }
  else {
    document.getElementById('modal-hawkID').classList.add('hide');
    app.hawkID = id;
    document.getElementById('hawkID').innerHTML = app.hawkID;
    document.getElementById('modal-hawkID-input').value = "";
  }
});

//
// Modal input event listener for canceling
//
document.getElementById('modal-azimuth-cancel').addEventListener('click', function() {
  document.getElementById('modal-azimuth').classList.add('hide');
}, false);

//
// Modal input event listener for computing a mark
//
document.getElementById('modal-azimuth-ok').addEventListener('click', function(ev) {

  // show new mark on map
  hawkMarker = new google.maps.Marker({
    icon : {
      url: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|80C54B",
      optimized : false
    },
    position : app.currLatLng,
    map : app.map
  });

  ev.stopPropagation();
  ev.preventDefault();

  var azimuth = document.getElementById('modal-azimuth-input').value;
  heading = parseInt(azimuth, 10);

  if (!heading || !azimuth || azimuth === '' || azimuth === ' ') {
    alert('Please enter a valid azimuth!');
  }
  else {
    document.getElementById('modal-azimuth').classList.add('hide');

    // use heading to project an azimuth line
    hawkMarker.__hawkHeadings = util.computeHeadings(app.currLatLng, heading, opts.azDist);
    
    // draw azimuth line based on computed headings
    var az = new google.maps.Polyline(
      {
        path : [
          hawkMarker.__hawkHeadings[0],
          hawkMarker.__hawkHeadings[1]
        ],
        strokeColor: "#00aeff",
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map : app.map
      }
    );

    //save shapes
    hawkMarker.__markerID  = nextID();
    az.__azLineID = hawkMarker.__markerID;
    app.markers.push(hawkMarker);
    app.azLines.push(az);
    addMarkerTooltip(hawkMarker, az);


    console.log('adding mark', app.markers.length, app.azLines.length);
    // save mark
    util.saveMark(
      hawkMarker.__markerID,
      app.hawkID,
      app.currLoc,
      heading,
      hawkMarker.__hawkHeadings
    );

    document.getElementById('modal-azimuth-input').value = "";
    return false;
  }
}, false);

// do a little styling quickly for our map
cvs.style.width = window.innerWidth + "px";
cvs.style.height = window.innerHeight * 2/3 + "px";

},{"./utilities":2}],2:[function(require,module,exports){
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
},{}]},{},[1]);
