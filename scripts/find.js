var curr = new google.maps.Marker(),
    info = new google.maps.InfoWindow(),
    name = document.getElementById('hawkID'),
    spin = document.getElementById('spinner'),
    glyph= document.getElementById('glyph'),
    div  = document.createElement('div'),
    save = document.createElement('button'),
    util = require('./utilities'),
    map;

function onSave() { 
  console.log('saving location', curr.getPosition().lat(), curr.getPosition().lng());
  document.getElementById('modal-azimuth').classList.remove('hide');
}

function onAzimuthOk() {
  
  // get azimuth input

  // save: hawkID { time, location, azimuth }

  // create marker w/ infoWindow delete

  // project azimuth line

  // close modal
  document.getElementById('modal-azimuth').classList.add('hide');
}

function onAzimuthCancel() {
  document.getElementById('modal-azimuth').classList.add('hide');
}

function onHawkIdOk() {
  
  // get hawkid input
  var id = document.getElementById('modal-hawkid-input').value.trim();

  if (id === undefined || id === "") {
    alert('Please enter a valid hawk ID');
    return false;
  }

  // set up hawkID in database

  // set tracking name at top
  name.innerHTML = id;

  // close modal
  document.getElementById('modal-hawkid').classList.add('hide');
}

// attach modal event listeners
document.getElementById('modal-azimuth-ok').addEventListener('click', onAzimuthOk, false);
document.getElementById('modal-azimuth-cancel').addEventListener('click', onAzimuthCancel, false);
document.getElementById('modal-hawkid-ok').addEventListener('click', onHawkIdOk, false);

// find me button
module.exports = function(btn, m) {
  btn.addEventListener('click', function() {

    if (name.innerHTML === "") {
      document.getElementById('modal-hawkid').classList.remove('hide');
    }

    if (navigator && navigator.geolocation) {

      google.maps.event.clearListeners(curr, "click");

      glyph.classList.toggle('hide');
      spin.classList.toggle('hide');
      map = m;

      // FIND ME!
      navigator.geolocation.getCurrentPosition(

        // success
        function(loc) {
          var pos = new google.maps.LatLng(loc.coords.latitude, loc.coords.longitude),
              dms = util.convertToDMS(pos);

          curr.setPosition(pos);
          curr.setMap(map);

          map.setCenter(pos);

          save.classList.add('sBtn');
          save.classList.add('good');
          save.innerHTML = "Save";
          save.removeEventListener('click', onSave, false);
          save.addEventListener('click', onSave, false);

          div.innerHTML = dms;
          div.appendChild(save);

          info.setContent(div);
          info.open(map, curr);

          // allow info window to be opened again if closed
          google.maps.event.addListener(curr, 'click', function() {
            info.open(map, curr);
          });

          glyph.classList.toggle('hide');
          spin.classList.toggle('hide');
        },

        // error
        function(err) {
          if (console.error) {
            alert("Error, check the console for more info: " + err);
            console.error("Error using navigator.getCurrentPosition", err);
            glyph.classList.toggle('hide');
            spin.classList.toggle('hide');
          }
        },

        // options
        { enableHighAccuracy: true });
    }
    else {
      alert("Your browser does not support the GPS function!");
    }

  });
}