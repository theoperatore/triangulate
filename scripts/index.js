//
// Variables for Hawk Triangulation!
//
var cvs   = document.getElementById('map-canvas'),
    mark  = document.getElementById('saveGPS'),
    find  = document.getElementById('startGPS'),
    clear = document.getElementById('clearPoints'),
    calc  = document.getElementById('calcCenter'),
    save  = document.getElementById('saveCalc'),
    erase = document.getElementById('clearMostRecent'),
    util  = require('./utilities'),
    app   = { currLoc : {} },
    opts  = {
      zoom   : 14,
      azDist : 1609.34
    },
    count = 0;

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
  alert("I do nothing! However, in the future I will save all calculated data per individual hawk. Hurray!");
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
// Clears the most recent mark from the screen and local storage
//
erase.addEventListener('click', function(ev) {

  if (app.markers && app.azLines && app.markers.length !== 0 && app.azLines.length !== 0) {
    app.markers[app.markers.length - 1].setMap(null);
    app.azLines[app.azLines.length - 1].setMap(null);

    app.markers.splice(app.markers.length - 1);
    app.azLines.splice(app.azLines.length - 1);

    var tmp = util.loadMarks();
    tmp.splice(tmp.length - 1);

    util.saveChangedMarks(tmp);
  }


},false);

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

  }
});

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

    return false;
  }
}, false);

// do a little styling quickly for our map
cvs.style.width = window.innerWidth + "px";
cvs.style.height = window.innerHeight * 2/3 + "px";
