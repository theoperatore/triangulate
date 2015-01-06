var utils = require('./triUtilities');

// creates and returns a google maps Marker
exports.createMarker = function(lat, lng) {
  var mark = new google.maps.Marker();
  mark.setPosition(new google.maps.LatLng(lat, lng));

  return mark;
}

// creates and returns a google maps Polyline
exports.createPolyline = function(pos, az, dist) {
  var heading = utils.computePositiveHeading(pos, az, dist);
  var line = new google.maps.Polyline({
    path : [pos, heading],
    strokeColor: "#00aeff",
    strokeOpacity: 0.8,
    strokeWeight: 4
  });
  
  return line;
}

// creates and returns a google maps Polygon
exports.createPolygon = function(intersects) {
  var polygon = new google.maps.Polygon({
    paths: intersects,
    strokeColor: "#ff0000",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#70d2ff",
    fillOpacity: 0.6,
  });

  return polygon;
}

// creates and returns a google maps Circle
exports.createCircle = function(center, radius) {

  var circle = new google.maps.Circle({
    center : center,
    radius : radius,
    strokeColor: "#3600b3",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#6929FF",
    fillOpactiy: 0.6,
    draggable : true
  });

  return circle;
}

// creates and returns an InfoWindow for the specified marker
// `this` context is React; see function: componentDidMount()
exports.createInfoWindow = function(marker, az, map, firebasePushID) {
  var info = new google.maps.InfoWindow();
  var div = document.createElement('div');
  var dms = document.createElement('p');
  var azn = document.createElement('p');
  var btnDelete = document.createElement("button");

  btnDelete.classList.add("btn", "btn-danger", "btn-block");
  btnDelete.appendChild(document.createTextNode("Delete"));

  btnDelete.addEventListener('click', function() {

    // delete this mark from firebase
    this.handleMarkerDelete(firebasePushID);

  }.bind(this), false);

  dms.innerHTML = utils.convertToDMS(marker.getPosition());
  azn.innerHTML = "azimuth: " + az;

  div.appendChild(dms);
  div.appendChild(azn);
  div.appendChild(btnDelete);
  info.setContent(div);

  google.maps.event.addListener(marker, "click", function() {
    info.open(map, marker);
  });

  return info;
}

// returns DOM node for info window with DMS
exports.createInfoWindowContent = function(dms) {
  var div = document.createElement("div");
  var node = document.createElement("p");
  var btnSave = document.createElement("button");

  node.innerHTML = dms;

  btnSave.classList.add("btn","btn-success", "btn-block");
  btnSave.appendChild(document.createTextNode("Save"));
  btnSave.addEventListener("click", this.toggleAzimuthModal, false);

  div.classList.add("clearfix");

  div.appendChild(node);
  div.appendChild(btnSave);

  return div;
}