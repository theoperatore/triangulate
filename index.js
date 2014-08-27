//
// GPS stuff
//
var cvs = document.getElementById('map-canvas'),
    CoordHandler = require('./scripts/save'),
    opts = {},
    curr = {},
    markers = [],
    map,
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

var save  = document.getElementById('saveGPS'),
    find  = document.getElementById('startGPS'),
    clear = document.getElementById('clearPoints');

save.addEventListener('click', function(ev) {
  if (curr.latitude && curr.longitude) {
    var savedMarker = new google.maps.Marker({
      position: new google.maps.LatLng(curr.latitude, curr.longitude),
      icon : {
        url: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|80C54B"
      },
      map : map
    });
    CoordHandler.save(curr.latitude, curr.longitude);
    markers.push(savedMarker);
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
                url: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|80C54B"
              },
              position: new google.maps.LatLng(marker.latitude, marker.longitude),
              map: map
            })
          );
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

  // erase storage
  localStorage.removeItem('points');
}, false);