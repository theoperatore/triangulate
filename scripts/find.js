var curr = new google.maps.Marker(),
    info = new google.maps.InfoWindow(),
    spin = document.getElementById('spinner'),
    glyph= document.getElementById('glyph'),
    div  = document.createElement('div'),
    save = document.createElement('button'),
    modalAzimuth = document.getElementById('modal-azimuth'),
    modalHawkID = document.getElementById('modal-hawkid'),
    modalAzimuthInput = document.getElementById('modal-azimuth-input'),
    modalAzimuthSignal= document.getElementById('modal-azimuth-signal-input'),
    Firebase = require('firebase'),
    db = new Firebase("https://tri-hawk-ulate.firebaseio.com/hawks"),
    util = require('./utilities'),
    app;

// when a user submits an azimuth
function onAzimuthOk() {
  var azStr, az, sig;

  // get azimuth input
  azStr = modalAzimuthInput.value.trim();
  az = parseInt(azStr, 10);

  // validate that it's an integer
  if (isNaN(az) || az === void(0)) {
    alert('Need a valid Azimuth to Tri-hawk-ulate!');
    return;
  }

  // get signal strength
  sig = modalAzimuthSignal.options[modalAzimuthSignal.selectedIndex].value;
  if (sig === "null") {
    alert("Please select a Signal Strength");
    return;
  }

  // validate hawkID one more time in case something crazy unexpected happens
  if (app.hawkID === "") {
    alert("Oh Snap! Enter a HawkID to track and try saving again.");
    modalAzimuth.classList.add('hide');
    modalHawkID.classList.remove('hide');
    return;
  }

  // add new mark to app.marks
  var mark = {};
  mark.lat = curr.getPosition().lat();
  mark.lng = curr.getPosition().lng();
  mark.az  = az;
  mark.sigStr = sig;
  mark.date = +new Date;
  app.marks.push(mark);

  // save marks
  db.child(app.sessionID).update(
    { 
      "marks" : app.marks,
      "hawkID": app.hawkID
    }
  );

  // close modal
  modalAzimuthInput.value = "";
  modalAzimuth.classList.add('hide');
}

function onSave() { 
  console.log('saving location', curr.getPosition().lat(), curr.getPosition().lng());
  modalAzimuth.classList.remove('hide');
}

function onAzimuthCancel() {
  modalAzimuth.classList.add('hide');
}

// attach modal event listeners
document.getElementById('modal-azimuth-ok').addEventListener('click', onAzimuthOk, false);
document.getElementById('modal-azimuth-cancel').addEventListener('click', onAzimuthCancel, false);


// find me button
module.exports = function(btn, m, a, debug) {
  btn.addEventListener('click', function() {
    if (navigator && navigator.geolocation) {

      glyph.classList.toggle('hide');
      spin.classList.toggle('hide');
      m.setZoom(14);

      app = a;

      if (app.hawkID === "") {
        document.getElementById('modal-hawkid').classList.remove('hide');
      }

      google.maps.event.clearListeners(curr, "click");
      google.maps.event.clearListeners(m, "drag");

      // FIND ME!
      navigator.geolocation.getCurrentPosition(

        // success
        function(loc) {
          var pos = new google.maps.LatLng(loc.coords.latitude, loc.coords.longitude),
              dms = util.convertToDMS(pos);

          curr.setPosition(pos);
          curr.setMap(m);

          m.setCenter(pos);

          save.classList.add('sBtn', 'good');
          save.innerHTML = "Save";
          save.removeEventListener('click', onSave, false);
          save.addEventListener('click', onSave, false);

          div.innerHTML = dms;
          div.appendChild(save);

          info.setContent(div);
          info.open(m, curr);

          // allow info window to be opened again if closed
          google.maps.event.addListener(curr, 'click', function() {
            info.open(m, curr);
          });

          // close window when dragging the map
          google.maps.event.addListener(m, 'drag', function() {
            info.close();
          })

          // debug/unlock mode
          if (debug) {
            google.maps.event.clearListeners(m, 'dragend');
            google.maps.event.addListener(m, 'dragend', function() {
              
            curr.setPosition(m.getCenter());
            dms = util.convertToDMS(m.getCenter());

            save.classList.add('sBtn');
            save.classList.add('good');
            save.innerHTML = "Save";
            save.removeEventListener('click', onSave, false);
            save.addEventListener('click', onSave, false);

            div.innerHTML = dms;
            div.appendChild(save);

            info.setContent(div);
              
            });
          }
          
          // let user know GPS is finished
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